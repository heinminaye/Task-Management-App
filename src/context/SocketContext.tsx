import React, { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';

interface SocketContextType {
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  isConnected: () => boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const socket = useSocket();

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};