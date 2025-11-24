import axios from 'axios';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Config from 'react-native-config';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const API_URL = `https://task-management-backend-production-16bf.up.railway.app/api`;
// const API_URL = Config.API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Token requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message?.toLowerCase?.();
    if (status === 401 && (message?.includes('jwt') || message?.includes('unauthorized'))) {
      Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
      await AsyncStorage.removeItem('accessToken');
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.accessToken) {
        await AsyncStorage.setItem('accessToken', response.data.accessToken);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
  
  register: async (credentials: RegisterCredentials): Promise<{ message: string }> => {
    try {
      const response = await api.post('/auth/register', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },
};