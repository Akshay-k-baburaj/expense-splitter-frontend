import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useOutletContext } from 'react-router-dom';
import type { AuthenticatedOutletContext } from '../../App';
import type { GroupMemberResponse, GroupResponse } from '../../types/group';
import GroupWorkspaceHeader from './GroupWorkspaceHeader';
import GroupForm from './GroupForm';
import type { GroupFormValues } from './groupSchema';
import { createGroupInviteCode, deleteGroup, getGroupById, getGroupErrorMessage, getGroupInviteStatus, getGroupMembers, removeGroupMember, transferGroupOwnership, updateGroup } from './groupService';

function parseId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export default function GroupSettingsPage() {
  const { groupId: rawId } = useParams();
  const navigate = useNavigate();
  const { profile } = useOutletContext<AuthenticatedOutletContext>();
  const groupId = parseId(rawId);
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [members, setMembers] = useState<GroupMemberResponse[]>([]);
  const [inviteStatus, setInviteStatus] = useState<{ active: boolean; expiresAt: string | null } | null>(null);
  const [newCode, setNewCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (groupId === null) return;
    const controller = new AbortController();
    void Promise.all([getGroupById(groupId, controller.signal), getGroupMembers(groupId, controller.signal)])
      .then(async ([loadedGroup, loadedMembers]) => {
        if (controller.signal.aborted) return;
        setGroup(loadedGroup);
        setMembers(loadedMembers);
        if (loadedGroup.viewerIsOwner) {
          try { setInviteStatus(await getGroupInviteStatus(groupId, controller.signal)); }
          catch (requestError: unknown) { if (!controller.signal.aborted) setError(getGroupErrorMessage(requestError)); }
        }
      })
      .catch((requestError: unknown) => { if (!controller.signal.aborted) setError(getGroupErrorMessage(requestError)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [groupId]);

  async function saveDetails(values: GroupFormValues) {
    if (groupId === null) return;
    setError(''); setNotice('');
    try { setGroup(await updateGroup(groupId, values)); setNotice('Group details saved.'); }
    catch (requestError: unknown) { setError(getGroupErrorMessage(requestError, 'save')); }
  }

  async function generateCode() {
    if (groupId === null) return;
    setSavingCode(true); setError(''); setNotice(''); setNewCode('');
    try {
      const invite = await createGroupInviteCode(groupId);
      setNewCode(invite.code);
      setInviteStatus({ active: true, expiresAt: invite.expiresAt });
      setNotice('New group code created. Share it with the people you want to join.');
    } catch (requestError: unknown) { setError(getGroupErrorMessage(requestError, 'save')); }
    finally { setSavingCode(false); }
  }

  async function copyCode() {
    try { await navigator.clipboard.writeText(newCode); setNotice('Group code copied.'); }
    catch { setNotice('Select and copy the code to share it.'); }
  }

  async function changeOwner(member: GroupMemberResponse) {
    if (groupId === null || !window.confirm(`Transfer ownership to ${member.username}? You will remain a member.`)) return;
    setError(''); setNotice('');
    try {
      const updated = await transferGroupOwnership(groupId, member.userId);
      setGroup(updated);
      setMembers((current) => current.map((item) => ({ ...item, owner: item.userId === member.userId })));
      setNotice(`Ownership transferred to ${member.username}.`);
    } catch (requestError: unknown) { setError(getGroupErrorMessage(requestError, 'membership')); }
  }

  async function removeMember(member: GroupMemberResponse) {
    if (groupId === null || !window.confirm(`Remove ${member.username} from ${group?.groupName ?? 'this group'}?`)) return;
    setBusyMemberId(member.userId); setError(''); setNotice('');
    try {
      await removeGroupMember(groupId, member.userId);
      if (member.userId === profile.id) {
        navigate('/groups', { state: { notice: `You left “${group?.groupName ?? 'the group'}”.` } });
        return;
      }
      setMembers((current) => current.filter((item) => item.userId !== member.userId));
      setNotice(`${member.username} was removed from the group.`);
    } catch (requestError: unknown) { setError(getGroupErrorMessage(requestError, 'membership')); }
    finally { setBusyMemberId(null); }
  }

  async function deleteThisGroup() {
    if (groupId === null || !group || !window.confirm(`Permanently delete “${group.groupName}” and all its related group records? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteGroup(groupId);
      navigate('/groups', { state: { notice: `Group “${group.groupName}” was deleted.` } });
    } catch (requestError: unknown) { setError(getGroupErrorMessage(requestError, 'save')); }
  }

  if (groupId === null) return <main className="page-content"><p className="form-error" role="alert">Invalid group ID.</p><Link className="back-link" to="/groups">← All groups</Link></main>;
  if (loading) return <main className="page-content"><p className="loading-state" role="status">Loading group settings…</p></main>;
  if (error && !group) return <main className="page-content"><p className="form-error" role="alert">{error}</p><Link className="back-link" to="/groups">← All groups</Link></main>;
  if (!group) return null;

  return <main className="page-content group-settings-page">
    <GroupWorkspaceHeader group={group} active="settings" />
    <Link className="back-link group-back-link" to={`/groups/${group.id}`}>← Back to expenses</Link>
    <header className="settings-page-heading"><div><p className="eyebrow">{group.groupName}</p><h1 className="compact-title">Settings<span className="title-period">.</span></h1><p className="intro-copy">Manage the group details, membership, and invite code.</p></div><span className="group-access-pill settings-role">{group.viewerIsOwner ? 'Owner' : 'Member'}</span></header>
    {notice && <p className="form-success settings-notice" role="status">{notice}</p>}
    {error && <p className="form-error settings-notice" role="alert">{error}</p>}
    <div className="settings-grid">
      <div className="settings-main-column">
        <section className="content-panel settings-card" aria-labelledby="details-heading">
          <div className="panel-heading"><div><p className="eyebrow">Group profile</p><h2 id="details-heading">Details</h2></div></div>
          {group.viewerIsOwner
            ? <><GroupForm initialValues={{ groupName: group.groupName, description: group.description ?? '', currencyCode: group.currencyCode }} submitLabel="Save changes" onSave={saveDetails} errorMessage="" /><p className="field-help settings-currency-note">Group currency: <strong>{group.currencyCode}</strong>. It stays fixed to protect existing expense and settlement records.</p></>
            : <div className="settings-readonly"><strong>{group.groupName}</strong><p>{group.description || 'No group description.'}</p><span>Only the owner can edit these details.</span></div>}
        </section>
        <section className="content-panel settings-card" aria-labelledby="members-heading">
          <div className="panel-heading"><div><p className="eyebrow">People in this space</p><h2 id="members-heading">Members</h2></div><span className="member-count">{members.length} {members.length === 1 ? 'member' : 'members'}</span></div>
          <ul className="member-list settings-member-list">{members.map((member) => <li className="member-row" key={member.userId}>
            <span className="member-avatar" aria-hidden="true">{member.username.slice(0, 2).toUpperCase()}</span>
            <span className="member-info"><strong>{member.username}{member.owner ? ' · Owner' : ''}</strong><span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span></span>
            {group.viewerIsOwner && !member.owner && <div className="member-actions"><button className="member-action" type="button" onClick={() => void changeOwner(member)}>Make owner</button><button className="member-action member-action-danger" type="button" disabled={busyMemberId !== null} onClick={() => void removeMember(member)}>{busyMemberId === member.userId ? 'Removing…' : 'Remove'}</button></div>}
          </li>)}</ul>
          {!group.viewerIsOwner && <><p className="settings-member-note">Ask the group owner to add or remove members.</p><button className="member-action member-action-danger leave-group-button" type="button" onClick={() => { const current = members.find((member) => member.userId === profile.id); if (current) void removeMember(current); }}>Leave this group</button></>}
          {group.viewerIsOwner && <p className="settings-member-note">Share the invite code so people can join securely. Existing members can be managed here.</p>}
        </section>
      </div>
      <aside className="settings-side-column">
        <section className="invite-settings-card" aria-labelledby="invite-heading">
          <p className="eyebrow">Share access</p><h2 id="invite-heading">Group invite code</h2>
          {group.viewerIsOwner ? <>
            <p>Create a six-digit code that works for seven days. Creating a new code replaces the previous one.</p>
            {newCode ? <div className="generated-code"><span>Share this code</span><strong>{newCode}</strong><button type="button" className="secondary-button" onClick={() => void copyCode()}>Copy code</button></div>
              : inviteStatus?.active ? <p className="invite-expiry">A code is active until <strong>{new Date(inviteStatus.expiresAt!).toLocaleString()}</strong>. The code is only shown when created. Generate a new one to share.</p>
                : <p className="invite-expiry">No active invite code. Create one when you’re ready to invite people.</p>}
            <button className="primary-button" type="button" disabled={savingCode} onClick={() => void generateCode()}>{savingCode ? 'Creating…' : inviteStatus?.active ? 'Replace invite code' : 'Create invite code'}</button>
          </> : <p>The group owner can create and share an invite code. You can join other groups from the Groups page.</p>}
        </section>
        {group.viewerIsOwner && <section className="settings-danger-card" aria-labelledby="delete-group-heading"><p className="eyebrow">Permanent action</p><h2 id="delete-group-heading">Delete group</h2><p>Deleting this group permanently removes its expenses, settlements, and membership history.</p><button className="danger-button" type="button" onClick={() => void deleteThisGroup()}>Delete this group</button></section>}
      </aside>
    </div>
  </main>;
}
