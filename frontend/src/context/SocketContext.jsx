import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocketConnected(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('connect_error', (error) => {
      if (error.message === 'Authentication required' || error.message === 'Authentication failed') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    socket.on('notification', (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    socket.on('call_request', (data) => {
      setIncomingCall(data);
    });

    socket.on('call_accepted', (data) => {
      setActiveCall(prev => ({ ...prev, status: 'connected', ...data }));
    });

    socket.on('call_rejected', () => {
      setActiveCall(null);
    });

    socket.on('call_ended', () => {
      setActiveCall(null);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [user]);

  const emit = (event, data, callback) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data, callback);
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const joinConversation = (conversationId) => {
    emit('join_conversation', conversationId);
  };

  const leaveConversation = (conversationId) => {
    emit('leave_conversation', conversationId);
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      onlineUsers,
      incomingCall,
      setIncomingCall,
      activeCall,
      setActiveCall,
      notifications,
      setNotifications,
      socketConnected,
      emit, on, off,
      joinConversation, leaveConversation
    }}>
      {children}
    </SocketContext.Provider>
  );
};
