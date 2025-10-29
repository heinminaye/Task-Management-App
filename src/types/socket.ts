export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  read: boolean;
  createdAt: string;
}

export interface SocketEvents {
    
  // Project Events
  'project:created': (project: any) => void;
  'project:updated': (project: any) => void;
  'project:deleted': (projectId: string) => void;
  
  // Task Events
  'task:created': (task: any) => void;
  'task:updated': (task: any) => void;
  'task:deleted': (taskId: string) => void;
  
  // Notification Events
  'notification': (notification: Notification) => void;
  
  // User Events
  'user:online': (userId: string) => void;
  'user:offline': (userId: string) => void;
}