export interface User {
  _id: string;
  name: string;
  email: string;
  isConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
  lastSeen?: string;
  isAdmin?: boolean;
}

export interface AdminState {
  users: User[];
  loading: boolean;
  error: string | null;
}

export interface ConfirmUserResponse {
  _id: string;
  name: string;
  email: string;
  isConfirmed: boolean;
  isActive: boolean;
}