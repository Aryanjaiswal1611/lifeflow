import { useAuth } from '../../context/AuthContext';
import { BiMessage } from 'react-icons/bi';

const ChatSidebar = ({ conversations, activeId, onSelect, onlineUsers }) => {
  const { user } = useAuth();

  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find(p => p._id !== user._id);
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-bold tracking-tight">Messages</h2>
        <p className="mt-0.5 text-xs text-gray-500">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-gray-400">
            <BiMessage size={44} className="mb-3" />
            <p className="text-sm font-medium">No conversations yet</p>
            <p className="mt-1 text-xs">Accept a blood request to start chatting</p>
          </div>
        ) : (
          conversations.map(conv => {
            const other = getOtherParticipant(conv);
            const isOnline = other ? onlineUsers.includes(other._id) : false;
            const isActive = conv._id === activeId;

            return (
              <button
                key={conv._id}
                onClick={() => onSelect(conv)}
                className={`flex w-full items-center gap-3 border-b border-gray-50 px-5 py-4 text-left transition-colors dark:border-gray-800/50 ${isActive ? 'bg-primary-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
              >
                <div className="relative shrink-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-base font-bold text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                    {other?.name?.charAt(0) || '?'}
                  </div>
                  {isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-gray-900" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{other?.name || 'Unknown User'}</p>
                    {conv.lastMessage?.timestamp && (
                      <span className="shrink-0 text-[10px] text-gray-400">
                        {new Date(conv.lastMessage.timestamp).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                    {conv.lastMessage?.text || 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
