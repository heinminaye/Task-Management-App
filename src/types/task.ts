export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  assignedTo?: string;
  projectId: string;
  status: TaskStatus;
  dueDate?: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  projectId: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: number;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: number;
  dueDate?: string;
}