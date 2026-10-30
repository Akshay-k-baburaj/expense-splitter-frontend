export type ExpenseSplit = { userId: number; username: string; amount: number };
export type ExpenseResponse = {
  id: number;
  groupId: number;
  description: string;
  amount: number;
  currency: string;
  payerId: number;
  payerUsername: string;
  createdAt: string;
  splits: ExpenseSplit[];
  splitType: 'EQUAL' | 'CUSTOM';
};
export type ExpenseRequest = { description: string; amount: number; participantUserIds: number[]; participantAmounts?: Record<number, number> };

export type MemberBalance = { userId: number; username: string; netBalance: number };
export type SettlementSuggestion = { fromUserId: number; fromUsername: string; toUserId: number; toUsername: string; amount: number };
export type GroupBalanceResponse = {
  groupId: number;
  currentUserId: number;
  currency: string;
  members: MemberBalance[];
  suggestedSettlements: SettlementSuggestion[];
};
export type SettlementResponse = {
  id: number;
  groupId: number;
  payerId: number;
  payerUsername: string;
  receiverId: number;
  receiverUsername: string;
  amount: number;
  currency: string;
  createdAt: string;
};
export type SettlementRequest = { receiverId: number; amount: number };
