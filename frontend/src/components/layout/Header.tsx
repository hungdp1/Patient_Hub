import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Clock, CreditCard, CalendarClock, Globe, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { dataService, Notification } from '../../services/dataService';
import { socketService } from '../../services/socketService';

interface HeaderProps {
  userName: string;
}

function NotificationMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const items = await dataService.getNotifications();
        setNotifications(items.slice(0, 8));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleNotification = (payload: any) => {
      const nextNotification: Notification = {
        id: payload.notificationId || payload.id || Math.random().toString(36).slice(2),
        userId: payload.userId || '',
        title: payload.title || 'Thông báo mới',
        message: payload.message || '',
        type: payload.type || 'GENERAL',
        isRead: false,
        createdAt: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
        updatedAt: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
      };
      setNotifications((prev) => [nextNotification, ...prev].slice(0, 8));
    };

    socket.on('notification:received', handleNotification);

    return () => {
      socket.off('notification:received', handleNotification);
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await dataService.markNotificationAsRead(id);
      setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, isRead: true } : item));
    } catch (error) {
      console.warn('Failed to mark notification as read:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((current) => !current)}
        className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      <div
        className={cn(
          'absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-[2rem] shadow-2xl transition-all z-50 overflow-hidden',
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2',
        )}
      >
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">Thông báo mới</p>
          <span className="text-[10px] text-slate-500">{unreadCount} chưa đọc</span>
        </div>

        <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">Chưa có thông báo mới.</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-5 hover:bg-slate-50 transition-colors flex gap-4',
                  notification.isRead ? 'bg-white' : 'bg-slate-50',
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{notification.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed truncate">{notification.message}</p>
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-primary"
                  >
                    Đánh dấu đã đọc
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function Header({ userName }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-10 shrink-0">
      <div className="flex-1 flex items-center gap-6">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-primary font-bold tracking-tight">+</div>
          <span className="font-bold tracking-tight">MED-OS</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <NotificationMenu />
        <div className="flex items-center gap-3 text-slate-600 text-xs uppercase tracking-[0.22em] font-bold">
          <div className="hidden md:block">{userName}</div>
          <div className="hidden md:flex items-center gap-1 px-3 py-2 bg-slate-100 rounded-2xl"> 
            <Globe size={14} />
            <span>Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
