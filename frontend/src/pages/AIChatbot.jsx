import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BiSend, BiBot, BiUser } from 'react-icons/bi';

const AIChatbot = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! I\'m LifeFlow AI Assistant. Ask me about blood donation, eligibility, compatibility, or health tips!', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setLoading(true);
    try {
      const res = await aiAPI.chat({ message: userMsg });
      setMessages(prev => [...prev, { text: res.data.response, sender: 'bot' }]);
    } catch (err) {
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ['What blood types are compatible?', 'Can I donate blood?', 'Give me a health tip', 'How often can I donate?'];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="card">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
            <BiBot size={26} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">LifeFlow AI Assistant</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ask me anything about blood donation</p>
          </div>
        </div>

        <div className="mb-4 max-h-96 min-h-[24rem] overflow-y-auto space-y-4 rounded-xl bg-gray-50 p-4 scrollbar-thin dark:bg-gray-800/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.sender === 'user' ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white shadow-sm dark:bg-gray-700 rounded-bl-md'}`}>
                <div className="mb-1 flex items-center gap-1.5">
                  {msg.sender === 'bot' ? <BiBot size={14} /> : <BiUser size={14} />}
                  <span className="text-xs font-medium opacity-75">{msg.sender === 'bot' ? 'AI' : 'You'}</span>
                </div>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-gray-700 rounded-bl-md">
                <div className="flex gap-1">
                  {[0, 150, 300].map(delay => (
                    <div key={delay} className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} className="input-field flex-1" placeholder="Ask something..." disabled={loading} />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4">
            <BiSend size={20} />
          </button>
        </form>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {suggestions.map((q, i) => (
          <button key={i} onClick={() => setInput(q)} className="rounded-lg border border-gray-200 px-3 py-2 text-left text-sm text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800">
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIChatbot;
