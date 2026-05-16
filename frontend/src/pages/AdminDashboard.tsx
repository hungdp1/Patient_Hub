import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Search, 
  Trash2, 
  Lock, 
  Unlock, 
  Stethoscope, 
  User as UserIcon,
  Mail,
  Phone,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  XCircle,
  X as CloseIcon,
  Edit2,
  History,
  Database,
  FlaskConical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';
import { dataService } from '../services/dataService';

interface ManagedUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'LOCKED';
  joinedDate: string;
  department?: string;
}

interface ChangeLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
  type: 'USER' | 'DUTY' | 'SYSTEM';
}

export interface WorkingShift {
  id: string;
  doctorId: string;
  doctorName: string;
  department?: string;
  date: string;
  slot?: string;
  timeSlot?: string;
  patientName?: string;
  patientSummary?: string;
  reason?: string;
  type: 'REGULAR' | 'ON_CALL';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'APPROVED' | 'DECLINED' | 'PENDING';
}


export default function AdminDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'USERS' | 'DUTY' | 'HISTORY'>('USERS');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'HISTORY') setActiveTab('HISTORY');
    else if (tabParam === 'DUTY') setActiveTab('DUTY');
    else setActiveTab('USERS');
  }, [location.search]);

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [shifts, setShifts] = useState<WorkingShift[]>([]);
  const [historyLogs, setHistoryLogs] = useState<ChangeLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, shiftsData, historyData] = await Promise.all([
          dataService.getAdminUsers().catch(() => []),
          dataService.getAdminShifts().catch(() => []),
          dataService.getAdminHistory().catch(() => []),
        ]);
        setUsers(usersData);
        setShifts(shiftsData);
        setHistoryLogs(historyData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DOCTOR' | 'PATIENT' | 'TECHNICIAN'>('ALL');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [newUser, setNewUser] = useState<Partial<ManagedUser>>({ role: UserRole.DOCTOR, status: 'ACTIVE' });

  // Duty Management State
  const [viewedMonth, setViewedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDoctorForShift, setSelectedDoctorForShift] = useState<ManagedUser | null>(null);
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [newShift, setNewShift] = useState({ date: '', slotId: '' });
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [isViewingSystemCalendar, setIsViewingSystemCalendar] = useState(false);
  const [selectedShiftForDetails, setSelectedShiftForDetails] = useState<WorkingShift | null>(null);
  const [systemDateFrom, setSystemDateFrom] = useState('');
  const [systemDateTo, setSystemDateTo] = useState('');
  const [systemDoctorSearch, setSystemDoctorSearch] = useState('');

  const DEPARTMENTS = ['ALL', 'Nội tổng quát', 'Nhi khoa', 'Xét nghiệm', 'Sản khoa', 'Tai Mũi Họng'];

  const SHIFT_SLOTS = [
    { id: 'S', label: 'Ca Sáng', time: '08:00 - 12:00', type: 'REGULAR' as const },
    { id: 'C', label: 'Ca Chiều', time: '13:30 - 17:30', type: 'REGULAR' as const },
    { id: 'T', label: 'Ca Tối/Trực', time: '18:00 - 07:00 (Hôm sau)', type: 'ON_CALL' as const },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.phone.includes(searchTerm);
    const matchesRole = activeFilter === 'ALL' || user.role === activeFilter;
    return matchesSearch && matchesRole;
  });

  const toggleLock = (id: string) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, status: user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' } : user
    ));
  };

  const deleteUser = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      setUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.phone) {
      const user: ManagedUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: newUser.name,
        role: newUser.role as UserRole,
        email: newUser.email,
        phone: newUser.phone,
        status: 'ACTIVE',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setUsers([user, ...users]);
      setIsAddingUser(false);
      setNewUser({ role: UserRole.DOCTOR, status: 'ACTIVE' });
    }
  };

  const handleUpdateUser = () => {
    if (editingUser && editingUser.name && editingUser.email && editingUser.phone) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
    }
  };

  // Duty Handlers
  const nextMonth = () => setViewedMonth(new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 1));
  const prevMonth = () => setViewedMonth(new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() - 1, 1));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const padding = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < padding; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDate; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleApproveShift = (id: string) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, status: 'APPROVED' } : s));
  };

  const handleDeclineShift = (id: string, reason: string = 'Quản lý từ chối') => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, status: 'DECLINED', reason } : s));
  };

  const handleCreateShift = () => {
    const finalDate = newShift.date || selectedDate;
    const slot = SHIFT_SLOTS.find(s => s.id === newShift.slotId);
    
    if (finalDate && selectedDoctorForShift && slot) {
      const shift: WorkingShift = {
        id: Math.random().toString(36).substr(2, 9),
        doctorId: selectedDoctorForShift.id,
        doctorName: selectedDoctorForShift.name,
        date: finalDate.includes('-') ? finalDate.split('-').reverse().join('/') : finalDate,
        timeSlot: slot.time,
        type: slot.type,
        status: 'APPROVED'
      };
      setShifts([...shifts, shift]);
      setIsAddingShift(false);
      setNewShift({ ...newShift, slotId: '' });
    }
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Quản trị Nhân sự</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('USERS')}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'USERS' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              )}
            >
              Nhân sự & Bệnh nhân
            </button>
            <button 
              onClick={() => setActiveTab('DUTY')}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'DUTY' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              )}
            >
              Lịch trực
            </button>
            <button 
              onClick={() => setActiveTab('HISTORY')}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'HISTORY' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              )}
            >
              Lịch sử thay đổi
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
        </div>
      </div>


      {/* Conditional Content */}
      {activeTab === 'USERS' ? (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <h3 className="font-black text-slate-800 flex items-center gap-2 text-xl">
                Quản lý tài khoản
              </h3>
              <div className="flex bg-white p-1 rounded-[1.2rem] border border-slate-200 shadow-sm relative">
                {(['ALL', 'DOCTOR', 'TECHNICIAN', 'PATIENT'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={cn(
                      "px-5 py-1.5 rounded-lg text-xs font-black transition-all relative z-10",
                      activeFilter === f ? "text-white" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {activeFilter === f && (
                      <motion.div 
                        layoutId="activeFilterBg"
                        className="absolute inset-0 bg-slate-900 rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    {f === 'ALL' ? 'Tất cả' : f === 'DOCTOR' ? 'Bác sĩ' : f === 'TECHNICIAN' ? 'KTV' : 'Bệnh nhân'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-64 focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm text-sm"
                />
              </div>
              <button 
                onClick={() => setIsAddingUser(true)}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                Thêm mới
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="w-[30%] px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người dùng</th>
                  <th className="w-[20%] px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vai trò</th>
                  <th className="w-[30%] px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Liên hệ</th>
                  <th className="w-[15%] px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                  <th className="w-[5%] px-8 py-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="wait">
                  {filteredUsers.map((user) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      key={user.id} 
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-800">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">ID: {user.id}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-tighter whitespace-nowrap px-2 py-1 rounded-lg",
                          user.role === UserRole.DOCTOR ? "bg-emerald-50 text-emerald-600" : user.role === UserRole.TECHNICIAN ? "bg-indigo-50 text-indigo-600" : "bg-orange-50 text-orange-600"
                        )}>
                          {user.role === UserRole.DOCTOR ? 'Bác sĩ' : user.role === UserRole.TECHNICIAN ? 'KTV' : 'Bệnh nhân'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1 overflow-hidden">
                          <div className="text-xs text-slate-500 font-medium truncate">
                             {user.email}
                          </div>
                          <div className="text-xs text-slate-500 font-medium truncate">
                             {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block whitespace-nowrap",
                          user.status === 'ACTIVE' ? "bg-green-100 text-green-600 border border-green-200" : "bg-rose-100 text-rose-600 border border-rose-200"
                        )}>
                          {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingUser(user)}
                            className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => toggleLock(user.id)}
                            className={cn(
                              "p-2 rounded-xl transition-all",
                              user.status === 'ACTIVE' ? "bg-orange-50 text-orange-500 hover:bg-orange-100" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                            )}
                            title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {user.status === 'ACTIVE' ? <Lock size={18} /> : <Unlock size={18} />}
                          </button>
                          <button 
                            onClick={() => deleteUser(user.id)}
                            className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'DUTY' ? (
        <div className="space-y-8">
          {/* Header Actions for Duty */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex flex-col">
                <h3 className="text-3xl font-black text-slate-900">Điều phối lịch trực</h3>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Quản lý thời gian biểu đội ngũ y tế</p>
            </div>
            <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setIsViewingSystemCalendar(true)}
                   className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                   Xem lịch hệ thống
                 </button>
                 {selectedDate && (
                   <button 
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedDoctorForShift(null);
                      }}
                      className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                   >
                      Quay lại
                   </button>
                 )}
            </div>
          </div>

          <div className="min-h-[600px]">
            <AnimatePresence mode="wait">
              {!selectedDate ? (
                <motion.div 
                  key="requests"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 pb-6 border-b border-slate-50 gap-4">
                        <div className="flex flex-col">
                           <h4 className="font-black text-slate-900 text-2xl tracking-tight uppercase">Yêu cầu đang chờ phê duyệt</h4>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Phê duyệt để cập nhật lịch công tác</p>
                        </div>
                        <span className="px-4 py-2 bg-orange-100/50 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          {shifts.filter(s => s.status === 'PENDING').length} mới
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                         {shifts.filter(s => s.status === 'PENDING').length === 0 ? (
                           <div className="w-full py-32 text-center space-y-6">
                              <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto text-slate-300 font-black shadow-inner">
                                OK
                              </div>
                              <div className="space-y-2">
                                <p className="text-slate-400 font-bold text-lg">Hiện không có yêu cầu nào mới</p>
                                <p className="text-slate-300 text-sm">Tất cả lịch làm việc đã được sắp xếp ổn định.</p>
                              </div>
                           </div>
                         ) : (
                            shifts.filter(s => s.status === 'PENDING').map(s => {
                             const doctor = users.find(u => u.id === s.doctorId);
                              return (
                               <div 
                                 key={s.id} 
                                 className="w-full p-6 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col xl:flex-row xl:items-center gap-6 hover:border-primary/30 hover:shadow-2xl transition-all group cursor-default shadow-sm ring-1 ring-slate-900/[0.02]"
                               >
                                  {/* Column 1: Doctor Info */}
                                  <div className="xl:w-[220px] shrink-0 space-y-1.5">
                                     <p className="font-black text-slate-900 group-hover:text-primary transition-all text-lg truncate tracking-tight uppercase">{s.doctorName}</p>
                                     <div className="flex items-center gap-3">
                                        <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded-lg font-black uppercase tracking-widest">{doctor?.role === 'DOCTOR' ? 'Bác sĩ' : 'KTV'}</span>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {s.doctorId}</p>
                                     </div>
                                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{s.date}</p>
                                  </div>
 
                                  <div className="hidden xl:block w-px h-12 bg-slate-100 shrink-0" />
 
                                  {/* Column 2: Time Slot */}
                                  <div className="xl:w-[140px] shrink-0">
                                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Khung giờ</span>
                                     <span className="text-sm font-black text-slate-800 block tracking-tight">{s.timeSlot}</span>
                                  </div>
 
                                  <div className="hidden xl:block w-px h-12 bg-slate-100 shrink-0" />
 
                                  {/* Column 3: Patient & Reason Info */}
                                  <div 
                                    className="grow flex flex-col sm:flex-row gap-4 min-w-0 cursor-pointer"
                                    onClick={() => setSelectedShiftForDetails(s)}
                                  >
                                     <div className="flex-1 min-w-0">
                                        {s.patientName ? (
                                          <div className="h-full p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl space-y-1 group-hover:bg-indigo-50 transition-all">
                                             <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Bệnh nhân</p>
                                             <p className="font-black text-slate-800 text-xs truncate uppercase">{s.patientName}</p>
                                             {s.patientSummary && (
                                               <p className="text-[10px] text-slate-400 font-bold truncate italic opacity-70">
                                                  "{s.patientSummary}"
                                               </p>
                                             )}
                                          </div>
                                        ) : (
                                          <div className="h-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center italic text-[10px] text-slate-300 font-bold uppercase">Trống</div>
                                        )}
                                     </div>
 
                                     <div className="flex-1 min-w-0">
                                        {s.reason ? (
                                          <div className="h-full p-4 bg-orange-50/50 border border-orange-100/50 rounded-2xl space-y-1 group-hover:bg-orange-50 transition-all">
                                             <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Lý do điều phối</p>
                                             <p className="text-[10px] text-slate-500 font-bold italic line-clamp-2 leading-relaxed">
                                                "{s.reason}"
                                             </p>
                                          </div>
                                        ) : (
                                          <div className="h-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-[9px] font-black text-slate-300 uppercase tracking-widest">Lịch thường kỳ</div>
                                        )}
                                     </div>
                                  </div>
 
                                  <div className="hidden xl:block w-px h-12 bg-slate-100 shrink-0" />
 
                                  {/* Column 5: Actions */}
                                  <div className="flex items-center gap-3 shrink-0 self-end xl:self-center">
                                     <button 
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handleDeclineShift(s.id);
                                       }}
                                       className="px-6 py-3 border border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-all"
                                     >
                                        Từ chối
                                     </button>
                                     <button 
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handleApproveShift(s.id);
                                         setSelectedDoctorForShift(users.find(u => u.id === s.doctorId) || null);
                                         setSelectedDate(s.date);
                                       }}
                                       className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
                                     >
                                        Phê duyệt
                                     </button>
                                  </div>
                               </div>
                             );
                           })
                         )}
                      </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="calendar"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-8"
                >
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 pb-8 border-b border-slate-50">
                        <div className="space-y-1">
                           <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                              Bản đồ điều phối ca trực
                           </h4>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Chỉnh sửa trực tiếp để hoàn tất kế hoạch công tác</p>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-sm sm:gap-6 min-w-fit">
                            <button onClick={prevMonth} className="px-5 py-2 hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition-all border border-transparent hover:border-slate-100 whitespace-nowrap">Trước</button>
                            <h4 className="text-sm font-black text-slate-800 min-w-32 text-center uppercase tracking-[0.2em] px-2">
                               {viewedMonth.getMonth() + 1} / {viewedMonth.getFullYear()}
                            </h4>
                            <button onClick={nextMonth} className="px-5 py-2 hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition-all border border-transparent hover:border-slate-100 whitespace-nowrap">Sau</button>
                        </div>
                     </div>
      
                     <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-inner">
                        {['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map(d => (
                          <div key={d} className="bg-slate-50/80 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{d}</div>
                        ))}
                        {getDaysInMonth(viewedMonth).map((day, idx) => {
                          const dateStr = day?.toLocaleDateString('vi-VN');
                          const dayShifts = dateStr ? shifts.filter(s => s.date === dateStr && s.status === 'APPROVED') : [];
                          const isToday = dateStr === new Date().toLocaleDateString('vi-VN');
                          const isSelected = selectedDate === dateStr;
      
                          return (
                            <div 
                              key={idx} 
                              onClick={() => {
                                if (day) {
                                  setSelectedDate(day.toLocaleDateString('vi-VN'));
                                }
                              }}
                              className={cn(
                                "bg-white h-48 p-4 transition-all cursor-pointer relative group",
                                day ? "hover:bg-slate-50/50" : "bg-slate-50/10",
                                isSelected && "ring-4 ring-primary ring-inset z-20 bg-primary/5 shadow-2xl"
                              )}
                            >
                               {day && (
                                 <>
                                    <div className="flex justify-between items-start">
                                       <span className={cn(
                                         "text-sm font-black w-8 h-8 flex items-center justify-center transition-all",
                                         isToday ? "bg-primary text-slate-900 rounded-full shadow-lg shadow-primary/20 scale-110" : "text-slate-400 group-hover:text-slate-800"
                                       )}>
                                         {day.getDate()}
                                       </span>
                                       {dayShifts.length > 0 && (
                                         <div className="flex -space-x-3">
                                            {Array.from(new Set(dayShifts.map(s => s.doctorId))).slice(0, 3).map((id, i) => (
                                              <div key={id} className="w-6 h-6 rounded-xl bg-primary/20 border-2 border-white flex items-center justify-center text-[10px] font-black text-primary shadow-sm relative z-[1]">
                                                 {i + 1}
                                              </div>
                                            ))}
                                            {new Set(dayShifts.map(s => s.doctorId)).size > 3 && (
                                              <div className="w-6 h-6 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[8px] font-black border-2 border-white z-0">
                                                 +{new Set(dayShifts.map(s => s.doctorId)).size - 3}
                                              </div>
                                            )}
                                         </div>
                                       )}
                                    </div>
                                    
                                    <div className="mt-4 space-y-1.5 overflow-y-auto max-h-28 pr-1 custom-scrollbar-thin">
                                       {dayShifts.slice(0, 4).map(s => (
                                         <div key={s.id} className="p-1.5 px-3 bg-emerald-50/50 border border-emerald-100/50 rounded-lg text-[10px] font-bold text-emerald-700 flex justify-between items-center group/shift transition-all hover:bg-emerald-100 hover:border-emerald-200">
                                            <span className="truncate max-w-[60px]">{s.doctorName.split(' ').pop()}</span>
                                            <span className="text-[8px] opacity-60 font-black">{s.timeSlot.split(' - ')[0]}</span>
                                         </div>
                                       ))}
                                       {dayShifts.length > 4 && (
                                         <p className="text-[9px] font-black text-slate-300 pl-2 uppercase tracking-widest mt-1">+{dayShifts.length - 4} lịch khác</p>
                                       )}
                                    </div>
                                    
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all scale-90 translate-y-2 group-hover:translate-y-0">
                                       <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-2xl shadow-slate-400 active:scale-95 font-black text-xl">
                                          +
                                       </div>
                                    </div>
                                 </>
                               )}
                            </div>
                          );
                        })}
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>


      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px]">
          <div className="p-8 border-b border-slate-100 bg-slate-50/30">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-xl">
              Lịch sử các thay đổi
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Ghi lại toàn bộ thao tác quản trị trên hệ thống</p>
          </div>
          
          <div className="p-8 space-y-6">
            {historyLogs.map((log, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={log.id} 
                className="flex gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-primary/20 transition-all group"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-900">{log.action}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
                        log.type === 'USER' ? "bg-emerald-50 text-emerald-500" : log.type === 'DUTY' ? "bg-orange-50 text-orange-500" : "bg-purple-50 text-purple-500"
                      )}>
                        {log.type}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Đối tượng: <span className="font-bold text-slate-800">{log.target}</span>
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">
                    "{log.details}"
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                    Người thực hiện: {log.userName}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Duty Management Modals */}
      <AnimatePresence>
        {/* Shift Details Modal */}
        {selectedShiftForDetails && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedShiftForDetails(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
            >
               <div className="p-10 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="flex flex-col">
                           <h4 className="text-2xl font-black text-slate-900">Chi tiết yêu cầu</h4>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedShiftForDetails.date} • {selectedShiftForDetails.timeSlot}</p>
                     </div>
                     <button onClick={() => setSelectedShiftForDetails(null)} className="px-4 py-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all text-[10px] font-black uppercase">Đóng</button>
                  </div>

                  <div className="space-y-6">
                     <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                        <div className="flex flex-col gap-1 px-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Người thực hiện</p>
                           <p className="font-extrabold text-slate-800 text-lg">{selectedShiftForDetails.doctorName}</p>
                        </div>
                     </div>

                     {selectedShiftForDetails.patientName && (
                       <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[2rem] space-y-4">
                          <div className="flex flex-col gap-1 px-1">
                             <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Thông tin bệnh nhân</p>
                             <p className="font-extrabold text-slate-800 text-lg">{selectedShiftForDetails.patientName}</p>
                          </div>
                          {selectedShiftForDetails.patientSummary && (
                            <div className="bg-white/60 p-4 rounded-2xl border border-indigo-100/50">
                               <p className="text-sm font-bold text-slate-800 underline decoration-indigo-200 underline-offset-4 mb-2">Tóm tắt bệnh lý:</p>
                               <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                                  "{selectedShiftForDetails.patientSummary}"
                               </p>
                            </div>
                          )}
                       </div>
                     )}

                     {selectedShiftForDetails.reason && (
                       <div className="p-6 bg-orange-50 border border-orange-100 rounded-[2rem] space-y-4">
                          <div className="flex flex-col gap-1 px-1">
                             <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Lý do điều phối</p>
                             <p className="text-sm font-bold text-slate-800 tracking-tight">Yêu cầu thay đổi ca làm việc</p>
                          </div>
                          <div className="bg-white/60 p-4 rounded-2xl border border-orange-100/50">
                             <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                                "{selectedShiftForDetails.reason}"
                             </p>
                          </div>
                       </div>
                     )}
                  </div>

                  <button 
                    onClick={() => setSelectedShiftForDetails(null)}
                    className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] text-sm font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                  >
                     Đóng cửa sổ
                  </button>
               </div>
            </motion.div>
          </div>
        )}

        {isViewingSystemCalendar && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsViewingSystemCalendar(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-5xl h-full max-h-[85vh] rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <div className="p-8 md:p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/40 relative">
                 <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                       <h3 className="text-3xl font-black text-slate-900 tracking-tight">Kế hoạch Điều phối Tổng thể</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Danh sách chi tiết các ca trực toàn hệ thống
                       </p>
                    </div>
                 </div>
                 
                 <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 bg-white p-3 px-5 rounded-[1.5rem] border border-slate-100 shadow-sm group focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                       <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                       <input 
                         type="text" 
                         placeholder="TÌM TÊN BÁC SĨ..."
                         value={systemDoctorSearch}
                         onChange={(e) => setSystemDoctorSearch(e.target.value)}
                         className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-44 placeholder:text-slate-300"
                       />
                       {systemDoctorSearch && (
                         <button onClick={() => setSystemDoctorSearch('')} className="text-slate-300 hover:text-rose-500 transition-colors"><CloseIcon size={14} /></button>
                       )}
                    </div>
 
                    <div className="flex items-center gap-1 bg-white p-1 rounded-[1.5rem] border border-slate-100 shadow-sm">
                       <div className="px-4 py-2 flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Từ ngày</span>
                          <input 
                            type="date"
                            value={systemDateFrom}
                            onChange={(e) => setSystemDateFrom(e.target.value)}
                            className="bg-transparent border-none outline-none text-[10px] font-black uppercase cursor-pointer"
                          />
                       </div>
                       <div className="w-px h-8 bg-slate-100 mx-1" />
                       <div className="px-4 py-2 flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Đến ngày</span>
                          <input 
                            type="date"
                            value={systemDateTo}
                            onChange={(e) => setSystemDateTo(e.target.value)}
                            className="bg-transparent border-none outline-none text-[10px] font-black uppercase cursor-pointer"
                          />
                       </div>
                    </div>
 
                    <button 
                       onClick={() => setIsViewingSystemCalendar(false)} 
                       className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
                    >
                       Đóng bản đồ
                    </button>
                 </div>
              </div>
 
              <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar space-y-8 bg-slate-50/20">
                 <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
                    {shifts
                      .filter(s => {
                        // Date filter
                        const shiftDateStr = s.date.split('/').reverse().join('-'); // DD/MM/YYYY to YYYY-MM-DD
                        if (systemDateFrom && shiftDateStr < systemDateFrom) return false;
                        if (systemDateTo && shiftDateStr > systemDateTo) return false;
                        
                        // Doctor filter
                        if (systemDoctorSearch) {
                          const term = systemDoctorSearch.toLowerCase();
                          return s.doctorName.toLowerCase().includes(term) || s.doctorId.toLowerCase().includes(term);
                        }
                        return true;
                      })
                      .sort((a, b) => {
                        const dateA = a.date.split('/').reverse().join('-');
                        const dateB = b.date.split('/').reverse().join('-');
                        return dateB.localeCompare(dateA);
                      }).map((s) => (
                      <div 
                        key={s.id}
                        className="bg-white border border-slate-100 p-7 rounded-[2.5rem] flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-primary/30 hover:shadow-2xl transition-all group shadow-sm ring-1 ring-slate-900/[0.02]"
                      >
                         <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <p className="text-xl font-black text-slate-900 tracking-tight truncate">{s.doctorName}</p>
                            <div className="flex items-center gap-3">
                               <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Bác sĩ</span>
                               <span className="text-[10px] text-slate-400 font-bold">Mã số: {s.doctorId}</span>
                            </div>
                         </div>
 
                         <div className="w-px h-12 bg-slate-100 hidden lg:block" />
 
                         <div className="flex-1 flex flex-col gap-1 px-0 lg:px-8">
                            <p className="font-black text-slate-800 tracking-tight truncate uppercase text-xs">{s.patientName || 'THÔNG TIN BỆNH NHÂN TRỐNG'}</p>
                            <p className="text-[10px] text-slate-400 font-bold italic line-clamp-1 leading-relaxed opacity-80">
                               {s.patientSummary ? `"${s.patientSummary}"` : 'Vui lòng cập nhật thông tin tóm tắt.'}
                            </p>
                         </div>
 
                         <div className="w-px h-12 bg-slate-100 hidden lg:block" />
 
                         <div className="flex items-center gap-6 lg:pl-4">
                            <div className="flex flex-col items-end whitespace-nowrap">
                               <div className="text-slate-900 font-black text-sm group-hover:text-primary transition-colors">
                                  {s.date}
                               </div>
                               <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">
                                  {s.timeSlot}
                               </div>
                            </div>
                            <div className={cn(
                              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                              s.status === 'APPROVED' ? "bg-emerald-50 text-emerald-500 border border-emerald-100" : "bg-orange-50 text-orange-500 border border-orange-100"
                            )}>
                               {s.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                            </div>
                         </div>
                      </div>
                    ))}
 
                    {shifts.length === 0 && (
                      <div className="py-48 text-center space-y-6">
                         <div className="w-24 h-24 bg-slate-100 rounded-[3rem] flex items-center justify-center mx-auto text-slate-300 shadow-inner">
                            <CalendarDays size={48} />
                         </div>
                         <div className="space-y-2">
                            <p className="text-slate-500 font-black text-xl">Chưa có bản ghi nào!</p>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Hệ thống đang chờ lệnh khởi động điều phối.</p>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedDate && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedDate(null);
                setSelectedDoctorForShift(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
               {!selectedDoctorForShift ? (
                 <div className="p-10 space-y-8 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                       <div>
                          <h3 className="text-2xl font-black text-slate-900">Quản lý ca trực ngày</h3>
                          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{selectedDate}</p>
                       </div>
                       <button onClick={() => setSelectedDate(null)} className="p-2 text-slate-400 hover:text-slate-600"><CloseIcon size={24} /></button>
                    </div>

                    <div className="flex flex-col gap-4">
                       <div className="relative group">
                          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                          <input 
                            type="text" 
                            placeholder="Tìm bác sĩ theo tên hoặc mã số (ID)..."
                            value={doctorSearchTerm}
                            onChange={(e) => setDoctorSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.8rem] focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner text-sm"
                          />
                       </div>

                       <div className="flex overflow-x-auto pb-2 gap-2 custom-scrollbar-thin">
                          {DEPARTMENTS.map(dept => (
                            <button
                              key={dept}
                              onClick={() => setSelectedDeptFilter(dept)}
                              className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                selectedDeptFilter === dept 
                                  ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                              )}
                            >
                              {dept === 'ALL' ? 'Tất cả khoa' : dept}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                       {users
                         .filter(u => u.role === UserRole.DOCTOR || u.role === UserRole.TECHNICIAN)
                         .filter(u => {
                            const term = doctorSearchTerm.toLowerCase();
                            const matchesSearch = u.name.toLowerCase().includes(term) || u.id.toLowerCase().includes(term);
                            const matchesDept = selectedDeptFilter === 'ALL' || u.department === selectedDeptFilter;
                            return matchesSearch && matchesDept;
                         })
                         .map(doc => {
                           const docShifts = shifts.filter(s => s.date === selectedDate && s.doctorId === doc.id && s.status === 'APPROVED');
                           return (
                             <div 
                               key={doc.id}
                               onClick={() => setSelectedDoctorForShift(doc)}
                               className="p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-between group hover:bg-white hover:border-primary/30 transition-all cursor-pointer shadow-sm"
                             >
                                <div className="flex flex-col pr-4">
                                   <p className="font-extrabold text-slate-800 group-hover:text-primary transition-colors">{doc.name}</p>
                                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">ID: {doc.id} • {doc.department}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                   {docShifts.length > 0 && (
                                     <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase">
                                       {docShifts.length} Ca
                                     </span>
                                   )}
                                   <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-all" />
                                </div>
                             </div>
                           );
                         })}
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col h-full">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                       <div className="flex items-center gap-5">
                          <button onClick={() => setSelectedDoctorForShift(null)} className="p-3 bg-white text-slate-400 rounded-2xl hover:text-slate-600 shadow-sm hover:shadow-md transition-all"><ChevronLeft size={20} /></button>
                          <div>
                             <h4 className="text-xl font-black text-slate-900">{selectedDoctorForShift.name}</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sửa trực tiếp lịch ngày {selectedDate}</p>
                          </div>
                       </div>
                       <button onClick={() => setSelectedDate(null)} className="p-2 text-slate-400 hover:text-slate-600"><CloseIcon size={24} /></button>
                    </div>

                    <div className="p-8 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
                       <div className="space-y-4">
                          <div className="flex justify-between items-center mb-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách ca trực hiện tại</p>
                             <button 
                               onClick={() => {
                                 const d = selectedDate ? selectedDate.split('/').reverse().join('-') : '';
                                 setNewShift(prev => ({ ...prev, date: d }));
                                 setIsAddingShift(true);
                               }}
                               className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                             >
                                <Plus size={14} /> Sắp ca mới
                             </button>
                          </div>

                          <div className="space-y-3">
                             {shifts.filter(s => s.date === selectedDate && s.doctorId === selectedDoctorForShift.id && s.status === 'APPROVED').map(s => (
                               <div key={s.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                                  <div className="flex flex-col">
                                     <div className="flex items-center gap-3">
                                        <p className="font-black text-slate-800 text-base tracking-tight">{s.timeSlot}</p>
                                        <span className={cn(
                                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                          s.type === 'REGULAR' ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-600"
                                        )}>
                                           {s.type === 'REGULAR' ? 'THƯỜNG' : 'TRỰC GÁC'}
                                        </span>
                                     </div>
                                     <p className="text-[9px] text-slate-400 font-black uppercase mt-0.5">Trạng thái: Đã phê duyệt</p>
                                  </div>
                                  <button 
                                    onClick={() => setShifts(prev => prev.filter(sh => sh.id !== s.id))}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                  >
                                     <Trash2 size={18} />
                                  </button>
                               </div>
                             ))}
                             {shifts.filter(s => s.date === selectedDate && s.doctorId === selectedDoctorForShift.id && s.status === 'APPROVED').length === 0 && (
                               <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] space-y-4">
                                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-300 mx-auto shadow-sm">
                                     <CalendarDays size={32} />
                                  </div>
                                  <p className="text-sm text-slate-400 font-bold">Chưa có lịch trực nào được sắp xếp{"\n"}cho bác sĩ vào ngày này.</p>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>

                    <AnimatePresence>
                       {isAddingShift && (
                         <motion.div 
                           initial={{ opacity: 0, y: 50 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: 50 }}
                           className="p-8 bg-slate-50 border-t border-slate-200"
                         >
                            <div className="flex items-center justify-between mb-6">
                               <h5 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary rounded-full" /> Thiết lập ca trực nhanh
                               </h5>
                               <button onClick={() => setIsAddingShift(false)} className="text-slate-400 hover:text-slate-600"><CloseIcon size={20} /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Ngày làm việc</label>
                                  <input 
                                    type="date" 
                                    value={newShift.date}
                                    onChange={(e) => setNewShift(p => ({ ...p, date: e.target.value }))}
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[1.2rem] text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Chọn ca làm việc</label>
                                  <div className="grid grid-cols-1 gap-2">
                                     {SHIFT_SLOTS.map(slot => (
                                       <button
                                         key={slot.id}
                                         onClick={() => setNewShift(p => ({ ...p, slotId: slot.id }))}
                                         className={cn(
                                           "w-full px-5 py-4 rounded-[1.2rem] text-sm font-bold border transition-all text-left flex justify-between items-center",
                                           newShift.slotId === slot.id 
                                             ? "bg-primary text-slate-900 border-primary shadow-lg shadow-primary/10" 
                                             : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                         )}
                                       >
                                          <div className="flex flex-col">
                                             <span>{slot.label}</span>
                                             <span className="text-[10px] opacity-60 font-black">{slot.time}</span>
                                          </div>
                                          {newShift.slotId === slot.id && <CheckCircle2 size={18} />}
                                       </button>
                                     ))}
                                  </div>
                               </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                               <button onClick={() => setIsAddingShift(false)} className="flex-1 py-4 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all">Làm sau</button>
                               <button onClick={handleCreateShift} className="flex-[2] py-4 text-xs font-bold text-white bg-slate-900 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">Hoàn tất sắp lịch</button>
                            </div>
                         </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Add User Modal */}

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingUser(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Thêm tài khoản mới</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cung cấp thông tin định danh hệ thống</p>
                </div>

                <div className="space-y-4">
                      <div className="flex bg-slate-100 p-2 rounded-2xl gap-1.5 relative">
                        {(['DOCTOR', 'TECHNICIAN', 'PATIENT'] as const).map(r => (
                          <button
                            key={r}
                            onClick={() => setNewUser(prev => ({ ...prev, role: r as UserRole }))}
                            className={cn(
                              "flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all relative z-10",
                              newUser.role === r ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            {newUser.role === r && (
                              <motion.div 
                                layoutId="newUserRoleBg"
                                className="absolute inset-0 bg-white rounded-xl shadow-md -z-10"
                                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                              />
                            )}
                            {r === 'DOCTOR' ? 'Bác sĩ' : r === 'TECHNICIAN' ? 'KTV' : 'Bệnh nhân'}
                          </button>
                        ))}
                      </div>

                  <div className="grid grid-cols-1 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Họ và tên</label>
                        <input 
                          type="text" 
                          placeholder="Ví dụ: Trần Văn C"
                          value={newUser.name || ''}
                          onChange={(e) => setNewUser(p => ({ ...p, name: e.target.value }))}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Email</label>
                           <input 
                              type="email" 
                              placeholder="email@medos.vn"
                              value={newUser.email || ''}
                              onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Số điện thoại</label>
                           <input 
                              type="tel" 
                              placeholder="09xx xxx xxx"
                              value={newUser.phone || ''}
                              onChange={(e) => setNewUser(p => ({ ...p, phone: e.target.value }))}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                           />
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setIsAddingUser(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Huỷ</button>
                  <button onClick={handleAddUser} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">Xác nhận</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Chỉnh sửa tài khoản</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cập nhật thông tin định danh người dùng</p>
                </div>

                <div className="space-y-4">
                      <div className="flex bg-slate-100 p-2 rounded-2xl gap-1.5 relative">
                        {(['DOCTOR', 'TECHNICIAN', 'PATIENT'] as const).map(r => (
                          <button
                            key={r}
                            onClick={() => setEditingUser({ ...editingUser, role: r as UserRole })}
                            className={cn(
                              "flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all relative z-10",
                              editingUser.role === r ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            {editingUser.role === r && (
                              <motion.div 
                                layoutId="editUserRoleBg"
                                className="absolute inset-0 bg-white rounded-xl shadow-md -z-10"
                                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                              />
                            )}
                            {r === 'DOCTOR' ? 'Bác sĩ' : r === 'TECHNICIAN' ? 'KTV' : 'Bệnh nhân'}
                          </button>
                        ))}
                      </div>

                  <div className="grid grid-cols-1 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Họ và tên</label>
                        <input 
                          type="text" 
                          value={editingUser.name}
                          onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Email</label>
                           <input 
                              type="email" 
                              value={editingUser.email}
                              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Số điện thoại</label>
                           <input 
                              type="tel" 
                              value={editingUser.phone}
                              onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                           />
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Huỷ</button>
                  <button onClick={handleUpdateUser} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">Lưu thay đổi</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
