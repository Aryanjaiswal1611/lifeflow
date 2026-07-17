import { useAuth } from '../../context/AuthContext';

const MessageBubble = ({ message }) => {
  const { user } = useAuth();
  const isOwn = message.sender?._id === user?._id;

  return (
    <div className={`mb-3 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100 rounded-bl-sm'}`}>
        {!isOwn && (
          <p className="mb-0.5 text-xs font-medium text-primary-600 dark:text-primary-400">{message.sender?.name}</p>
        )}
        {message.messageType === 'text' && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>}
        {message.messageType === 'image' && (
          <img src={message.fileUrl} alt="Shared" className="mt-1 max-w-full rounded-lg" />
        )}
        {message.messageType === 'file' && (
          <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-2 text-sm underline">📎 {message.text || 'File'}</a>
        )}
        <div className={`mt-1 flex items-center gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && (
            <span className={`text-[10px] ${message.seen ? 'text-blue-300' : 'text-white/50'}`}>
              {message.seen ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
