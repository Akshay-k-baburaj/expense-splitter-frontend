import { useEffect, useState } from 'react';
import { Link, useParams, useOutletContext } from 'react-router-dom';
import type { AuthenticatedOutletContext } from '../../App';
import type { ExpenseRequest, ExpenseResponse, GroupBalanceResponse } from '../../types/expense';
import type { GroupMemberResponse, GroupResponse } from '../../types/group';
import GroupWorkspaceHeader from './GroupWorkspaceHeader';
import { getGroupErrorMessage, getGroupMembers, getGroupById } from './groupService';
import { createGroupExpense, deleteGroupExpense, getFinancialErrorMessage, getGroupBalances, getGroupExpenses, updateGroupExpense } from './financialService';
import { currencyFractionDigits, currencySymbol, formatCurrency } from '../../utils/currency';

function parseGroupId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export default function GroupDetailsPage() {
  const { groupId: rawId } = useParams();
  const groupId = parseGroupId(rawId);
  const { profile } = useOutletContext<AuthenticatedOutletContext>();
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [members, setMembers] = useState<GroupMemberResponse[]>([]);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [balances, setBalances] = useState<GroupBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [splitMode, setSplitMode] = useState<'EQUAL' | 'CUSTOM'>('EQUAL');
  const [participantAmounts, setParticipantAmounts] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseResponse | null>(null);

  useEffect(() => {
    if (groupId === null) return;
    const controller = new AbortController();
    void Promise.all([
      getGroupById(groupId, controller.signal),
      getGroupMembers(groupId, controller.signal),
      getGroupExpenses(groupId, controller.signal),
      getGroupBalances(groupId, controller.signal),
    ]).then(([loadedGroup, loadedMembers, loadedExpenses, loadedBalances]) => {
      if (controller.signal.aborted) return;
      setGroup(loadedGroup);
      setMembers(loadedMembers);
      setExpenses(loadedExpenses);
      setBalances(loadedBalances);
      setSelectedIds(loadedMembers.filter((member) => member.username !== 'Former member').map((member) => member.userId));
    }).catch((requestError: unknown) => {
      if (!controller.signal.aborted) setError(getFinancialErrorMessage(requestError) || getGroupErrorMessage(requestError));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [groupId]);

  async function refreshFinancials() {
    if (groupId === null) return;
    const [loadedExpenses, loadedBalances] = await Promise.all([getGroupExpenses(groupId), getGroupBalances(groupId)]);
    setExpenses(loadedExpenses);
    setBalances(loadedBalances);
  }

  function startEditing(expense: ExpenseResponse) {
    setEditingExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount.toFixed(2));
    setSelectedIds(expense.splits.map((split) => split.userId));
    setSplitMode(expense.splitType);
    setParticipantAmounts(expense.splitType === 'CUSTOM' ? Object.fromEntries(expense.splits.map((split) => [split.userId, split.amount.toFixed(currencyFractionDigits(expense.currency))])) : {});
    setError(''); setNotice('');
  }

  function resetExpenseForm() {
    setEditingExpense(null); setDescription(''); setAmount('');
    setSelectedIds(members.filter((member) => member.username !== 'Former member').map((member) => member.userId));
    setSplitMode('EQUAL'); setParticipantAmounts({});
  }

  function setEqualSplitDraft(total: string, userIds: number[]) {
    const scale = group ? currencyFractionDigits(group.currencyCode) : 2;
    const unit = 10 ** scale;
    const totalUnits = Math.round((Number(total) || 0) * unit);
    const orderedIds = [...userIds].sort((a, b) => a - b);
    const baseUnits = orderedIds.length ? Math.floor(totalUnits / orderedIds.length) : 0;
    const remainder = orderedIds.length ? totalUnits % orderedIds.length : 0;
    setParticipantAmounts(Object.fromEntries(orderedIds.map((id, index) => [id, ((baseUnits + (index < remainder ? 1 : 0)) / unit).toFixed(scale)])));
  }

  function changeSplitMode(mode: 'EQUAL' | 'CUSTOM') {
    setSplitMode(mode);
    if (mode === 'CUSTOM') setEqualSplitDraft(amount, selectedIds);
    else setParticipantAmounts({});
  }

  function toggleParticipant(userId: number, selected: boolean) {
    setSelectedIds((current) => selected ? [...current, userId] : current.filter((id) => id !== userId));
    if (splitMode === 'CUSTOM') {
      setParticipantAmounts((current) => selected ? { ...current, [userId]: '' } : Object.fromEntries(Object.entries(current).filter(([id]) => Number(id) !== userId)));
    }
  }

  async function saveExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (groupId === null) return;
    const numericAmount = Number(amount);
    const scale = group ? currencyFractionDigits(group.currencyCode) : 2;
    const amountPattern = new RegExp(`^\\d{1,10}${scale > 0 ? `(?:\\.\\d{1,${scale}})?` : ''}$`);
    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0 || !amountPattern.test(amount) || selectedIds.length === 0) {
      setError(`Add a description, a valid amount in ${group?.currencyCode ?? 'the group currency'}, and at least one participant.`);
      return;
    }
    let customAmounts: Record<number, number> | undefined;
    if (splitMode === 'CUSTOM') {
      const unit = 10 ** scale;
      const amountUnits = Math.round(numericAmount * unit);
      const parsed = selectedIds.map((userId) => ({ userId, text: participantAmounts[userId] ?? '', value: Number(participantAmounts[userId]) }));
      if (parsed.some((share) => !amountPattern.test(share.text) || !Number.isFinite(share.value) || share.value <= 0)) {
        setError('Enter a positive share amount for every selected person.');
        return;
      }
      const shareUnits = parsed.reduce((total, share) => total + Math.round(share.value * unit), 0);
      if (shareUnits !== amountUnits) {
        setError('The participant shares must add up exactly to the expense total.');
        return;
      }
      customAmounts = Object.fromEntries(parsed.map((share) => [share.userId, share.value]));
    }
    const request: ExpenseRequest = { description: description.trim(), amount: numericAmount, participantUserIds: selectedIds, ...(customAmounts ? { participantAmounts: customAmounts } : {}) };
    setSaving(true); setError(''); setNotice('');
    try {
      if (editingExpense) await updateGroupExpense(groupId, editingExpense.id, request);
      else await createGroupExpense(groupId, request);
      resetExpenseForm();
      await refreshFinancials();
      setNotice(editingExpense ? 'Expense updated.' : 'Expense added.');
    } catch (requestError: unknown) { setError(getFinancialErrorMessage(requestError)); }
    finally { setSaving(false); }
  }

  async function removeExpense(expense: ExpenseResponse) {
    if (groupId === null || !window.confirm(`Delete “${expense.description}”? The group balances will be recalculated.`)) return;
    setError(''); setNotice('');
    try {
      await deleteGroupExpense(groupId, expense.id);
      await refreshFinancials();
      setNotice('Expense deleted and balances recalculated.');
    } catch (requestError: unknown) { setError(getFinancialErrorMessage(requestError)); }
  }

  if (groupId === null) return <main className="page-content"><p className="form-error" role="alert">Enter a valid group ID.</p><Link className="back-link" to="/groups">← All groups</Link></main>;
  if (loading) return <main className="page-content"><p className="loading-state" role="status">Opening your group…</p></main>;
  if (!group) return <main className="page-content"><p className="form-error" role="alert">{error || 'This group is unavailable.'}</p><Link className="back-link" to="/groups">← All groups</Link></main>;

  const currentBalance = balances?.members.find((member) => member.userId === profile.id)?.netBalance ?? 0;
  const currencyCode = group.currencyCode;
  const currencyScale = currencyFractionDigits(currencyCode);
  const expenseTotal = Math.round(expenses.reduce((total, expense) => total + expense.amount, 0) * (10 ** currencyScale)) / (10 ** currencyScale);
  const customTotal = selectedIds.reduce((total, id) => total + (Number(participantAmounts[id]) || 0), 0);

  return <main className="page-content group-details-page">
    <GroupWorkspaceHeader group={group} active="expenses" />
    {notice && <p className="form-success group-notice" role="status">{notice}</p>}
    {error && <p className="form-error group-notice" role="alert">{error}</p>}
    <section className="group-summary-strip" aria-label="Group summary">
      <div className="group-summary-balance"><span>Your balance</span><strong className={currentBalance > 0 ? 'balance-positive' : currentBalance < 0 ? 'balance-negative' : ''}>{currentBalance > 0 ? `You’re owed ${formatCurrency(currentBalance, currencyCode)}` : currentBalance < 0 ? `You owe ${formatCurrency(currentBalance, currencyCode)}` : 'All settled'}</strong></div>
      <div className="group-summary-total"><span>Expenses recorded · {currencyCode}</span><strong>{formatCurrency(expenseTotal, currencyCode)}</strong></div>
      <Link to={`/groups/${group.id}/balances`} className="summary-link">View balances <span aria-hidden="true">↗</span></Link>
    </section>
    <div className="expenses-workspace-grid">
      <section className="content-panel add-expense-panel" aria-labelledby="expense-form-title">
        <p className="eyebrow">Keep the details together</p><h2 id="expense-form-title">{editingExpense ? 'Edit expense' : 'Add an expense'}</h2>
        <form className="expense-form" onSubmit={saveExpense}>
          <div className="form-field"><label htmlFor="expense-description">What was it for?</label><input id="expense-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={255} placeholder="e.g. Dinner, groceries" required /></div>
          <div className="form-field"><label htmlFor="expense-amount">Amount <span className="currency-hint">{currencyCode}</span></label><div className="money-input"><span aria-hidden="true">{currencySymbol(currencyCode)}</span><input id="expense-amount" type="number" min={1 / (10 ** currencyScale)} max="9999999999.999" step={1 / (10 ** currencyScale)} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={`0${currencyScale ? `.${'0'.repeat(currencyScale)}` : ''}`} required /></div></div>
          <fieldset className="participant-picker"><legend>{splitMode === 'EQUAL' ? 'Split equally' : 'Enter each share'}</legend><p>Select everyone who shares this cost.</p>
            <div className="split-mode-switch" role="radiogroup" aria-label="Expense split method"><label><input type="radio" name="split-mode" checked={splitMode === 'EQUAL'} onChange={() => changeSplitMode('EQUAL')} />Equal split</label><label><input type="radio" name="split-mode" checked={splitMode === 'CUSTOM'} onChange={() => changeSplitMode('CUSTOM')} />Enter amounts</label></div>
            {members.filter((member) => member.username !== 'Former member').map((member) => <div className="participant-entry" key={member.userId}><label className="participant-option"><input type="checkbox" checked={selectedIds.includes(member.userId)} onChange={(event) => toggleParticipant(member.userId, event.target.checked)} /><span className="participant-avatar" aria-hidden="true">{member.username.slice(0, 1).toUpperCase()}</span><span>{member.username}{member.userId === profile.id ? ' · You' : ''}</span></label>{splitMode === 'CUSTOM' && selectedIds.includes(member.userId) && <label className="participant-share-input" htmlFor={`share-${member.userId}`}><span aria-hidden="true">{currencySymbol(currencyCode)}</span><input id={`share-${member.userId}`} aria-label={`${member.username}'s share`} type="number" min={1 / (10 ** currencyScale)} step={1 / (10 ** currencyScale)} value={participantAmounts[member.userId] ?? ''} onChange={(event) => setParticipantAmounts((current) => ({ ...current, [member.userId]: event.target.value }))} placeholder="0" /></label>}</div>)}
            {splitMode === 'CUSTOM' && <p className={Math.round(customTotal * (10 ** currencyScale)) === Math.round(Number(amount || 0) * (10 ** currencyScale)) ? 'share-total-note' : 'share-total-note share-total-error'} role="status">Shares total {formatCurrency(customTotal, currencyCode)} of {formatCurrency(Number(amount) || 0, currencyCode)}.</p>}
          </fieldset>
          <p className="expense-payer-note">You paid this expense. {splitMode === 'EQUAL' ? 'The selected members share it equally.' : 'The shares must add up to the full expense.'}</p>
          <button className="primary-button" type="submit" disabled={saving || members.length === 0}>{saving ? 'Saving…' : editingExpense ? 'Save changes' : 'Add expense'}</button>
          {editingExpense && <button className="text-button expense-cancel" type="button" onClick={resetExpenseForm}>Cancel editing</button>}
        </form>
      </section>
      <section className="content-panel expense-history-panel" aria-labelledby="expense-history-title">
        <div className="expense-history-heading"><div><p className="eyebrow">The shared record</p><h2 id="expense-history-title">Expenses</h2></div><span className="expense-count">{expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}</span></div>
        {expenses.length === 0 ? <div className="empty-state expense-empty"><p className="empty-title">Nothing shared yet.</p><p>Add the first expense to start seeing how the group balances out.</p></div> : <ul className="expense-list">{expenses.map((expense) => <li className="expense-item" key={expense.id}>
          <div className="expense-item-main"><span className="expense-date">{new Date(expense.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><div className="expense-item-copy"><strong>{expense.description}</strong><span>Paid by {expense.payerUsername}{expense.payerId === profile.id ? ' · You' : ''}{expense.splitType === 'CUSTOM' ? ' · Custom shares' : ''}</span></div><strong className="expense-item-amount">{formatCurrency(expense.amount, expense.currency)}</strong></div>
          <div className="expense-split-summary">{expense.splits.map((split) => <span key={split.userId}>{split.username} <b>{formatCurrency(split.amount, expense.currency)}</b></span>)}</div>
          {expense.payerId === profile.id && <div className="expense-item-actions"><button className="member-action" type="button" onClick={() => startEditing(expense)}>Edit</button><button className="member-action member-action-danger" type="button" onClick={() => void removeExpense(expense)}>Delete</button></div>}
        </li>)}</ul>}
      </section>
    </div>
    <div className="group-members-footer"><div><p className="eyebrow">Shared with</p><strong>{members.map((member) => member.username).join(' · ') || 'No members'}</strong></div><Link to={`/groups/${group.id}/settings`}>Manage members <span aria-hidden="true">↗</span></Link></div>
  </main>;
}
