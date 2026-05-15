import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { navItems } from '../../constants/navigation';
import { UserRole } from '../../types';
import { LogOut, User } from 'lucide-react';

interface SidebarProps {
  role: UserRole | null;
  isCollapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  userName: string;
}

export function Sidebar({ role, isCollapsed, onToggle, onLogout, userName }: SidebarProps) {
  const location = useLocation();
  const items = navItems.filter((item) => role ? item.roles.includes(role) : false);

  return (
    <aside className={cn(
      'bg-white border-r border-slate-200 flex flex-col transition-all duration-300 relative group hidden md:flex',
      isCollapsed ? 'w-20' : 'w-64',
    )}>
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-primary shadow-sm z-50 transition-all opacity-0 group-hover:opacity-100"
      >
        <span className="text-[10px] font-bold">{isCollapsed ? '>' : '<'}</span>
      </button>

      <div className={cn('p-6 border-b border-slate-100 mb-4 transition-all overflow-hidden', isCollapsed ? 'px-4' : 'px-6')}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-primary font-bold shrink-0">
            ❤️
          </div>
          {!isCollapsed && <span className="text-xl font-bold text-slate-900 tracking-tighter whitespace-nowrap">MED-OS</span>}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 pt-2">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : ''}
            className={cn(
              'flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em]',
              location.pathname === item.path
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900',
            )}
          >
            <item.icon size={16} className={cn(location.pathname === item.path ? 'text-primary' : 'text-slate-300')} />
            {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className={cn('p-4 border-t border-slate-100 bg-slate-50/50 transition-all', isCollapsed ? 'px-2' : 'px-5')}>
        <Link
          to="/profile"
          className={cn(
            'flex items-center gap-4 mb-5 px-3 py-3 rounded-2xl transition-all hover:bg-white hover:shadow-md group',
            location.pathname === '/profile' && 'bg-white shadow-md',
          )}
        >
          <div className="w-11 h-11 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden shrink-0 group-hover:bg-primary/20 transition-colors border border-transparent group-hover:border-primary/30">
            <User size={22} />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">{userName}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {role === UserRole.ADMIN
                  ? 'Hệ thống'
                  : role === UserRole.DOCTOR
                  ? 'Bác sĩ'
                  : role === UserRole.TECHNICIAN
                  ? 'Kỹ thuật'
                  : 'Bệnh nhân'}
              </p>
            </div>
          )}
        </Link>
        <button
          onClick={onLogout}
          className={cn(
            'flex items-center gap-4 px-5 py-3 w-full rounded-2xl transition-all text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 overflow-hidden',
            isCollapsed && 'justify-center px-0',
          )}
        >
          <LogOut size={16} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Thoát hệ thống</span>}
        </button>
      </div>
    </aside>
  );
}
