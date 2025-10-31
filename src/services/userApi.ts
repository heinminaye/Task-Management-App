import { User } from '../types/auth';
import { api } from './api';

export const userAPI = {
  // Get User Profile
  getMyProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const currentUser = await userAPI.getMyProfile();
      const response = await api.patch(`/users/${currentUser.id}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Get online users
  getOnlineUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users/online');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch online users');
    }
  },
};