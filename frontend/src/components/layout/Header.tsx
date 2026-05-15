import { Link } from 'react-router-dom';
import { Bell, Clock, CreditCard, CalendarClock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HeaderProps {
  userName: string;
}

function NotificationMenu() {
  return (
    <div className="relative group">
      <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative">
        <Bell size={20} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
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
              <p className="text-xs font-bold text-slate-800">Lịch khám của bạn</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Có một bệnh nhân đặt lại lịch khám trong vòng 15 phút tới.</p>
              <p className="text-[9px] text-slate-300 font-bold mt-1 uppercase">4 phút trước</p>
            </div>
          </Link>
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
