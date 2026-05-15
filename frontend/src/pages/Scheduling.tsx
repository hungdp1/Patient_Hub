import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Timer,
  Navigation,
  ArrowRightLeft,
  Activity,
  User as UserIcon,
  Calendar,
  Stethoscope,
  MessageSquare,
  Send,
  ChevronRight,
  X,
  CalendarDays,
  AlertCircle,
  Undo2,
  Check,
  Ban,
  FileText,
  Search,
  ClipboardList,
  FlaskConical,
  User
} from 'lucide-react';
import { MOCK_EXAMS, MOCK_RECORDS } from '../constants';
import { ExamStatus, type MedicalExam, UserRole, MedicalRecord } from '../types';
import { cn } from '../lib/utils';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  date: string;
  status: string;
  dept: string;
  cancelReason?: string;
}

export default function Scheduling() {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.PATIENT);
  const [exams] = useState<MedicalExam[]>(MOCK_EXAMS);
  const [hasAppointment, setHasAppointment] = useState(false);
  const [bookingStep, setBookingStep] = useState(0); // 0: department search
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingData, setBookingData] = useState({ 
    dept: '', 
    date: new Date().toLocaleDateString('vi-VN'),
    time: '' 
  });

  // Doctor state
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', patientName: 'Nguyễn Văn A', time: '08:00', date: new Date().toLocaleDateString('vi-VN'), status: 'PENDING', dept: 'Nội tổng quát' },
    { id: '2', patientName: 'Trần Thị B', time: '09:30', date: new Date().toLocaleDateString('vi-VN'), status: 'ACCEPTED', dept: 'Nội tổng quát' },
    { id: '3', patientName: 'Lê Văn C', time: '10:15', date: new Date().toLocaleDateString('vi-VN'), status: 'PENDING', dept: 'Nội tổng quát' },
  ]);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [cancellingAppId, setCancellingAppId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);
  const [isCreatingApp, setIsCreatingApp] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [newRecordData, setNewRecordData] = useState({
    patientName: '',
    diagnosis: '',
    symptoms: '',
    medications: [{ 
      name: '', 
      dosage: '', 
      quantity: 1, 
      price: 0, 
      unit: 'viên', 
      morning: 1, 
      noon: 0, 
      afternoon: 0, 
      evening: 1, 
      duration: '', 
      instructions: '' 
    }],
    prescriptionNotes: '',
    generalUsageInstructions: ''
  });
  const [newAppData, setNewAppData] = useState({
    patientName: '',
    time: '08:00',
    date: new Date().toLocaleDateString('vi-VN'),
    dept: 'Nội tổng quát'
  });

  const patientAppointment = appointments.find(a => a.patientName === 'Nguyễn Văn A'); // Simulate current patient info
  
  const isAdmin = userRole === UserRole.ADMIN;

  const canEditRecord = (createdAt?: string) => {
    if (!createdAt) return true; // New record
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };


  useEffect(() => {
    const role = localStorage.getItem('userRole') as UserRole;
    if (role) setUserRole(role);
  }, []);

  const doctorInfo = {
    name: 'BS. CKII. Lê Thành Nam',
    age: 45,
    specialty: 'Nội tổng quát',
    education: 'Thạc sĩ Y khoa - Đại học Y Dược TP.HCM',
    achievements: [
      '15 năm kinh nghiệm lâm sàng',
      'Thầy thuốc ưu tú 2021',
      'Chuyên gia quản lý bệnh mãn tính'
    ],
    rooms: ['Phòng 102 - Tầng 1']
  };


  const departments = [
    { id: 'internal', name: 'Nội tổng quát', icon: Stethoscope, description: 'Khám các bệnh lý nội khoa, tiêu hóa, hô hấp.' },
    { id: 'cardio', name: 'Tim mạch', icon: Activity, description: 'Kiểm tra huyết áp, nhịp tim, tầm soát tim mạch.' },
    { id: 'pedia', name: 'Nhi khoa', icon: UserIcon, description: 'Chăm sóc sức khỏe toàn diện cho trẻ em.' },
  ];

  const timeSlots = ['08:00', '09:30', '10:15', '14:00', '15:30'];
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString('vi-VN');
    return {
      label: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : d.toLocaleDateString('vi-VN', { weekday: 'short' }),
      date: dateStr,
      day: d.getDate(),
      isOff: false,
      offReason: ''
    };
  });

  // Logic: Calculate priority based on WaitTime + ExecutionTime
  const recommendation = useMemo(() => {
    if (!hasAppointment) return null;
    const pending = exams.filter(e => e.status !== ExamStatus.COMPLETED);
    if (pending.length === 0) return null;

    const sorted = [...pending].sort((a, b) => {
      const scoreA = a.currentWaitTime + (a.name.includes('Xét nghiệm') ? -20 : 0);
      const scoreB = b.currentWaitTime + (b.name.includes('Xét nghiệm') ? -20 : 0);
      return scoreA - scoreB;
    });

    return sorted[0];
  }, [exams, hasAppointment]);

  const handleBooking = () => {
    const newAppointment = {
      id: Math.random().toString(),
      patientName: 'Nguyễn Văn A',
      time: bookingData.time,
      date: bookingData.date,
      status: 'PENDING',
      dept: bookingData.dept
    };
    setAppointments(prev => [newAppointment, ...prev]);
    setHasAppointment(true);
    setShowModal(false);
    setBookingStep(0);
  };

  const handleCancelAppointment = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này không?')) {
      setHasAppointment(false);
      setBookingData({ dept: '', date: new Date().toLocaleDateString('vi-VN'), time: '' });
      setBookingStep(0);
    }
  };

  const selectDeptFromChat = (deptName: string) => {
    setBookingData(prev => ({ ...prev, dept: deptName }));
    setBookingStep(1);
    setShowModal(true);
  };

  const handleAcceptAppointment = (id: string) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: 'ACCEPTED' } : app));
  };

  const handleDeclineAppointment = (id: string) => {
    if (cancelReason) {
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: 'DECLINED', cancelReason } : app));
      setCancellingAppId(null);
      setCancelReason('');
    }
  };

  const handleRecordSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setTimeout(() => {
      const record = MOCK_RECORDS.find(r => 
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        'Nguyễn Văn A'.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setViewingRecord(record || null);
      setIsSearching(false);
    }, 800);
  };

  if (userRole === UserRole.DOCTOR || userRole === UserRole.ADMIN) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">
               Quản lý lịch hẹn
             </h2>
             <p className="text-slate-500 text-sm">
               Xem và xử lý các yêu cầu đặt lịch từ bệnh nhân.
             </p>
          </div>
          
          <div className="flex items-center gap-4">
            <form onSubmit={handleRecordSearch} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Tra cứu nhanh BN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-[1.5rem] w-full md:w-60 focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm text-sm"
              />
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Main Column: Appointments & Detailed Record View */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {viewingRecord ? (
                <motion.div 
                  key="record-view"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl space-y-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400">
                        <UserIcon size={32} />
                      </div>
                      <div>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tight">{viewingRecord.patientName || 'Bệnh nhân'}</h4>
                        <p className="text-sm text-slate-500 font-bold tracking-widest uppercase opacity-60">Hồ sơ: {viewingRecord.id}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setViewingRecord(null)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all flex items-center gap-2 group"
                    >
                      <Undo2 size={18} className="group-hover:-translate-x-1 transition-transform" />
                      <span className="text-xs font-bold">Quay lại danh sách</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-6">
                      <div className="space-y-3">
                         <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] px-1">1. Triệu chứng & Chẩn đoán</p>
                         <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 shadow-inner">
                            <div className="space-y-2">
                               <p className="text-[10px] font-black text-slate-400 uppercase">Triệu chứng lâm sàng</p>
                               <div className="flex flex-wrap gap-2">
                                  {viewingRecord.symptoms?.map((s, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm">{s}</span>
                                  ))}
                               </div>
                            </div>
                            <div className="w-full h-px bg-slate-200/50" />
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase">Chẩn đoán y khoa</p>
                               <p className="text-sm font-bold text-slate-800 leading-relaxed">{viewingRecord.diagnosis}</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">2. Đơn thuốc & Hướng dẫn</p>
                         <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                               <div className="flex items-center gap-2">
                                  <ClipboardList size={14} className="text-primary" />
                                  <span className="text-[10px] font-black uppercase text-slate-500">Đơn thuốc chi tiết</span>
                               </div>
                               <span className="text-[10px] font-bold text-slate-400">{viewingRecord.date}</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                              {viewingRecord.results.medications.map((med, i) => (
                                <div key={i} className="p-5 space-y-3 hover:bg-slate-50/50 transition-colors">
                                   <div className="flex justify-between items-start">
                                      <div>
                                         <h5 className="text-sm font-black text-slate-800">{med.name}</h5>
                                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{med.unit} | {med.duration}</p>
                                      </div>
                                      <div className="text-right">
                                         <p className="text-xs font-black text-primary">SL: {med.quantity}</p>
                                         <p className="text-[10px] text-slate-400 font-medium">~ {(med.price * med.quantity).toLocaleString()}đ</p>
                                      </div>
                                   </div>
                                   <div className="flex gap-2">
                                      {[
                                        { label: 'Sáng', val: med.morning },
                                        { label: 'Trưa', val: med.noon },
                                        { label: 'Chiều', val: med.afternoon },
                                        { label: 'Tối', val: med.evening }
                                      ].map((slot, idx) => (
                                        <div key={idx} className={cn(
                                          "flex-1 px-2 py-1.5 rounded-xl border text-[9px] font-bold text-center",
                                          slot.val > 0 ? "bg-primary/10 border-primary/20 text-primary" : "bg-slate-50 border-slate-100 text-slate-300"
                                        )}>
                                          {slot.label}: {slot.val}
                                        </div>
                                      ))}
                                   </div>
                                   <p className="text-[10px] text-slate-500 leading-relaxed italic mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                                      HD: {med.instructions}
                                   </p>
                                </div>
                              ))}
                            </div>
                            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                               <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tổng tiền thuốc</p>
                                  <p className="text-lg font-black text-primary">
                                     {viewingRecord.results.medications.reduce((sum, m) => sum + (m.price * m.quantity), 0).toLocaleString()}đ
                                  </p>
                               </div>
                               <div className="text-right">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Người cấp</p>
                                  <p className="text-xs font-black">{viewingRecord.doctor}</p>
                               </div>
                            </div>
                         </div>

                         {viewingRecord.results.prescriptionNotes && (
                           <div className="p-5 bg-orange-50 border border-orange-100 rounded-3xl space-y-3">
                              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                                 <AlertCircle size={14} /> Danh sách đề nghị từ bác sĩ
                              </p>
                              <ul className="space-y-2">
                                {viewingRecord.results.prescriptionNotes.split(/[,.;]|\n/).filter(s => s.trim().length > 0).map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-orange-800 font-medium leading-relaxed">
                                    <div className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                    {item.trim()}
                                  </li>
                                ))}
                              </ul>
                           </div>
                         )}
                         
                         {viewingRecord.results.generalUsageInstructions && (
                           <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-3">
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                 <Activity size={14} /> Hướng dẫn sử dụng chi tiết
                              </p>
                              <ul className="space-y-2">
                                {viewingRecord.results.generalUsageInstructions.split(/[,.;]|\n/).filter(s => s.trim().length > 0).map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-emerald-800 font-medium leading-relaxed">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                    {item.trim()}
                                  </li>
                                ))}
                              </ul>
                           </div>
                         )}
                      </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-3">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">3. Cận lâm sàng & Hình ảnh</p>
                         <div className="space-y-3">
                           {viewingRecord.results.labTests?.map((test, i) => (
                             <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-slate-700">{test.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-900">{test.value}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{test.unit}</span>
                                  </div>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    test.status === 'HIGH' ? "bg-red-500 w-full" : "bg-green-500 w-2/3"
                                  )} />
                                </div>
                             </div>
                           ))}
                           
                           {viewingRecord.results.imaging?.map((img, i) => (
                             <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                      <FileText size={18} />
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase">{img.type}</p>
                                      <p className="text-xs font-bold text-slate-800">{img.region}</p>
                                   </div>
                                </div>
                                <div className="aspect-video bg-slate-200 rounded-xl overflow-hidden relative group">
                                   <img src={img.image} alt={img.type} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                   <p className="text-[10px] font-bold text-slate-800 uppercase mb-1">Kết luận:</p>
                                   <p className="text-xs text-slate-600 font-medium">{img.conclusion}</p>
                                </div>
                             </div>
                           ))}
                         </div>
                      </div>
                      <button className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] text-sm font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-[0.98]">
                         <FileText size={20} /> Xuất bệnh án hoàn chỉnh (.PDF)
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="appointment-list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                      <Clock size={20} className="text-primary" /> Lịch hẹn đang chờ ({appointments.filter(a => a.status === 'PENDING').length})
                    </h3>
                    <div className="flex gap-2">
                       <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 uppercase tracking-widest">Hôm nay, {new Date().toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appointments.map((app) => (
                      <motion.div 
                        key={app.id}
                        layout
                        className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all group relative overflow-hidden"
                      >
                         {app.status === 'ACCEPTED' && <div className="absolute top-0 right-0 w-2 h-full bg-green-500" />}
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary transition-colors group-hover:text-slate-900">
                              <UserIcon size={28} />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-lg font-black text-slate-900">{app.patientName}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">{app.time} • {app.dept}</p>
                            </div>
                          </div>
                          <div className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                            app.status === 'PENDING' ? "bg-orange-50 text-orange-600" :
                            app.status === 'ACCEPTED' ? "bg-green-50 text-green-600" :
                            "bg-red-50 text-red-600"
                          )}>
                            {app.status === 'PENDING' ? 'Mới' : app.status === 'ACCEPTED' ? 'Đã duyệt' : 'Từ chối'}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => {
                              setIsSearching(true);
                              setTimeout(() => {
                                const record = MOCK_RECORDS.find(r => r.patientName === app.patientName) || MOCK_RECORDS[0];
                                setViewingRecord(record);
                                setIsSearching(false);
                              }, 600);
                            }}
                            className="flex-1 py-3.5 bg-slate-50 text-slate-600 rounded-2xl text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all border border-slate-100 group-hover:border-slate-300 shadow-sm"
                          >
                            {isSearching ? <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" /> : <><Sparkles size={14} className="text-primary" /> Tóm tắt</>}
                          </button>
                          {app.status === 'PENDING' && (
                            <div className="flex gap-2 flex-1">
                              <button 
                                onClick={() => setCancellingAppId(app.id)}
                                className="flex-1 py-3.5 bg-red-50 text-red-500 rounded-2xl text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all border border-red-100 shadow-sm"
                              >
                                <Ban size={14} /> Từ chối
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm">
                      <FileText size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-500">Kênh hỗ trợ quản lý</p>
                      <p className="text-xs text-slate-400">Nếu có thắc mắc về lịch trực, vui lòng liên hệ Ban lãnh đạo tại mục Hội chẩn.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>


        {/* Appointment Denial Reason Modal */}
        <AnimatePresence>
          {cancellingAppId && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setCancellingAppId(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 p-10 space-y-8"
              >
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                    <X size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Từ chối lịch hẹn</h3>
                  <p className="text-sm text-slate-500">Vui lòng cung cấp lý do để quản lý có thể sắp xếp lại.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Lý do từ chối</label>
                    <textarea 
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Ví dụ: Trùng lịch chuyên môn đột xuất, Bác sĩ có ca mổ gấp..."
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all h-32"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <input 
                      type="checkbox" 
                      id="notify-patient"
                      checked={notifyPatient}
                      onChange={(e) => setNotifyPatient(e.target.checked)}
                      className="w-5 h-5 rounded-lg text-primary focus:ring-primary border-slate-300"
                    />
                    <label htmlFor="notify-patient" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Gửi thông báo huỷ hẹn cho bệnh nhân (Qua App & SMS)
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setCancellingAppId(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold">Hủy bỏ</button>
                  <button 
                    onClick={() => {
                      if (notifyPatient) {
                        alert('Đang gửi thông báo cho bệnh nhân...');
                      }
                      handleDeclineAppointment(cancellingAppId);
                    }} 
                    className="flex-[2] py-4 bg-red-500 text-white rounded-2xl text-xs font-bold shadow-xl shadow-red-100"
                  >
                    Xác nhận & {notifyPatient ? 'Báo bệnh nhân' : 'Huỷ lịch'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {viewingRecord && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setViewingRecord(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
              >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Hồ sơ: {viewingRecord.patientName || 'Nguyễn Văn A'}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Mã BN: {viewingRecord.id}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewingRecord(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 font-black text-slate-800 text-lg">
                      <Sparkles size={20} className="text-primary" /> Tóm tắt triệu chứng
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 shadow-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Triệu chứng khai báo</p>
                        <ul className="space-y-2">
                          {['Đau thắt vùng thượng vị', 'Khó thở khi nằm phẳng', 'Buồn nôn thường xuyên'].map((s, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-medium">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),1)]" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 space-y-4">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">Dự đoán sơ bộ</p>
                        <div className="space-y-1">
                          <p className="text-2xl font-black text-slate-900 tracking-tight">Trào ngược dạ dày thực quản</p>
                          <p className="text-[10px] text-slate-400 font-bold">ĐỘ TIN CẬY: <span className="text-primary italic">92%</span></p>
                        </div>
                        <div className="p-4 bg-white/50 rounded-2xl border border-primary/10">
                          <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                            "Dấu hiệu lâm sàng hội tụ đủ các yếu tố của GERD cấp độ B. Đề xuất nội soi tiêu hóa trên để xác định tổn thương niêm mạc."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <h4 className="flex items-center gap-2 font-black text-slate-800 text-lg">
                      <ClipboardList size={20} className="text-emerald-500" /> Kết quả lâm sàng gần nhất
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl transition-shadow transition-all group">
                         <div className="flex justify-between items-start">
                            <div className="space-y-1">
                               <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-md uppercase border border-emerald-100 tracking-tighter">Visit BN-2024</span>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-50">11/05/2024</span>
                               </div>
                               <p className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors">Rối loạn tiêu hóa cấp</p>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                               <ChevronRight size={24} />
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Chẩn đoán</p>
                               <p className="text-sm font-bold text-slate-700 leading-snug">Viêm dạ dày xuất hiện ổ loét nhẹ vùng hang vị</p>
                            </div>
                            <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Phác đồ điều trị</p>
                               <p className="text-sm font-bold text-slate-700 leading-snug">05 ngày dùng Nexium + Chế độ ăn kiêng đồ cay nóng</p>
                            </div>
                         </div>
                      </div>
                    </div>
                    

                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCreatingRecord && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsCreatingRecord(false);
                  setEditingRecordId(null);
                }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
              >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <ClipboardList size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{editingRecordId ? 'Chỉnh sửa hồ sơ' : 'Tạo hồ sơ bệnh án mới'}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Chuyên môn bác sĩ</p>
                    </div>
                  </div>
                  <button onClick={() => {
                    setIsCreatingRecord(false);
                    setEditingRecordId(null);
                  }} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  <div className="space-y-4">
                    <div className="space-y-1 relative">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Tên bệnh nhân</label>
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                        <input 
                          type="text"
                          value={newRecordData.patientName}
                          onChange={(e) => setNewRecordData(prev => ({ ...prev, patientName: e.target.value }))}
                          placeholder="Nhập hoặc tìm tên bệnh nhân..."
                          className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        />
                      </div>
                      {newRecordData.patientName && !appointments.some(a => a.patientName === newRecordData.patientName) && (
                        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 max-h-40 overflow-y-auto">
                           {['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Minh H'].filter(n => n.toLowerCase().includes(newRecordData.patientName.toLowerCase())).map(n => (
                             <button 
                              key={n}
                              onClick={() => setNewRecordData(prev => ({ ...prev, patientName: n }))}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700"
                             >
                               {n}
                             </button>
                           ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Triệu chứng (Cách nhau bằng dấu phẩy)</label>
                      <input 
                        type="text"
                        value={newRecordData.symptoms}
                        onChange={(e) => setNewRecordData(prev => ({ ...prev, symptoms: e.target.value }))}
                        placeholder="Ví dụ: Đau đầu, chóng mặt, sốt nhẹ..."
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Kết quả chẩn đoán</label>
                      <textarea 
                        value={newRecordData.diagnosis}
                        onChange={(e) => setNewRecordData(prev => ({ ...prev, diagnosis: e.target.value }))}
                        placeholder="Nhập kết quả chẩn đoán chi tiết..."
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all h-24"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kê đơn thuốc</p>
                      <button 
                        onClick={() => setNewRecordData(prev => ({ 
                          ...prev, 
                          medications: [...prev.medications, { 
                            name: '', 
                            dosage: '', 
                            quantity: 1, 
                            price: 0, 
                            unit: 'viên', 
                            morning: 1, 
                            noon: 0, 
                            afternoon: 0, 
                            evening: 1, 
                            duration: '', 
                            instructions: '' 
                          }] 
                        }))}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        + Thêm thuốc
                      </button>
                    </div>

                    <div className="space-y-4">
                      {newRecordData.medications.map((med, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 relative group">
                          <button 
                            onClick={() => setNewRecordData(prev => ({ 
                              ...prev, 
                              medications: prev.medications.filter((_, i) => i !== idx) 
                            }))}
                            className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={16} />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Tên thuốc</label>
                              <input 
                                placeholder="Tên thuốc..."
                                value={med.name}
                                onChange={(e) => {
                                  const meds = [...newRecordData.medications];
                                  meds[idx].name = e.target.value;
                                  setNewRecordData(prev => ({ ...prev, medications: meds }));
                                }}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/10 outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                               <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Đơn vị</label>
                                  <input 
                                    placeholder="Viên/Vỉ..."
                                    value={med.unit}
                                    onChange={(e) => {
                                      const meds = [...newRecordData.medications];
                                      meds[idx].unit = e.target.value;
                                      setNewRecordData(prev => ({ ...prev, medications: meds }));
                                    }}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/10 outline-none"
                                  />
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Đơn giá</label>
                                  <input 
                                    type="number"
                                    placeholder="Giá..."
                                    value={med.price}
                                    onChange={(e) => {
                                      const meds = [...newRecordData.medications];
                                      meds[idx].price = Number(e.target.value);
                                      setNewRecordData(prev => ({ ...prev, medications: meds }));
                                    }}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/10 outline-none"
                                  />
                               </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                             {[
                               { label: 'Sáng', key: 'morning' as const },
                               { label: 'Trưa', key: 'noon' as const },
                               { label: 'Chiều', key: 'afternoon' as const },
                               { label: 'Tối', key: 'evening' as const }
                             ].map((slot) => (
                               <div key={slot.key} className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase px-1">{slot.label}</label>
                                  <input 
                                    type="number"
                                    min="0"
                                    value={med[slot.key]}
                                    onChange={(e) => {
                                      const meds = [...newRecordData.medications];
                                      (meds[idx] as any)[slot.key] = Number(e.target.value);
                                      setNewRecordData(prev => ({ ...prev, medications: meds }));
                                    }}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/10 outline-none"
                                  />
                               </div>
                             ))}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Mô tả liều</label>
                              <input 
                                placeholder="1 viên..."
                                value={med.dosage}
                                onChange={(e) => {
                                  const meds = [...newRecordData.medications];
                                  meds[idx].dosage = e.target.value;
                                  setNewRecordData(prev => ({ ...prev, medications: meds }));
                                }}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/10 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Tổng cộng (số lượng)</label>
                              <input 
                                type="number"
                                min="1"
                                placeholder="Số lượng..."
                                value={med.quantity}
                                onChange={(e) => {
                                  const meds = [...newRecordData.medications];
                                  meds[idx].quantity = Number(e.target.value);
                                  setNewRecordData(prev => ({ ...prev, medications: meds }));
                                }}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/10 outline-none"
                              />
                            </div>
                          </div>

                          <input 
                            placeholder="Hướng dẫn sử dụng (Ví dụ: Sau ăn 30p)..."
                            value={med.instructions}
                            onChange={(e) => {
                              const meds = [...newRecordData.medications];
                              meds[idx].instructions = e.target.value;
                              setNewRecordData(prev => ({ ...prev, medications: meds }));
                            }}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/10 outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 pt-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Lưu ý bốc thuốc (Dành cho dược sĩ/bệnh nhân)</label>
                          <textarea 
                            value={newRecordData.prescriptionNotes}
                            onChange={(e) => setNewRecordData(prev => ({ ...prev, prescriptionNotes: e.target.value }))}
                            placeholder="Kiêng ăn đồ cay nóng, uống nhiều nước..."
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all h-20"
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Hướng dẫn sử dụng chung</label>
                          <textarea 
                            value={newRecordData.generalUsageInstructions}
                            onChange={(e) => setNewRecordData(prev => ({ ...prev, generalUsageInstructions: e.target.value }))}
                            placeholder="Sử dụng thuốc đúng giờ, đúng liều..."
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all h-20"
                          />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                   <button 
                    onClick={() => {
                      setIsCreatingRecord(false);
                      setEditingRecordId(null);
                    }}
                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl text-xs font-bold"
                   >
                     Hủy bỏ
                   </button>
                   <button 
                    onClick={() => {
                      // Mock save
                      setIsCreatingRecord(false);
                      setEditingRecordId(null);
                      alert('Đã lưu thông tin hồ sơ thành công!');
                    }}
                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-xl shadow-slate-200"
                   >
                     {editingRecordId ? 'Cập nhật hồ sơ' : 'Hoàn tất & Lưu hồ sơ'}
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCreatingApp && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsCreatingApp(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 p-10 space-y-8"
              >
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                    <Calendar size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Tạo lịch hẹn mới</h3>
                  <p className="text-sm text-slate-500">Chủ động sắp xếp lịch khám cho bệnh nhân.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Tên bệnh nhân</label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                      <input 
                        type="text"
                        placeholder="Tìm bệnh nhân..."
                        value={newAppData.patientName}
                        onChange={(e) => setNewAppData(prev => ({ ...prev, patientName: e.target.value }))}
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      />
                    </div>
                    {newAppData.patientName && !appointments.some(a => a.patientName === newAppData.patientName) && (
                      <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 max-h-40 overflow-y-auto">
                          {['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Minh H'].filter(n => n.toLowerCase().includes(newAppData.patientName.toLowerCase())).map(n => (
                            <button 
                            key={n}
                            onClick={() => setNewAppData(prev => ({ ...prev, patientName: n }))}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700"
                            >
                              {n}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Giờ khám</label>
                      <select 
                        value={newAppData.time}
                        onChange={(e) => setNewAppData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      >
                         {['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'].map(t => (
                           <option key={t} value={t}>{t}</option>
                         ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Chuyên khoa</label>
                      <select 
                        value={newAppData.dept}
                        onChange={(e) => setNewAppData(prev => ({ ...prev, dept: e.target.value }))}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      >
                         {departments.map(d => (
                           <option key={d.id} value={d.name}>{d.name}</option>
                         ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setIsCreatingApp(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold">Hủy bỏ</button>
                  <button 
                    onClick={() => {
                      setAppointments(prev => [{ 
                        id: Math.random().toString(), 
                        patientName: newAppData.patientName, 
                        time: newAppData.time, 
                        date: 'Tương lai', 
                        status: 'ACCEPTED', 
                        dept: newAppData.dept 
                      }, ...prev]);
                      setIsCreatingApp(false);
                      setNewAppData({ patientName: '', time: '08:00', date: '', dept: 'Nội tổng quát' });
                    }} 
                    className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-xl shadow-emerald-100"
                  >
                    Xác nhận lịch hẹn
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }


  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">{hasAppointment ? 'Lịch trình khám tối ưu' : 'Đặt lịch hẹn mới'}</h2>
           <p className="text-slate-500 text-sm">
             {hasAppointment 
               ? 'Hệ thống tự động sắp xếp thứ tự ưu tiên dựa trên thời gian thực tế.' 
               : 'Chào mừng! Hãy để Trợ lý giúp bạn phân khoa và chọn bác sĩ phù hợp.'}
           </p>
        </div>
        {hasAppointment && (
          <div className="flex items-center gap-3">
             <button 
              onClick={handleCancelAppointment}
              className="px-4 py-2 bg-white border border-red-100 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition-all flex items-center gap-2"
             >
                <X size={14} /> Hủy lịch
             </button>
          </div>
        )}
      </div>

      {!hasAppointment ? (
        <div className="max-w-4xl mx-auto w-full">
          {/* Booking Chatbot Flow */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px] shadow-2xl shadow-slate-100 ring-1 ring-slate-50">
             <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
               <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-slate-800 shadow-sm">
                  <MessageSquare size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-slate-800">Trợ lý Triage & Phân khoa</h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest leading-none mt-1">Smart Booking AI</p>
               </div>
             </div>

             <div className="flex-1 p-8 space-y-6 overflow-y-auto custom-scrollbar bg-slate-50/20 text-sm">
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Sparkles size={16} />
                   </div>
                   <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-700 max-w-[80%] shadow-sm">
                      Chào mừng bạn đến với hệ thống đặt lịch thông minh. Dựa trên triệu chứng của mình, bạn cảm thấy cần khám ở khoa nào nhất?
                   </div>
                </div>

                {bookingData.dept && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 flex-row-reverse text-right">
                    <div className="bg-slate-800 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-md">
                       Tôi cần khám ở khoa <b>{bookingData.dept}</b>
                    </div>
                  </motion.div>
                )}

                {bookingData.dept && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                       <Sparkles size={16} />
                    </div>
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-700 max-w-[80%] shadow-sm space-y-3">
                       <p>Tôi đã ghi nhận khoa <b>{bookingData.dept}</b>. Bây giờ, mời bạn nhấn vào nút bên dưới để chọn ngày giờ và hoàn tất lịch khám cùng bác sĩ chuyên khoa.</p>
                       <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 py-2 px-4 bg-primary text-slate-900 rounded-xl font-bold text-xs hover:bg-white hover:ring-1 hover:ring-primary transition-all shadow-sm"
                       >
                         <CalendarDays size={14} /> Tiếp tục chọn ngày giờ
                       </button>
                    </div>
                  </motion.div>
                )}
             </div>

             <div className="p-6 bg-white border-t border-slate-100 space-y-4">
                <div className="flex flex-wrap gap-2">
                   {bookingStep === 0 && departments.map(d => (
                    <button 
                      key={d.id}
                      onClick={() => selectDeptFromChat(d.name)}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-primary hover:bg-white transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
                    >
                      <d.icon size={16} className="text-primary" />
                      <div className="text-left">
                         <p>{d.name}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Hãy trò chuyện để tôi hỗ trợ phân khoa..."
                    className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all shadow-inner"
                  />
                  <button className="absolute right-2 top-2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 hover:scale-[1.05] transition-all shadow-lg active:scale-95">
                    <Send size={18} />
                  </button>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <>
          {/* Active Appointment Dashboard */}
          <div className="space-y-6">
            {patientAppointment?.status === 'DECLINED' && (
              <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-2xl flex items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Ban size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-red-900">Lịch hẹn bị từ chối</h4>
                    <p className="text-xs text-red-700 font-medium">Lý do: <span className="font-bold">{patientAppointment.cancelReason || 'Bác sĩ bận việc đột xuất'}</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setHasAppointment(false);
                    setShowModal(true);
                  }}
                  className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all shadow-sm"
                >
                  Chọn lịch khác
                </button>
              </div>
            )}

            {patientAppointment?.status === 'PENDING' && (
              <div className="p-6 bg-orange-50 border-l-4 border-orange-500 rounded-2xl flex items-center gap-4 shadow-sm animate-pulse">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-orange-900">Đang chờ xác nhận</h4>
                  <p className="text-xs text-orange-700 font-medium">Bác sĩ đang kiểm tra lịch và sẽ phản hồi sớm nhất.</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Doctor Info Card */}
            <div className="md:col-span-1 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
               <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-slate-50 overflow-hidden relative">
                 <UserIcon size={64} className="text-slate-300" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-800">{doctorInfo.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <p className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{doctorInfo.specialty}</p>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{doctorInfo.age} tuổi</span>
                  </div>
               </div>
               <div className="w-full pt-6 border-t border-slate-100 flex flex-col items-start gap-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                       <MapPin size={16} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vị trí</p>
                       <p className="text-xs font-bold text-slate-800">{doctorInfo.rooms.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                       <Clock size={16} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian đã đặt</p>
                       <p className="text-xs font-bold text-slate-800">{bookingData.time} - {bookingData.date}</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Doctor Detailed Info - Replaces empty div */}
            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Stethoscope size={18} className="text-primary" /> Thông tin bác sĩ điều trị
                </h3>
                <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-500 uppercase">Thông tin chính quy</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Học vấn</p>
                   <p className="text-xs font-bold text-slate-700">{doctorInfo.education}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Tuổi</p>
                   <p className="text-xs font-bold text-slate-700">{doctorInfo.age} tuổi</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thành tích & Kinh nghiệm</p>
                <div className="space-y-2">
                  {doctorInfo.achievements.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10"></div>
                      <p className="text-xs font-medium text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning message removed as per request */}
            </div>
          </div>

          <AnimatePresence>
            {hasAppointment && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 gap-4"
              >
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lịch trình xét nghiệm & khám bệnh</div>
                {exams.map((exam, idx) => (
                  <motion.div
                    layout
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "p-6 rounded-3xl border transition-all relative overflow-hidden group",
                      exam.status === ExamStatus.COMPLETED 
                        ? "bg-slate-50 border-slate-100 opacity-60" 
                        : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                    )}
                  >
                    {exam.status === ExamStatus.COMPLETED && (
                      <div className="absolute top-4 right-6 text-green-500">
                        <CheckCircle2 size={24} />
                      </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 transition-colors",
                        exam.status === ExamStatus.COMPLETED ? "bg-slate-200 text-slate-400" : "bg-slate-900 text-primary"
                      )}>
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                         <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg text-slate-800">{exam.name}</h4>
                            {exam.name.includes('Xét nghiệm') && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">Phòng Lab</span>
                            )}
                         </div>
                         <div className="flex items-center gap-4 text-xs text-slate-400">
                           <span className="flex items-center gap-1.5 font-medium"><MapPin size={14} className="text-slate-300" /> {exam.room}</span>
                           <span className="flex items-center gap-1.5 font-medium"><Timer size={14} className="text-slate-300" /> {exam.estimatedDuration} phút</span>
                         </div>
                      </div>

                      <div className="flex items-center gap-8">
                         {exam.status !== ExamStatus.COMPLETED && (
                            <div className="text-right">
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thời gian chờ</p>
                               <div className="flex items-center gap-1.5 text-orange-500 font-bold">
                                  <Clock size={16} /> ~{exam.currentWaitTime} phút
                               </div>
                            </div>
                         )}
                         <div className="w-px h-10 bg-slate-100 hidden md:block"></div>
                         <div className="min-w-32">
                            <StatusBadge status={exam.status} />
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Booking Modal Interface */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setShowModal(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                         <Calendar size={20} />
                      </div>
                      <h3 className="font-bold text-slate-800">Đặt lịch tại {bookingData.dept}</h3>
                   </div>
                   <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                      <X size={20} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                   {/* Date Selection */}
                   <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest underline decoration-primary/40 underline-offset-4">1. Chọn ngày khám</p>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                         {dates.map((d) => (
                            <button 
                              key={d.date}
                              disabled={d.isOff}
                              onClick={() => setBookingData(prev => ({ ...prev, date: d.date }))}
                              className={cn(
                                "flex flex-col items-center p-3 rounded-2xl border transition-all relative",
                                bookingData.date === d.date 
                                  ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                                  : d.isOff 
                                    ? "bg-red-50 border-red-100 text-red-300 cursor-not-allowed opacity-50"
                                    : "bg-white border-slate-100 hover:border-slate-300 text-slate-600"
                              )}
                              title={d.isOff ? `Bác sĩ nghỉ: ${d.offReason}` : ""}
                            >
                               <span className="text-[10px] font-bold uppercase opacity-60 mb-1">{d.label}</span>
                               <span className="text-sm font-bold">{d.day}</span>
                               {d.isOff && <span className="absolute -top-1 -right-1 text-[8px] bg-red-500 text-white px-1 rounded-full font-black">OFF</span>}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Time Selection */}
                   <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest underline decoration-primary/40 underline-offset-4">2. Chọn khung giờ</p>
                      <div className="flex flex-wrap gap-2">
                         {timeSlots.map((time) => (
                           <button 
                            key={time}
                            onClick={() => setBookingData(prev => ({ ...prev, time }))}
                            className={cn(
                              "px-6 py-3 rounded-xl border text-xs font-bold transition-all",
                              bookingData.time === time 
                                ? "bg-primary border-primary text-slate-900 shadow-md scale-105" 
                                : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200"
                            )}
                           >
                             {time}
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Doctor Summary */}
                   <AnimatePresence>
                     {bookingData.time && (
                       <motion.div 
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                         exit={{ opacity: 0, height: 0 }}
                         className="space-y-4 overflow-hidden"
                       >
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest underline decoration-primary/40 underline-offset-4">3. Hồ sơ bác sĩ chuyên khoa</p>
                          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col sm:flex-row gap-6">
                             <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shrink-0 text-slate-300 overflow-hidden">
                                <UserIcon size={48} />
                             </div>
                             <div className="flex-1 space-y-3">
                                <div>
                                   <h4 className="font-bold text-slate-800">{doctorInfo.name}</h4>
                                   <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-primary font-bold">{doctorInfo.specialty}</span>
                                      <span className="text-slate-300 text-xs">•</span>
                                      <span className="text-xs text-slate-500 font-bold">{doctorInfo.age} tuổi</span>
                                   </div>
                                </div>
                                <div className="space-y-2">
                                   <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Sparkles size={10} className="text-primary" /> Thành tựu nổi bật</p>
                                   <ul className="text-[10px] text-slate-600 space-y-1">
                                      {doctorInfo.achievements.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                          <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                          {item}
                                        </li>
                                      ))}
                                   </ul>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50">
                                   <span className="text-[9px] bg-white px-2 py-1 rounded-md text-slate-500 font-bold border border-slate-100 uppercase">{doctorInfo.education}</span>
                                </div>
                             </div>
                          </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                   <button 
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
                   >
                     Quay lại
                   </button>
                   <button 
                    disabled={!bookingData.time}
                    onClick={handleBooking}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-slate-200"
                   >
                     {bookingData.time ? 'Hoàn tất đặt lịch' : 'Vui lòng chọn giờ'}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: ExamStatus }) {
  switch (status) {
    case ExamStatus.COMPLETED:
      return (
        <span className="px-4 py-2 bg-green-100 text-green-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 w-full border border-green-200">
          Xong
        </span>
      );
    case ExamStatus.WAITING:
      return (
        <span className="px-4 py-2 bg-orange-100 text-orange-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 w-full border border-orange-200">
          Chờ khám
        </span>
      );
    case ExamStatus.IN_PROGRESS:
      return (
        <span className="px-4 py-2 bg-primary/20 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1 w-full animate-pulse border border-primary/30">
           Đang gọi
        </span>
      );
    default:
      return (
        <span className="px-4 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl flex items-center justify-center gap-1 w-full border border-slate-200">
          Chưa diễn ra
        </span>
      );
  }
}
