export type CreateUserProfileRequest = {
  username: string;
};

export type UpdateUserProfileRequest = {
  username: string;
};

export type UserResponse = {
  id: number;
  username: string;
  email: string;
};
