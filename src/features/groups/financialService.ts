import axios from 'axios';
import { api } from '../../services/api';
import type { ExpenseRequest, ExpenseResponse, GroupBalanceResponse, SettlementRequest, SettlementResponse } from '../../types/expense';

export async function getGroupExpenses(groupId: number, signal?: AbortSignal): Promise<ExpenseResponse[]> {
  return (await api.get<ExpenseResponse[]>(`/api/v1/groups/${groupId}/expenses`, { signal })).data;
}
export async function createGroupExpense(groupId: number, request: ExpenseRequest): Promise<ExpenseResponse> {
  return (await api.post<ExpenseResponse>(`/api/v1/groups/${groupId}/expenses`, request)).data;
}
export async function updateGroupExpense(groupId: number, expenseId: number, request: ExpenseRequest): Promise<ExpenseResponse> {
  return (await api.put<ExpenseResponse>(`/api/v1/groups/${groupId}/expenses/${expenseId}`, request)).data;
}
export async function deleteGroupExpense(groupId: number, expenseId: number): Promise<void> {
  await api.delete(`/api/v1/groups/${groupId}/expenses/${expenseId}`);
}
export async function getGroupBalances(groupId: number, signal?: AbortSignal): Promise<GroupBalanceResponse> {
  return (await api.get<GroupBalanceResponse>(`/api/v1/groups/${groupId}/balances`, { signal })).data;
}
export async function getGroupSettlements(groupId: number, signal?: AbortSignal): Promise<SettlementResponse[]> {
  return (await api.get<SettlementResponse[]>(`/api/v1/groups/${groupId}/settlements`, { signal })).data;
}
export async function createGroupSettlement(groupId: number, request: SettlementRequest): Promise<SettlementResponse> {
  return (await api.post<SettlementResponse>(`/api/v1/groups/${groupId}/settlements`, request)).data;
}
export async function deleteGroupSettlement(groupId: number, settlementId: number): Promise<void> {
  await api.delete(`/api/v1/groups/${groupId}/settlements/${settlementId}`);
}

export function getFinancialErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Something went wrong. Please try again.';
  if (!error.response) return 'Could not reach the API. Check that it is running and allows this site through CORS.';
  if (error.response.status === 400) {
    const data: unknown = error.response.data;
    if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') return data.message;
    return 'The request could not be applied. Check the participants and current balances.';
  }
  if (error.response.status === 403) return 'You must be a member of this group to view its finances.';
  if (error.response.status === 404) return 'This group or financial record could not be found.';
  if (error.response.status >= 500) return 'The server could not complete this request. Please try again later.';
  return 'The request could not be completed. Please try again.';
}
