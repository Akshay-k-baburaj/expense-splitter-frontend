import axios from "axios";
import { api } from "../../services/api";
import type { CreateUserProfileRequest, UpdateUserProfileRequest, UserResponse } from "../../types/user";

export async function createCurrentUser(profile: CreateUserProfileRequest): Promise<UserResponse> {
  const response = await api.post<UserResponse>("/api/v1/users/me", profile);
  return response.data;
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await api.get<UserResponse>("/api/v1/users/me");
  return response.data;
}

export async function updateCurrentUser(profile: UpdateUserProfileRequest): Promise<UserResponse> {
  const response = await api.put<UserResponse>("/api/v1/users/me", profile);
  return response.data;
}

export async function deactivateCurrentUser(): Promise<void> {
  await api.delete<void>("/api/v1/users/me");
}

export function getUserErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<{ message?: unknown }>(error)) {
    return "Something went wrong. Please try again.";
  }
  if (!error.response) {
    return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
      ? "The request took too long. Please try again."
      : "Could not reach the API. Check that it is running and allows this site through CORS.";
  }
  if (error.response.status === 401) return "Your sign-in has expired. Sign in again to continue.";
  if (error.response.status === 403) return "Verify your email with Auth0, or contact support if this account is disabled.";
  if (error.response.status === 404) return "Your profile has not been set up yet.";
  if (error.response.status === 409) return "That username is already in use, or this account needs secure legacy linking.";
  if (error.response.status >= 500) return "The server couldn't complete the request. Please try again later.";
  return "The request couldn't be completed. Please review your details and try again.";
}
