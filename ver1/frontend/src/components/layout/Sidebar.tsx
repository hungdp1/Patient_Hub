import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { navItems } from '../../constants/navigation';
import { UserRole } from '../../types';
import { HeartPulse, LogOut, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface SidebarProps {
  role: UserRole | null;
  isCollapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  userName: string;
}

function roleLabel(role: UserRole | null): string {
  switch (role) {
    case UserRole.ADMIN:      return 'Quản trị';
    case UserRole.DOCTOR:     return 'Bác sĩ';
    case UserRole.TECHNICIAN: return 'Kỹ thuật viên';
    case UserRole.PATIENT:    return 'Bệnh nhân';
    default:                  return '—';
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Sidebar({ role, isCollapsed, onToggle, onLogout, userName }: SidebarProps) {
  const location = useLocation();
  const items = navItems.filter((item) => role ? item.roles.includes(role) : false);

  return (
    <aside
      className={cn(
        'bg-white border-r border-slate-200/70 flex flex-col transition-all duration-300 relative group hidden md:flex',
        isCollapsed ? 'w-[88px]' : 'w-[260px]',
      )}
    >
      {/* Collapse toggle (floats on hover) */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-24 w-7 h-7 bg-white border border-slate-200 rounded-full grid place-items-center text-slate-400 hover:text-primary hover:border-primary/40 shadow-sm z-50 transition-all opacity-0 group-hover:opacity-100"
        aria-label={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
      >
        {isCollapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
      </button>

      {/* Brand */}
      <div className={cn('px-6 pt-7 pb-6', isCollapsed && 'px-4')}>
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 grid place-items-center shadow-md shadow-sky-500/20 shrink-0">
            <HeartPulse size={20} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight overflow-hidden">
              <p className="font-extrabold text-slate-900 tracking-tight text-[17px]">Mediflow</p>
              <p className="text-[11px] text-slate-400 font-medium">Healthcare OS</p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar', isCollapsed && 'px-2')}>
        {!isCollapsed && <p className="eyebrow px-3 mb-2">Điều hướng</p>}
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : ''}
              className={cn(
                'relative flex items-center gap-3 rounded-xl transition-all',
                isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5',
                active
                  ? 'bg-sky-50 text-primary-dark font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium',
              )}
            >
              {/* Active accent bar */}
              {active && !isCollapsed && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
              )}
              <item.icon
                size={18}
                className={cn(
                  'shrink-0 transition-colors',
                  active ? 'text-primary' : 'text-slate-400',
                )}
                strokeWidth={active ? 2.2 : 1.8}
              />
              {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User block */}
      <div className={cn('p-3 border-t border-slate-100', isCollapsed && 'p-2')}>
        <Link
          to="/profile"
          className={cn(
            'flex items-center gap-3 p-2.5 rounded-2xl transition-all',
            location.pathname === '/profile'
              ? 'bg-sky-50'
              : 'hover:bg-slate-50',
          )}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-teal-100 text-primary-dark grid place-items-center font-bold text-sm shrink-0 ring-2 ring-white">
            {initials(userName)}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
              <p className="text-[11px] text-slate-500 truncate">{roleLabel(role)}</p>
            </div>
          )}
        </Link>
        <button
          onClick={onLogout}
          className={cn(
            'mt-2 flex items-center gap-3 w-full rounded-xl transition-all text-slate-500 hover:bg-rose-50 hover:text-rose-600 font-medium text-sm',
            isCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
          )}
        >
          <LogOut size={16} className="shrink-0" strokeWidth={2} />
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
