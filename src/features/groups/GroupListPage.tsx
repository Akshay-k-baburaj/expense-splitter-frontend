import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { GroupResponse } from "../../types/group";
import { getGroupErrorMessage, getGroupsForCurrentUser, joinGroupByCode } from "./groupService";

export default function GroupListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);
  const [groups, setGroups] = useState<GroupResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const notice = typeof location.state?.notice === "string" ? location.state.notice : "";

  useEffect(() => {
    const controller = new AbortController();
    getGroupsForCurrentUser(controller.signal)
      .then(setGroups)
      .catch((requestError: unknown) => { if (!controller.signal.aborted) setError(getGroupErrorMessage(requestError)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  async function joinByCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(inviteCode)) {
      setJoinError("Enter the 6-digit code shared by a group member.");
      return;
    }
    setJoinError("");
    setJoining(true);
    try {
      const group = await joinGroupByCode(inviteCode);
      navigate(`/groups/${group.id}`, { state: { notice: `You joined “${group.groupName}”.` } });
    } catch (requestError: unknown) {
      setJoinError(getGroupErrorMessage(requestError, "membership"));
    } finally {
      setJoining(false);
    }
  }

  return (
    <main className="page-content groups-page">
      <div className="groups-page-heading">
        <div>
          <p className="eyebrow">Shared plans, clearly kept</p>
          <h1 className="compact-title">Your groups<span className="title-period">.</span></h1>
          <p className="intro-copy">All the people and plans you share, in one place.</p>
        </div>
        <Link className="create-group-link" to="/groups/new"><span aria-hidden="true">＋</span> Create a group</Link>
      </div>
      <section className="group-list-panel" aria-labelledby="groups-title">
        <div className="section-heading">
          <div><p className="eyebrow">Your shared spaces</p><h2 id="groups-title">Groups <span className="group-total">{groups?.length ?? "—"}</span></h2></div>
        </div>
        {notice && <p className="form-success" role="status">{notice}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {loading && <p className="loading-state" role="status">Gathering your groups…</p>}
        {groups && groups.length === 0 && !loading && <div className="empty-state group-empty-state"><span className="empty-state-mark" aria-hidden="true">＋</span><p className="empty-title">Start with your people.</p><p>Create a group for a trip, a home, or any plan you share. You can add members once it’s set up.</p><Link className="create-group-link" to="/groups/new">Create your first group <span aria-hidden="true">↗</span></Link></div>}
        {groups && groups.length > 0 && (
          <div className="group-card-grid" aria-label="Groups for this user">
            {groups.map((group) => (
              <Link className="group-card" key={group.id} to={`/groups/${group.id}`}>
                <span className="group-card-top"><span className="group-card-top-details"><span className="group-card-id">GROUP {group.id.toString().padStart(2, "0")}</span><span className="group-card-currency">{group.currencyCode}</span></span><span className="group-card-arrow" aria-hidden="true">↗</span></span>
                <strong>{group.groupName}</strong>
                <span className="group-card-description">{group.description || "Your shared space is ready."}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
      <form className="open-group-strip" onSubmit={joinByCode} noValidate>
        <div className="open-group-copy"><span className="open-group-icon" aria-hidden="true">＋</span><div><strong>Have a group code?</strong><span>Enter the 6-digit code shared by a member to join.</span></div></div>
        <div className="open-group-controls">
          <label className="visually-hidden" htmlFor="group-invite-code">Group invite code</label>
          <input id="group-invite-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={inviteCode} onChange={(event) => { setInviteCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setJoinError(""); }} aria-invalid={Boolean(joinError)} aria-describedby={joinError ? "group-code-error" : "group-code-help"} />
          <button className="secondary-button" type="submit" disabled={joining}>{joining ? "Joining…" : "Join group"}</button>
        </div>
        {joinError ? <p id="group-code-error" className="field-error open-group-error" role="alert">{joinError}</p> : <span id="group-code-help" className="visually-hidden">Enter six digits.</span>}
      </form>
    </main>
  );
}
