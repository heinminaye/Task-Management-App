export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ProjectDetails: { projectId: string };
  TaskDetails: { taskId: string };
  CreateProject: undefined;
};

export type MainTabParamList = {
  Projects: undefined;
  Tasks: undefined;
  Create: undefined;
  Profile: undefined;
};

export type TasksStackParamList = {
  TaskList: undefined;
  TaskDetails: { taskId: string };
  CreateTask: undefined;
};

export type ProjectsStackParamList = {
  ProjectList: undefined;
  ProjectDetails: { projectId: string };
  CreateProject: undefined;
};

export type CreateStackParamList = {
  CreateTaskFromTab: undefined;
  CreateProjectFromTab: undefined;
};