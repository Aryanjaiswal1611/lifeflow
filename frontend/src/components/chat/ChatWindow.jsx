import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatAPI } from '../../services/api';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { BiPhone, BiVideo, BiArrowBack } from 'react-icons/bi';

const ChatWindow = ({ conversation, onBack, onStartCall }) => {
  const { user } = useAuth();
  const { socket, onlineUsers, joinConversation, leaveConversation, emit } = useSocket();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const other = conversation?.participants?.find(p => p._id !== user._id);
  const isOnline = other ? onlineUsers.includes(other._id) : false;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!conversation) return;

    setLoading(true);
    setMessages([]);
    setTypingUsers([]);

    joinConversation(conversation._id);

    chatAPI.getMessages(conversation._id)
      .then(res => {
        setMessages(res.data);
        chatAPI.markAsRead(conversation._id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => {
      leaveConversation(conversation._id);
    };
  }, [conversation?._id]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      chatAPI.markAsRead(conversation._id);
    };

    const handleTyping = (data) => {
      if (data.userId !== user._id) {
        setTypingUsers(prev => [...new Set([...prev, data.name])]);
      }
    };

    const handleStopTyping = (data) => {
      if (data.userId !== user._id) {
        setTypingUsers(prev => prev.filter(n => n !== data.name));
      }
    };

    const handleMessagesSeen = () => {
      setMessages(prev => prev.map(m => ({ ...m, seen: true })));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('messages_seen', handleMessagesSeen);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('messages_seen', handleMessagesSeen);
    };
  }, [socket, conversation?._id, user._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = (text) => {
    emit('send_message', {
      conversationId: conversation._id,
      text
    });
  };

  const handleTyping = (isTyping) => {
    if (isTyping) {
      emit('typing_start', conversation._id);
    } else {
      emit('typing_stop', conversation._id);
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center text-gray-400">
          <div className="mb-4 text-6xl">💬</div>
          <p className="text-base font-medium">Select a conversation</p>
          <p className="mt-1 text-sm">Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden dark:hover:bg-gray-800"><BiArrowBack size={20} /></button>
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
              {other?.name?.charAt(0) || '?'}
            </div>
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-900" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{other?.name || 'Unknown'}</p>
            <p className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onStartCall('audio')} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800 dark:hover:text-primary-400" title="Audio Call">
            <BiPhone size={18} />
          </button>
          <button onClick={() => onStartCall('video')} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800 dark:hover:text-primary-400" title="Video Call">
            <BiVideo size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <MessageBubble key={msg._id} message={msg} />
            ))}
            {typingUsers.length > 0 && (
              <div className="ml-2 mb-2 text-xs italic text-gray-400">
                {typingUsers.join(', ')} typing...
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
};

export default ChatWindow;
