import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, HeartPulse, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { dataService, Notification } from '../../services/dataService';
import { socketService } from '../../services/socketService';

interface HeaderProps {
  userName: string;
}

function formatRelative(iso: string): string {
  try {
    const t = new Date(iso).getTime();
    const diff = Date.now() - t;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    const d = Math.floor(h / 24);
    return `${d} ngày trước`;
  } catch {
    return '';
  }
}

function NotificationMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  // Close on outside click
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await dataService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      );
    } catch (error) {
      console.warn('Failed to mark notification as read:', error);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((current) => !current)}
        className="relative w-10 h-10 rounded-full grid place-items-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        aria-label="Thông báo"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <div
        className={cn(
          'absolute right-0 mt-3 w-[380px] bg-white border border-slate-200/80 rounded-2xl shadow-[0_8px_32px_rgb(15_23_42/0.12)] transition-all z-50 overflow-hidden',
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2',
        )}
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-slate-900">Thông báo</p>
            <p className="text-xs text-slate-500">
              {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Tất cả đã được đọc'}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 grid place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 grid place-items-center text-slate-400 mb-3">
                <Bell size={20} />
              </div>
              <p className="text-sm text-slate-500">Chưa có thông báo mới.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    'p-4 transition-colors flex gap-3',
                    !n.isRead && 'bg-sky-50/40',
                    n.isRead && 'hover:bg-slate-50',
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 shrink-0 rounded-xl grid place-items-center',
                      n.isRead ? 'bg-slate-100 text-slate-400' : 'bg-sky-100 text-primary',
                    )}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{n.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px] text-slate-400">{formatRelative(n.createdAt)}</span>
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-[11px] font-semibold text-primary hover:text-primary-dark"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function Header({ userName }: HeaderProps) {
  const initials = userName.trim().split(/\s+/).filter(Boolean);
  const initialsText =
    initials.length === 0 ? '?'
    : initials.length === 1 ? initials[0][0].toUpperCase()
    : (initials[0][0] + initials[initials.length - 1][0]).toUpperCase();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-8 flex items-center justify-between z-10 shrink-0">
      {/* Left: mobile logo (visible <md) */}
      <div className="md:hidden flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 grid place-items-center">
          <HeartPulse size={17} className="text-white" />
        </div>
        <span className="font-bold tracking-tight text-slate-900">Mediflow</span>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden md:block flex-1" />

      {/* Right: notifications + user */}
      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationMenu />

        <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l border-slate-200/70">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{userName}</p>
            <p className="text-[11px] text-slate-500 leading-tight">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Đang hoạt động
              </span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-100 to-teal-100 text-primary-dark grid place-items-center font-bold text-xs ring-2 ring-white shadow-sm">
            {initialsText}
          </div>
        </div>
      </div>
    </header>
  );
}
