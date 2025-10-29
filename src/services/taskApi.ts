import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus } from '../types/task';
import { api } from './api';

export const taskAPI = {
  // Create a new task
  create: async (taskData: CreateTaskDto): Promise<Task> => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update task
  update: async (id: string, updates: UpdateTaskDto): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },

  // Delete task
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // Get tasks by project
  getByProject: async (projectId: string): Promise<Task[]> => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  // Get user's tasks (created by or assigned to)
  getUserTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/my-tasks');
    return response.data;
  },

  // Get task by ID
  getById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Update task status
  updateStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}/status/${status}`);
    return response.data;
  },

  // Search tasks
  search: async (search: string, projectId?: string): Promise<Task[]> => {
    const params: any = { search };
    if (projectId) params.projectId = projectId;
    
    const response = await api.get('/tasks/search', { params });
    return response.data;
  },

  // Get tasks by status
  getByStatus: async (status: TaskStatus): Promise<Task[]> => {
    const response = await api.get(`/tasks/status/${status}`);
    return response.data;
  },
};