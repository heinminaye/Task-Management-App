import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { socketService } from '../services/socketService';
import { addProject, updateProjectFromSocket, removeProject } from '../store/slices/projectSlice';
import { addTask, updateTaskFromSocket, removeTask } from '../store/slices/taskSlice';

export const useSocket = () => {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const initialized = useRef(false);

  useEffect(() => {
    if (accessToken && !initialized.current) {
      // Connect to socket
      socketService.connect(accessToken);
      initialized.current = true;

      // Set up project event listeners
      socketService.onProjectCreated((project) => {
        dispatch(addProject(project));
      });

      socketService.onProjectUpdated((project) => {
        dispatch(updateProjectFromSocket(project));
      });

      socketService.onProjectDeleted((projectId) => {
        dispatch(removeProject(projectId));
      });

      // Set up task event listeners
      socketService.onTaskCreated((task) => {
        dispatch(addTask(task));
      });

      socketService.onTaskUpdated((task) => {
        dispatch(updateTaskFromSocket(task));
      });

      socketService.onTaskDeleted((taskId) => {
        dispatch(removeTask(taskId));
      });

      // Set up notification listener
      socketService.onNotification((notification) => {
        // You can show toast notifications here
        console.log('New notification:', notification);
        // You can integrate with a toast library like react-native-toast-message
      });
    }

    return () => {
      if (initialized.current) {
        socketService.disconnect();
        initialized.current = false;
      }
    };
  }, [accessToken, dispatch]);

  return {
    joinProject: socketService.joinProject.bind(socketService),
    leaveProject: socketService.leaveProject.bind(socketService),
    isConnected: socketService.isConnected.bind(socketService),
  };
};