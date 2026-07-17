import { useState, useRef } from 'react';
import { BiSend } from 'react-icons/bi';

const EMOJIS = ['😀','😂','❤️','🩸','👍','🎉','😊','🙏','💪','🤝','😍','🔥','👋','😢','🤗','✨'];

const MessageInput = ({ onSend, onTyping, disabled }) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const typingRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    if (onTyping) {
      onTyping(true);
      clearTimeout(typingRef.current);
      typingRef.current = setTimeout(() => onTyping(false), 1500);
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (onTyping) onTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji) => {
    setText(prev => prev + emoji);
    setShowEmoji(false);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      {showEmoji && (
        <div className="mb-3 flex flex-wrap gap-2 border-b border-gray-100 pb-3 dark:border-gray-700">
          {EMOJIS.map((emoji, i) => (
            <button key={i} onClick={() => addEmoji(emoji)} className="rounded-lg p-1 text-xl transition-transform hover:scale-125">
              {emoji}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <button onClick={() => setShowEmoji(!showEmoji)} className="rounded-lg p-2 text-xl text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200">
          😊
        </button>
        <div className="relative flex-1">
          <textarea
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="input-field resize-none py-2.5 pr-4 max-h-24"
            rows={1}
            disabled={disabled}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm transition-all duration-150 hover:bg-primary-700 active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <BiSend size={18} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
