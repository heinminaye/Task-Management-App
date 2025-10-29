export interface Project {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithMembers extends Project {
  memberDetails: Array<{
    id: string;
    email: string;
    name: string;
    isOnline: boolean;
    lastSeen?: string;
  }>;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  members?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  members?: string[];
}