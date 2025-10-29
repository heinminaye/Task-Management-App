import { Project, ProjectWithMembers, CreateProjectDto, UpdateProjectDto } from '../types/project';
import { api } from './api';

export const projectAPI = {
  // Create a new project
  create: async (projectData: CreateProjectDto): Promise<Project> => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Get all projects for current user
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  // Get project by ID with member details
  getById: async (id: string): Promise<ProjectWithMembers> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Update project
  update: async (id: string, updates: UpdateProjectDto): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, updates);
    return response.data;
  },

  // Add member to project (admin only)
  addMember: async (projectId: string, userId: string): Promise<Project> => {
    const response = await api.patch(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },

  // Remove member from project (creator only)
  removeMember: async (projectId: string, userId: string): Promise<Project> => {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },
};