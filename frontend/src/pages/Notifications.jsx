import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BiBell, BiCheckDouble, BiDroplet, BiCheckCircle, BiError } from 'react-icons/bi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data);
    } catch (err) {
      toast.error('Failed to load notifications');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'emergency': return <BiError size={22} className="text-red-500" />;
      case 'request': return <BiDroplet size={22} className="text-primary-500" />;
      case 'acceptance': return <BiCheckCircle size={22} className="text-green-500" />;
      default: return <BiBell size={22} className="text-blue-500" />;
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="section-title mb-0">Notifications</h1>
        <button onClick={handleMarkAllRead} className="btn-secondary gap-1.5 text-sm">
          <BiCheckDouble size={18} /> Mark All Read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="card py-16 text-center">
            <BiBell size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
          </div>
        ) : notifications.map(n => (
          <div key={n._id} className={`card flex items-start gap-4 transition-all ${!n.isRead ? 'border-l-4 border-primary-500 bg-primary-50/60 dark:border-primary-400 dark:bg-primary-900/15' : ''}`}>
            <div className="mt-1 flex-shrink-0">{getIcon(n.type)}</div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{n.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{n.message}</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            {!n.isRead && (
              <button onClick={() => handleMarkRead(n._id)} className="btn-ghost shrink-0 text-xs font-medium text-primary-600 dark:text-primary-400">Mark Read</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
