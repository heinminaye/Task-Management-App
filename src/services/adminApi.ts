import { ConfirmUserResponse,User } from '../types/user';
import { api } from './api';

export const adminAPI = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Confirm user (admin only)
  confirmUser: async (userId: string): Promise<ConfirmUserResponse> => {
    const response = await api.patch(`/users/${userId}/confirm`);
    return response.data;
  },

  // Get online users
  getOnlineUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/online');
    return response.data;
  },

  // Get current user profile
  getMyProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },
};