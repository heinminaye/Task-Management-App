import io from 'socket.io-client';
import { Notification } from '../types/socket';
import { Config } from 'react-native-config';

class SocketService {
  private socket: ReturnType<typeof io> | null = null;
  private accessToken: string | null = null;

  connect(token: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.accessToken = token;
    
    const SOCKET_URL = 'https://task-management-backend-production-16bf.up.railway.app';
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`
      },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Project Events
  onProjectCreated(callback: (project: any) => void) {
    this.socket?.on('project:created', callback);
  }

  onProjectUpdated(callback: (project: any) => void) {
    this.socket?.on('project:updated', callback);
  }

  onProjectDeleted(callback: (projectId: string) => void) {
    this.socket?.on('project:deleted', callback);
  }

  // Task Events
  onTaskCreated(callback: (task: any) => void) {
    this.socket?.on('task:created', callback);
  }

  onTaskUpdated(callback: (task: any) => void) {
    this.socket?.on('task:updated', callback);
  }

  onTaskDeleted(callback: (taskId: string) => void) {
    this.socket?.on('task:deleted', callback);
  }

  // Notification Events
  onNotification(callback: (notification: Notification) => void) {
    this.socket?.on('notification', callback);
  }

  // User Events
  onUserOnline(callback: (userId: string) => void) {
    this.socket?.on('user:online', callback);
  }

  onUserOffline(callback: (userId: string) => void) {
    this.socket?.on('user:offline', callback);
  }

  // Remove listeners
  removeListener(event: string, callback?: any) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  // Emit events
  joinProject(projectId: string) {
    this.socket?.emit('join:project', projectId);
  }

  leaveProject(projectId: string) {
    this.socket?.emit('leave:project', projectId);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();