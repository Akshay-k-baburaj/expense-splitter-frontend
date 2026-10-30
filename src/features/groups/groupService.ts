import axios from "axios";
import { api } from "../../services/api";
import type { AddMemberRequest, GroupInviteCodeResponse, GroupInviteStatusResponse, GroupMemberResponse, GroupRequest, GroupResponse } from "../../types/group";

export async function createGroup(group: GroupRequest): Promise<GroupResponse> {
  const response = await api.post<GroupResponse>("/api/v1/groups", group);
  return response.data;
}

export async function getGroupById(id: number, signal?: AbortSignal): Promise<GroupResponse> {
  const response = await api.get<GroupResponse>(`/api/v1/groups/${id}`, { signal });
  return response.data;
}

export async function updateGroup(id: number, group: GroupRequest): Promise<GroupResponse> {
  const response = await api.put<GroupResponse>(`/api/v1/groups/${id}`, group);
  return response.data;
}

export async function deleteGroup(id: number): Promise<void> {
  await api.delete<void>(`/api/v1/groups/${id}`);
}

export async function getGroupsForCurrentUser(signal?: AbortSignal): Promise<GroupResponse[]> {
  const response = await api.get<GroupResponse[]>('/api/v1/groups/me', { signal });
  return response.data;
}

export async function getGroupMembers(groupId: number, signal?: AbortSignal): Promise<GroupMemberResponse[]> {
  const response = await api.get<GroupMemberResponse[]>(`/api/v1/groups/${groupId}/members`, { signal });
  return response.data;
}

export async function addGroupMember(groupId: number, member: AddMemberRequest): Promise<GroupMemberResponse> {
  const response = await api.post<GroupMemberResponse>(`/api/v1/groups/${groupId}/members`, member);
  return response.data;
}

export async function removeGroupMember(groupId: number, userId: number): Promise<void> {
  await api.delete<void>(`/api/v1/groups/${groupId}/members/${userId}`);
}

export async function transferGroupOwnership(groupId: number, userId: number): Promise<GroupResponse> {
  const response = await api.put<GroupResponse>(`/api/v1/groups/${groupId}/owner`, { userId });
  return response.data;
}

export async function joinGroupByCode(code: string): Promise<GroupResponse> {
  const response = await api.post<GroupResponse>("/api/v1/groups/join-by-code", { code });
  return response.data;
}

export async function getGroupInviteStatus(groupId: number, signal?: AbortSignal): Promise<GroupInviteStatusResponse> {
  const response = await api.get<GroupInviteStatusResponse>(`/api/v1/groups/${groupId}/invite-code`, { signal });
  return response.data;
}

export async function createGroupInviteCode(groupId: number): Promise<GroupInviteCodeResponse> {
  const response = await api.post<GroupInviteCodeResponse>(`/api/v1/groups/${groupId}/invite-code`);
  return response.data;
}

export function getGroupErrorMessage(error: unknown, context: "lookup" | "membership" | "save" = "lookup"): string {
  if (!axios.isAxiosError<{ message?: unknown }>(error)) {
    return "Something went wrong. Please try again.";
  }
  if (!error.response) {
    return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
      ? "The request took too long. Please try again."
      : "Could not reach the API. Check that it is running and allows this site through CORS.";
  }

  const { status } = error.response;
  if (status === 404) {
    if (context === "membership") return "The group, user, or membership could not be found.";
    if (context === "save") return "This group could not be found.";
    return "We couldn't find that group.";
  }
  if (status === 409) return "That user is already a member of this group.";
  if (status === 429) return "Too many code attempts. Wait 15 minutes, then try again.";
  if (status === 403) return "You don't have permission to do that, or you aren't a member of this group.";
  if (status === 400) {
    const message = error.response.data?.message;
    return typeof message === "string" ? message : "Please check the information and try again.";
  }
  if (status >= 500) return "The server couldn't complete the request. Please try again later.";
  return "The request couldn't be completed. Please try again.";
}
