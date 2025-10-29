export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isConfirmed: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}