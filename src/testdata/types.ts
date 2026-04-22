export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TestUser extends LoginCredentials {
  displayName?: string;
  role?: string;
}
