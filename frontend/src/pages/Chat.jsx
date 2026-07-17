import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { chatAPI, callAPI } from '../services/api';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import CallPopup from '../components/call/CallPopup';
import CallScreen from '../components/call/CallScreen';
import toast from 'react-hot-toast';

const Chat = () => {
  const { onlineUsers, incomingCall, activeCall, setActiveCall, emit } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatAPI.getConversations()
      .then(res => setConversations(res.data))
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    if (window.innerWidth < 768) {
      document.querySelector('.chat-sidebar')?.classList.add('hidden');
    }
  };

  const handleStartCall = async (callType) => {
    if (!activeConversation) return;

    const other = activeConversation.participants?.find(p => p._id !== JSON.parse(localStorage.getItem('user'))._id);
    if (!other) return;

    try {
      const res = await callAPI.startCall({ receiverId: other._id, callType });

      emit('call_user', { receiverId: other._id, callType }, (response) => {
        if (response?.error) {
          toast.error(response.error);
          callAPI.endCall(res.data._id, { duration: 0 }).catch(() => {});
          return;
        }
        setActiveCall({
          callId: res.data._id,
          otherId: other._id,
          otherName: other.name,
          callType,
          status: 'calling',
          isReceiver: false
        });
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start call');
    }
  };

  const handleBack = () => {
    setActiveConversation(null);
    document.querySelector('.chat-sidebar')?.classList.remove('hidden');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950">
      <div className="chat-sidebar flex w-full shrink-0 flex-col border-r border-gray-200 md:w-80 lg:w-96 dark:border-gray-800">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" />
          </div>
        ) : (
          <ChatSidebar
            conversations={conversations}
            activeId={activeConversation?._id}
            onSelect={handleSelectConversation}
            onlineUsers={onlineUsers}
          />
        )}
      </div>
      <div className="hidden flex-1 md:flex">
        <ChatWindow
          conversation={activeConversation}
          onBack={handleBack}
          onStartCall={handleStartCall}
        />
      </div>
      {activeConversation && (
        <div className="flex-1 md:hidden">
          <ChatWindow
            conversation={activeConversation}
            onBack={handleBack}
            onStartCall={handleStartCall}
          />
        </div>
      )}

      <CallPopup />
      {activeCall && (
        <CallScreen call={activeCall} onEnded={() => setActiveCall(null)} />
      )}
    </div>
  );
};

export default Chat;
