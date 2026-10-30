import { useEffect, useState } from 'react';
import { Link, useParams, useOutletContext } from 'react-router-dom';
import type { AuthenticatedOutletContext } from '../../App';
import type { GroupResponse, GroupMemberResponse } from '../../types/group';
import type { GroupBalanceResponse, SettlementResponse } from '../../types/expense';
import GroupWorkspaceHeader from './GroupWorkspaceHeader';
import { getGroupById, getGroupMembers } from './groupService';
import { createGroupSettlement, deleteGroupSettlement, getFinancialErrorMessage, getGroupBalances, getGroupSettlements } from './financialService';
import { currencyFractionDigits, currencySymbol, formatCurrency } from '../../utils/currency';

function parseGroupId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function money(amount: number, currency: string, preserveSign = false) {
  return formatCurrency(preserveSign ? amount : Math.abs(amount), currency);
}

export default function GroupBalancesPage() {
  const { groupId: rawId } = useParams();
  const groupId = parseGroupId(rawId);
  const { profile } = useOutletContext<AuthenticatedOutletContext>();
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [members, setMembers] = useState<GroupMemberResponse[]>([]);
  const [balances, setBalances] = useState<GroupBalanceResponse | null>(null);
  const [settlements, setSettlements] = useState<SettlementResponse[]>([]);
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (groupId === null) return;
    const controller = new AbortController();
    void Promise.all([
      getGroupById(groupId, controller.signal), getGroupMembers(groupId, controller.signal),
      getGroupBalances(groupId, controller.signal), getGroupSettlements(groupId, controller.signal),
    ]).then(([loadedGroup, loadedMembers, loadedBalances, loadedSettlements]) => {
      if (controller.signal.aborted) return;
      setGroup(loadedGroup); setMembers(loadedMembers); setBalances(loadedBalances); setSettlements(loadedSettlements);
    }).catch((requestError: unknown) => { if (!controller.signal.aborted) setError(getFinancialErrorMessage(requestError)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [groupId]);

  async function refresh() {
    if (groupId === null) return;
    const [loadedBalances, loadedSettlements] = await Promise.all([getGroupBalances(groupId), getGroupSettlements(groupId)]);
    setBalances(loadedBalances); setSettlements(loadedSettlements);
  }

  function applySuggestion(fromId: number, toId: number, suggestedAmount: number) {
    if (fromId !== profile.id) return;
    const scale = balances ? currencyFractionDigits(balances.currency) : 2;
    setReceiverId(String(toId)); setAmount(suggestedAmount.toFixed(scale)); setError(''); setNotice('');
  }

  async function recordSettlement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (groupId === null) return;
    const receiver = Number(receiverId);
    const value = Number(amount);
    const scale = balances ? currencyFractionDigits(balances.currency) : 2;
    const amountPattern = new RegExp(`^\\d{1,10}${scale > 0 ? `(?:\\.\\d{1,${scale}})?` : ''}$`);
    if (!Number.isSafeInteger(receiver) || receiver <= 0 || !Number.isFinite(value) || value <= 0 || !amountPattern.test(amount)) {
      setError(`Choose a member you owe and enter a valid amount in ${balances?.currency ?? 'the group currency'}.`); return;
    }
    if (!window.confirm(`Record that you paid ${money(value, balances?.currency ?? 'INR')} to ${members.find((member) => member.userId === receiver)?.username ?? 'this member'}? Only confirm after the payment was made.`)) return;
    setSaving(true); setError(''); setNotice('');
    try {
      await createGroupSettlement(groupId, { receiverId: receiver, amount: value });
      await refresh(); setReceiverId(''); setAmount(''); setNotice('Payment recorded. Group balances were recalculated.');
    } catch (requestError: unknown) { setError(getFinancialErrorMessage(requestError)); }
    finally { setSaving(false); }
  }

  async function undoSettlement(settlement: SettlementResponse) {
    if (groupId === null || !window.confirm(`Remove the payment record of ${money(settlement.amount, settlement.currency)} to ${settlement.receiverUsername}?`)) return;
    setError(''); setNotice('');
    try {
      await deleteGroupSettlement(groupId, settlement.id); await refresh(); setNotice('Payment record removed. Balances were recalculated.');
    } catch (requestError: unknown) { setError(getFinancialErrorMessage(requestError)); }
  }

  if (groupId === null) return <main className="page-content"><p className="form-error" role="alert">Invalid group ID.</p><Link className="back-link" to="/groups">← All groups</Link></main>;
  if (loading) return <main className="page-content"><p className="loading-state" role="status">Calculating group balances…</p></main>;
  if (!group || !balances) return <main className="page-content"><p className="form-error" role="alert">{error || 'This group is unavailable.'}</p><Link className="back-link" to="/groups">← All groups</Link></main>;
  const mine = balances.members.find((member) => member.userId === profile.id)?.netBalance ?? 0;
  const owedToMe = balances.members.filter((member) => member.netBalance > 0);

  return <main className="page-content group-balances-page">
    <GroupWorkspaceHeader group={group} active="balances" />
    {notice && <p className="form-success group-notice" role="status">{notice}</p>}
    {error && <p className="form-error group-notice" role="alert">{error}</p>}
    <section className="balance-hero-card" aria-label="Your current group balance">
      <div><p className="eyebrow">Your position · {balances.currency}</p><span>{mine < 0 ? 'You owe' : mine > 0 ? 'You are owed' : 'You’re all settled'}</span><strong>{money(mine, balances.currency, true)}</strong></div>
      <p>Positive balances mean the group owes you. Negative balances mean you owe the group.</p>
    </section>
    <div className="balance-content-grid">
      <section className="content-panel balance-members-panel" aria-labelledby="balance-members-heading">
        <div className="panel-heading"><div><p className="eyebrow">After expenses and recorded payments</p><h2 id="balance-members-heading">Group balances</h2></div></div>
        <ul className="balance-member-list">{balances.members.map((member) => <li className="balance-member-row" key={member.userId}>
          <span className="member-avatar" aria-hidden="true">{member.username.slice(0, 2).toUpperCase()}</span><span className="member-info"><strong>{member.username}{member.userId === profile.id ? ' · You' : ''}</strong><span>{member.netBalance > 0 ? 'Is owed' : member.netBalance < 0 ? 'Owes' : 'Settled up'}</span></span>
          <strong className={member.netBalance > 0 ? 'balance-positive' : member.netBalance < 0 ? 'balance-negative' : 'balance-zero'}>{money(member.netBalance, balances.currency, true)}</strong>
        </li>)}</ul>
          <div className="suggestions-block"><p className="eyebrow">Suggested payment plan · {balances.suggestedSettlements.length} {balances.suggestedSettlements.length === 1 ? 'payment' : 'payments'}</p>{balances.suggestedSettlements.length === 0 ? <p className="settled-note">Everyone is settled up. Add expenses as you go.</p> : <><p className="field-help settlement-plan-help">These transfers are matched against the largest balances first. Record each only after it has been paid; the plan updates as balances change.</p><ul className="suggestion-list">{balances.suggestedSettlements.map((suggestion) => <li key={`${suggestion.fromUserId}-${suggestion.toUserId}`}><span><strong>{suggestion.fromUserId === profile.id ? 'You' : suggestion.fromUsername}</strong> pays <strong>{suggestion.toUserId === profile.id ? 'you' : suggestion.toUsername}</strong></span><b>{money(suggestion.amount, balances.currency)}</b>{suggestion.fromUserId === profile.id && <button className="member-action" type="button" onClick={() => applySuggestion(suggestion.fromUserId, suggestion.toUserId, suggestion.amount)}>Record payment</button>}</li>)}</ul></>}</div>
      </section>
      <div className="settlement-side-column">
        <section className="content-panel settlement-form-panel" aria-labelledby="settlement-heading">
          <p className="eyebrow">When money changes hands</p><h2 id="settlement-heading">Record a payment</h2>
          {mine >= 0 ? <p className="field-help">You don’t currently owe a member in this group.</p> : <form className="settlement-form" onSubmit={recordSettlement}>
            <div className="form-field"><label htmlFor="settlement-to">Paid to</label><select id="settlement-to" value={receiverId} onChange={(event) => setReceiverId(event.target.value)} required><option value="">Choose a member</option>{owedToMe.filter((member) => member.userId !== profile.id).map((member) => <option key={member.userId} value={member.userId}>{member.username}</option>)}</select></div>
            <div className="form-field"><label htmlFor="settlement-amount">Amount paid · {balances.currency}</label><div className="money-input"><span aria-hidden="true">{currencySymbol(balances.currency)}</span><input id="settlement-amount" type="number" min={1 / (10 ** currencyFractionDigits(balances.currency))} step={1 / (10 ** currencyFractionDigits(balances.currency))} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" required /></div></div>
            <p className="field-help">This records a payment that has already happened; it does not transfer money.</p>
            <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Recording…' : 'Record payment'}</button>
          </form>}
        </section>
        <section className="content-panel settlement-history-panel" aria-labelledby="settlement-history-heading">
          <div className="panel-heading"><div><p className="eyebrow">Payment history</p><h2 id="settlement-history-heading">Settlements</h2></div></div>
          {settlements.length === 0 ? <p className="settled-note">No payments have been recorded yet.</p> : <ul className="settlement-list">{settlements.map((settlement) => <li key={settlement.id}><span className="settlement-date">{new Date(settlement.createdAt).toLocaleDateString()}</span><span><strong>{settlement.payerId === profile.id ? 'You' : settlement.payerUsername}</strong> paid <strong>{settlement.receiverId === profile.id ? 'you' : settlement.receiverUsername}</strong></span><b>{money(settlement.amount, settlement.currency)}</b>{settlement.payerId === profile.id && <button className="member-action member-action-danger" type="button" onClick={() => void undoSettlement(settlement)}>Undo</button>}</li>)}</ul>}
        </section>
      </div>
    </div>
  </main>;
}
