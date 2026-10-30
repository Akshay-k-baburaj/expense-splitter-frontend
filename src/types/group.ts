export type GroupRequest = {
  groupName: string;
  description: string;
  currencyCode: string;
};

export type GroupResponse = {
  id: number;
  groupName: string;
  description: string | null;
  currencyCode: string;
  ownerId: number | null;
  viewerIsOwner: boolean;
};

export type GroupMemberResponse = {
  groupId: number;
  userId: number;
  username: string;
  joinedAt: string;
  owner: boolean;
};

export type AddMemberRequest = {
  userId: number;
};

export type JoinGroupByCodeRequest = { code: string };
export type GroupInviteCodeResponse = { code: string; expiresAt: string };
export type GroupInviteStatusResponse = { active: boolean; expiresAt: string | null };
