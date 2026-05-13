import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles,
  CalendarClock, 
  BookOpen, 
  Library,
  ClipboardList, 
  LogOut, 
  Bell,
  User,
  HeartPulse,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Globe,
  Clock,
  Settings,
  ShieldCheck,
  LayoutDashboard,
  Users,
  FlaskConical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || t('patient_name');

  const allNavItems = [
    { label: t('dashboard'), icon: Sparkles, path: '/' },
    { label: t('scheduling'), icon: CalendarClock, path: '/scheduling' },
    { label: t('services'), icon: BookOpen, path: '/services' },
    { label: t('library'), icon: Library, path: '/library' },
    { label: t('payment'), icon: CreditCard, path: '/payment' },
    { label: t('records'), icon: ClipboardList, path: '/records' },
  ];

  const technicianNavItems = [
    { label: 'Xử lý xét nghiệm', icon: FlaskConical, path: '/lab-results' },
    { label: t('library'), icon: Library, path: '/library' },
  ];

  const managementNavItems = userRole === 'ADMIN' 
    ? [
        { label: 'Quản trị nhân sự', icon: ShieldCheck, path: '/admin' },
        { label: 'Thư viện', icon: Library, path: '/library' },
      ]
    : userRole === 'TECHNICIAN'
    ? technicianNavItems
    : [
        { label: 'Lịch hẹn', icon: CalendarClock, path: '/scheduling' },
        { label: t('library'), icon: Library, path: '/library' },
        { label: t('records'), icon: ClipboardList, path: '/records' },
      ];

  const navItems = userRole === 'ADMIN' || userRole === 'DOCTOR' || userRole === 'TECHNICIAN'
    ? managementNavItems
    : allNavItems;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-slate-200 flex flex-col transition-all duration-300 relative group hidden md:flex",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-primary shadow-sm z-50 transition-all opacity-0 group-hover:opacity-100"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={cn("p-6 border-b border-slate-100 mb-4 transition-all overflow-hidden", isCollapsed ? "px-4" : "px-6")}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-primary font-bold shrink-0">
              <HeartPulse size={20} />
            </div>
            {!isCollapsed && <span className="text-xl font-bold text-slate-900 tracking-tighter whitespace-nowrap">MED-OS</span>}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 pt-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : ""}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em]",
                location.pathname === item.path 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={16} className={cn("shrink-0", location.pathname === item.path ? "text-primary" : "text-slate-300")} />
              {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className={cn("p-4 border-t border-slate-100 bg-slate-50/50 transition-all", isCollapsed ? "px-2" : "px-5")}>
          <Link 
            to="/profile"
            className={cn(
              "flex items-center gap-4 mb-5 px-3 py-3 rounded-2xl transition-all hover:bg-white hover:shadow-md group",
              location.pathname === '/profile' && "bg-white shadow-md"
            )}
          >
            <div className="w-11 h-11 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden shrink-0 group-hover:bg-primary/20 transition-colors border border-transparent group-hover:border-primary/30">
               <User size={22} />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">{userName}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {userRole === 'ADMIN' ? 'Hệ thống' : userRole === 'DOCTOR' ? 'Bác sĩ' : userRole === 'TECHNICIAN' ? 'Kỹ thuật' : 'Bệnh nhân'}
                </p>
              </div>
            )}
          </Link>
          <button 
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-4 px-5 py-3 w-full rounded-2xl transition-all text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 overflow-hidden",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LogOut size={16} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">{t('logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-10 shrink-0">
          <div className="flex-1 flex items-center gap-6">
            <div className="md:hidden flex items-center gap-2">
               <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-primary font-bold tracking-tight">+</div>
               <span className="font-bold tracking-tight">MED-OS</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setLanguage('vi')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  language === 'vi' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                VN
              </button>
              <button 
                onClick={() => setLanguage('ja')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  language === 'ja' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                JP
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200"></div>
            
             <div className="relative group">
              <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>

              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-[2rem] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden translate-y-2 group-hover:translate-y-0 duration-300">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">Thông báo mới</p>
                </div>
                <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                  <div className="flex items-start gap-4 p-5 bg-red-50/30 hover:bg-red-50/50 transition-colors cursor-pointer border-l-4 border-red-500">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                      <Clock size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">Lịch hẹn bị hủy tự động</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Lịch hẹn khoa <span className="font-bold">Nội tổng quát</span> lúc 08:30 đã quá giờ 30 phút. Vui lòng đặt lại lịch mới.
                      </p>
                      <p className="text-[10px] text-red-500 font-bold mt-2">Đã hủy</p>
                    </div>
                  </div>

                  <Link to="/payment" className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors group/item">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                      <CreditCard size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">Yêu cầu thanh toán</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Viện phí đợt khám ngày 12/05 đang chờ bạn xử lý để tiếp tục các dịch vụ.</p>
                      <p className="text-[9px] text-slate-300 font-bold mt-1 uppercase">2 phút trước</p>
                    </div>
                  </Link>

                  <Link to="/scheduling" className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors group/item">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <CalendarClock size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">Lịch hẹn sắp tới</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Khám bệnh cùng <span className="font-bold">BS Lê Thành Nam</span> tại Phòng 102 - Tầng 1 lúc 14:00 hôm nay.</p>
                      <p className="text-[9px] text-slate-300 font-bold mt-1 uppercase">1 giờ trước</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-8 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}
