import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  FlaskConical, 
  Pill, 
  Activity, 
  Search, 
  Calendar, 
  ChevronRight,
  Download,
  TrendingUp,
  User,
  X,
  FileText,
  CreditCard,
  ArrowUpRight,
  Plus,
  Edit,
  AlertCircle,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { MOCK_RECORDS } from '../constants';
import { cn } from '../lib/utils';
import { UserRole, MedicalRecord } from '../types';

export default function MedicalRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState(MOCK_RECORDS);
  const [activeTab, setActiveTab] = useState<'history' | 'labs' | 'meds'>('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.PATIENT);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatientRecord, setSelectedPatientRecord] = useState<any | null>(null);
  const [viewingVisitId, setViewingVisitId] = useState<string | null>(null);
  const [selectedLabCategory, setSelectedLabCategory] = useState<string | null>(null);

  // Add/Edit state
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [newRecordData, setNewRecordData] = useState({
    patientName: 'Nguyễn Văn A',
    diagnosis: '',
    symptoms: '',
    summary: '',
    medications: [{ 
      name: '', 
      dosage: '', 
      quantity: 1, 
      unit: 'viên', 
      price: 0,
      purpose: '',
      morning: 1, 
      noon: 0, 
      afternoon: 0, 
      evening: 1, 
      duration: '5 ngày', 
      instructions: 'Sau ăn 30p' 
    }],
    prescriptionNotes: '',
    date: new Date().toLocaleDateString('vi-VN')
  });

  const canEditRecord = (recordDate: string) => {
    try {
      const parts = recordDate.split('/');
      if (parts.length !== 3) return false;
      const [day, month, year] = parts.map(Number);
      const recordDateTime = new Date(year, month - 1, day).getTime();
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      const diffTime = now.getTime() - recordDateTime;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 3;
    } catch (e) {
      return false;
    }
  };

  const viewingVisit = records.find(r => r.id === viewingVisitId);

  const labCategories = [
    { id: 'blood', label: 'Xét nghiệm Máu', icon: FlaskConical },
    { id: 'urine', label: 'Nước tiểu', icon: Activity },
    { id: 'stool', label: 'Xét nghiệm Phân', icon: ClipboardList },
    { id: 'imaging', label: 'Chẩn đoán Hình ảnh', icon: Search },
    { id: 'cardiovascular', label: 'Tim mạch', icon: Activity },
  ];

  useEffect(() => {
    const role = localStorage.getItem('userRole') as UserRole;
    if (role) {
      setUserRole(role);
      if (role === UserRole.ADMIN) {
        navigate('/admin');
      }
    }
  }, [navigate]);

  const handleSearchPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setTimeout(() => {
      // For demo purposes, we'll find any record that matches the query
      const record = records.find(r => 
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        'Nguyễn Văn A'.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSelectedPatientRecord(record || null);
      setIsSearching(false);
    }, 800);
  };

  const currentRecords = userRole === UserRole.DOCTOR 
    ? (selectedPatientRecord ? records.filter(r => r.patientName === (selectedPatientRecord.patientName || 'Nguyễn Văn A')) : []) 
    : records;

  const filteredRecords = currentRecords.filter(r => 
    r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveRecord = () => {
    const totalCost = newRecordData.medications.reduce((sum, m) => sum + (m.price * (m.quantity || 0)), 0);
    
    if (editingRecordId) {
      setRecords(prev => prev.map(r => r.id === editingRecordId ? {
        ...r,
        diagnosis: newRecordData.diagnosis,
        summary: newRecordData.summary,
        totalCost: totalCost,
        results: {
          ...r.results,
          medications: newRecordData.medications,
          prescriptionNotes: newRecordData.prescriptionNotes
        }
      } : r));
    } else {
      const newRecord: MedicalRecord = {
        id: `BN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        date: newRecordData.date,
        doctor: 'BS. Lê Thành Nam', // Assume current doctor
        patientName: newRecordData.patientName,
        diagnosis: newRecordData.diagnosis,
        summary: newRecordData.summary,
        billingStatus: 'PENDING',
        totalCost: totalCost,
        results: {
          medications: newRecordData.medications,
          prescriptionNotes: newRecordData.prescriptionNotes,
          blood: [],
          urine: [],
          stool: [],
          imaging: [],
          cardiovascular: []
        },
        symptoms: newRecordData.symptoms.split(',').map(s => s.trim())
      };
      setRecords(prev => [newRecord, ...prev]);
    }
    setIsCreatingRecord(false);
    setEditingRecordId(null);
  };

  const handleEditRecord = (record: any) => {
    setEditingRecordId(record.id);
    setNewRecordData({
      patientName: record.patientName || 'Nguyễn Văn A',
      diagnosis: record.diagnosis,
      symptoms: (record.symptoms || []).join(', '),
      summary: record.summary || '',
      medications: record.results.medications,
      prescriptionNotes: record.results.prescriptionNotes || '',
      date: record.date
    });
    setIsCreatingRecord(true);
  };

  if (userRole === UserRole.DOCTOR && !selectedPatientRecord) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-10">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
            <Search size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Tra cứu hồ sơ bệnh nhân</h2>
          <p className="text-slate-500 max-w-md mx-auto">Vui lòng nhập Mã BN hoặc Tên bệnh nhân để truy xuất hồ sơ bệnh án điện tử.</p>
        </div>

        <form onSubmit={handleSearchPatient} className="max-w-xl mx-auto relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder="Mã BN (BN123...) hoặc Tên bệnh nhân"
            className="w-full pl-16 pr-32 py-5 bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            disabled={isSearching}
            className="absolute right-3 top-3 bottom-3 px-8 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Tra cứu'}
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { label: 'Bệnh nhân mới nhất', val: 'Nguyễn Văn A' },
            { label: 'Gần đây', val: 'BN-2024-0511' },
            { label: 'Hôm nay', val: 'Trần Thị B' },
          ].map((item, i) => (
            <button 
              key={i}
              onClick={() => setSearchQuery(item.val)}
              className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left hover:bg-white hover:border-primary/20 transition-all group"
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary">{item.label}</p>
              <p className="text-sm font-bold text-slate-700">{item.val}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">
             {userRole === UserRole.DOCTOR ? `Hồ sơ bệnh nhân: Nguyễn Văn A` : 'Hồ sơ Bệnh án'}
           </h2>
           <p className="text-slate-500 text-sm">
             {userRole === UserRole.DOCTOR 
               ? 'Dữ liệu bệnh án được truy xuất từ kho lưu trữ trung tâm của bệnh viện.' 
               : 'Quản lý và tra cứu kết quả khám bệnh tập trung qua các thời kỳ.'}
           </p>
        </div>
        <div className="flex items-center gap-2">
           {userRole === UserRole.DOCTOR && (
             <>
               <button 
                 onClick={() => {
                   setEditingRecordId(null);
                   setNewRecordData({
                     patientName: 'Nguyễn Văn A',
                     diagnosis: '',
                     symptoms: '',
                     summary: '',
                     medications: [{ name: '', dosage: '', quantity: 1, unit: 'viên', price: 0, purpose: '', morning: 1, noon: 0, afternoon: 0, evening: 1, duration: '5 ngày', instructions: 'Sau ăn 30p' }],
                     prescriptionNotes: '',
                     date: new Date().toLocaleDateString('vi-VN')
                   });
                   setIsCreatingRecord(true);
                 }}
                 className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
               >
                 <Plus size={16} /> Tạo hồ sơ mới
               </button>
               <button 
                 onClick={() => setSelectedPatientRecord(null)}
                 className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
               >
                  <X size={16} /> Thoát tra cứu
               </button>
             </>
           )}
        </div>
      </div>

      {/* Aggregated Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-full max-w-2xl overflow-x-auto no-scrollbar">
        {[
          { id: 'history', label: 'Theo đợt khám', icon: ClipboardList },
          { id: 'labs', label: 'Xét nghiệm', icon: FlaskConical },
          { id: 'meds', label: 'Đơn thuốc', icon: Pill },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1",
              activeTab === tab.id 
                ? "bg-white text-primary shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
           <Search size={18} />
        </div>
        <input 
          type="text"
          placeholder="Tìm kiếm trong hồ sơ (bác sĩ, chẩn đoán, thuốc...)"
          className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        {activeTab === 'history' && !viewingVisitId && (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <motion.div 
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setViewingVisitId(record.id)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-primary/20 transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-1 min-w-32 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                     <span className="text-slate-400 font-bold text-xs uppercase">Ngày khám</span>
                     <span className="text-slate-800 font-bold flex items-center gap-2"><Calendar size={14} className="text-primary"/> {record.date}</span>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-primary font-bold text-lg">{record.diagnosis}</p>
                          <p className="text-slate-500 text-sm">Bác sĩ: {record.doctor}</p>
                       </div>
                       <div className="flex items-center gap-2">
                          {userRole === UserRole.DOCTOR && (
                            canEditRecord(record.date) ? (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditRecord(record);
                                }}
                                className="p-2 bg-slate-50 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-all"
                                title="Chỉnh sửa hồ sơ (trong vòng 3 ngày)"
                              >
                                <Edit size={16} />
                              </button>
                            ) : (
                              <button 
                                disabled
                                className="p-2 bg-slate-50 rounded-xl text-slate-300 cursor-not-allowed"
                                title="Đã quá hạn chỉnh sửa (3 ngày)"
                              >
                                <Ban size={16} />
                              </button>
                            )
                          )}
                          <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                             <ChevronRight size={20} />
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                       {(record.results.blood || record.results.labTests) && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100 flex items-center gap-1.5">
                            <FlaskConical size={12} /> {(record.results.blood?.length || 0) + (record.results.labTests?.length || 0)} Xét nghiệm
                          </span>
                       )}
                       {record.results.medications.length > 0 && (
                          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold border border-green-100 flex items-center gap-1.5">
                            <Pill size={12} /> {record.results.medications.length} Loại thuốc
                          </span>
                       )}
                       <span className={cn(
                          "px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5",
                          record.billingStatus === 'PAID' ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"
                       )}>
                          <CreditCard size={12} /> {record.billingStatus === 'PAID' ? 'Đã quyết toán' : 'Chờ thanh toán'}
                       </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'history' && viewingVisitId && viewingVisit && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setViewingVisitId(null)}
              className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowUpRight size={14} className="rotate-225" /> Quay lại danh sách
            </button>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase">Đợt khám chi tiết</span>
                    <span className="text-slate-300 text-xs">•</span>
                    <span className="text-slate-400 text-xs font-bold">{viewingVisit.date}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">{viewingVisit.diagnosis}</h3>
                  <p className="text-slate-500 font-medium">Bác sĩ điều trị: {viewingVisit.doctor}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Trạng thái thanh toán</p>
                  <span className={cn(
                    "px-4 py-1.5 rounded-xl text-xs font-bold uppercase",
                    viewingVisit.billingStatus === 'PAID' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  )}>
                    {viewingVisit.billingStatus === 'PAID' ? 'Hoàn tất' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>

              {viewingVisit.summary && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={18} className="text-primary" /> Tổng kết chuyên môn
                  </h4>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600 leading-relaxed">
                    "{viewingVisit.summary}"
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Categorized Results */}
                <div className="space-y-6">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <FlaskConical size={18} className="text-primary" /> Kết quả cận lâm sàng
                  </h4>
                  <div className="space-y-3">
                    {[
                      { type: 'blood', label: 'Xét nghiệm Máu', data: viewingVisit.results.blood },
                      { type: 'urine', label: 'Nước tiểu', data: viewingVisit.results.urine },
                      { type: 'stool', label: 'Xét nghiệm Phân', data: viewingVisit.results.stool },
                      { type: 'imaging', label: 'Chẩn đoán Hình ảnh', data: viewingVisit.results.imaging },
                      { type: 'cardiovascular', label: 'Tim mạch', data: viewingVisit.results.cardiovascular },
                    ].filter(cat => cat.data && cat.data.length > 0).map((cat, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          setActiveTab('labs');
                          setSelectedLabCategory(cat.type);
                        }}
                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 hover:bg-slate-50 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary group-hover:bg-white">
                            {cat.type === 'imaging' ? <Search size={20} /> : <FlaskConical size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{cat.label}</p>
                            <p className="text-[10px] text-slate-500">{cat.data?.length} kết quả</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medications */}
                <div className="space-y-6">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <Pill size={18} className="text-primary" /> Đơn thuốc chỉ định
                  </h4>
                  <div className="space-y-4">
                    {viewingVisit.results.medications.map((med, i) => (
                      <div key={i} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 group hover:border-primary/20 transition-all">
                         <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                  <Pill size={16} />
                               </div>
                               <div>
                                  <p className="font-bold text-slate-800">{med.name}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">Mục đích: {med.purpose}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-bold text-slate-700">{med.quantity} {med.unit}</p>
                               <p className="text-[10px] text-slate-400 font-medium">{med.duration}</p>
                            </div>
                         </div>
                         <div className="flex gap-1.5 pt-1">
                            {[
                               { l: 'S', v: med.morning },
                               { l: 'T', v: med.noon },
                               { l: 'C', v: med.afternoon },
                               { l: 'T', v: med.evening }
                            ].map((s, idx) => (
                               <div key={idx} className={cn(
                                 "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black border transition-all",
                                 s.v > 0 ? "bg-primary/10 border-primary/20 text-primary" : "bg-slate-50 border-slate-100 text-slate-300"
                               )}>
                                 {s.v > 0 ? s.v : '-'}
                               </div>
                            ))}
                         </div>
                         <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">HDSD & Chẩn đoán</p>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">{med.dosage}. {med.instructions}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                  {viewingVisit.results.prescriptionNotes && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                       <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Lời dặn bác sĩ</p>
                       <p className="text-xs text-amber-900 font-medium leading-relaxed">{viewingVisit.results.prescriptionNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'labs' && (
          <div className="space-y-8">
            {/* Category Filter */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
               <button 
                onClick={() => setSelectedLabCategory(null)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  !selectedLabCategory ? "bg-slate-900 shadow-lg text-white" : "bg-white border border-slate-100 text-slate-500"
                )}
               >
                 Tất cả
               </button>
               {labCategories.map(cat => (
                 <button 
                  key={cat.id}
                  onClick={() => setSelectedLabCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2",
                    selectedLabCategory === cat.id ? "bg-slate-900 shadow-lg text-white" : "bg-white border border-slate-100 text-slate-500"
                  )}
                 >
                   <cat.icon size={14} />
                   {cat.label}
                 </button>
               ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {/* Render categories based on selection */}
                {(['blood', 'urine', 'stool', 'cardiovascular'] as const).map(catId => {
                  if (selectedLabCategory && selectedLabCategory !== catId) return null;
                  
                  const results = MOCK_RECORDS.flatMap(r => r.results[catId] || []);
                  if (results.length === 0) return null;

                  return (
                    <motion.div 
                      key={catId}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                    >
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          {labCategories.find(c => c.id === catId)?.label} 
                          <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-500">{results.length}</span>
                        </h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50/30 border-b border-slate-100">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Chỉ số</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Kết quả</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Đơn vị</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">CS Tham chiếu</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Ngày</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {results.map((test, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="space-y-0.5">
                                    <p className="font-bold text-slate-800 text-sm">{test.name}</p>
                                    {test.details && <p className="text-[10px] text-slate-400 italic">{test.details}</p>}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                   <span className={cn(
                                     "font-bold text-base",
                                     test.status === 'HIGH' ? "text-red-500" : test.status === 'LOW' ? "text-orange-500" : "text-green-600"
                                   )}>{test.value}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-xs">{test.unit}</td>
                                <td className="px-6 py-4 text-slate-400 text-xs italic">{test.range}</td>
                                <td className="px-6 py-4 text-slate-400 text-[10px] font-medium">{test.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Imaging Category */}
                {(!selectedLabCategory || selectedLabCategory === 'imaging') && (
                  MOCK_RECORDS.flatMap(r => r.results.imaging || []).length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <h4 className="font-bold text-slate-800 ml-2">Chẩn đoán Hình ảnh</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {MOCK_RECORDS.flatMap(r => r.results.imaging || []).map((img, i) => (
                          <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                             <div className="relative h-48 bg-slate-900 group cursor-zoom-in">
                               <img 
                                src={img.image} 
                                alt={img.type} 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                               />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                  <div className="text-white">
                                    <p className="text-[10px] font-bold text-primary uppercase mb-1 tracking-widest">{img.type}</p>
                                    <h5 className="font-bold text-lg">{img.region}</h5>
                                  </div>
                               </div>
                               <div className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Search size={20} />
                               </div>
                             </div>
                             <div className="p-6 space-y-4 flex-1">
                                <div className="space-y-2">
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Kết luận chuyên môn</p>
                                   <p className="text-sm font-bold text-slate-800 leading-relaxed">{img.conclusion}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mô tả chi tiết</p>
                                   <p className="text-xs text-slate-500 leading-relaxed">{img.description}</p>
                                </div>
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-slate-400">
                                   <span className="flex items-center gap-1.5 text-[10px] font-bold">
                                      <Calendar size={12} /> {img.date}
                                   </span>
                                   <button className="text-[10px] font-bold text-primary hover:underline">Chi tiết bản lưu</button>
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {activeTab === 'meds' && (
           <div className="space-y-8">
              {MOCK_RECORDS.filter(record => record.results.medications.length > 0)
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((record, idx) => (
                  <motion.div 
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden"
                  >
                    {/* Prescription Header */}
                    <div className="p-8 pb-0 flex flex-col md:flex-row justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                              <Pill size={18} />
                           </div>
                           <h3 className="text-xl font-black text-slate-800">Đơn Thuốc Điện Tử</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest pl-10">Mã đơn: DT-{record.id.toUpperCase()}</p>
                      </div>
                      <div className="text-left md:text-right space-y-1">
                        <div className="flex items-center md:justify-end gap-2 text-slate-500">
                           <Calendar size={14} />
                           <span className="text-sm font-bold">Ngày kê đơn: {record.date}</span>
                        </div>
                        <div className="flex items-center md:justify-end gap-2 text-slate-500">
                           <User size={14} />
                           <span className="text-sm font-bold">Bác sĩ: {record.doctor}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 space-y-6">
                      {/* Medication List */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 border-b border-slate-100 pb-2">Danh sách thuốc chỉ định</h4>
                        {record.results.medications.map((med, i) => (
                          <div key={i} className="flex flex-col md:flex-row gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-200/50 hover:bg-white hover:border-primary/30 transition-all group">
                             <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between">
                                   <div>
                                      <h5 className="text-lg font-black text-slate-800 group-hover:text-primary transition-colors">{med.name}</h5>
                                      <p className="text-xs font-bold text-slate-500">Mục đích: <span className="text-slate-700 italic">{med.purpose || 'Theo chỉ định của bác sĩ'}</span></p>
                                   </div>
                                   <div className="px-4 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                                      <span className="text-sm font-black text-slate-900">{med.quantity} {med.unit}</span>
                                   </div>
                                </div>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                   {[
                                      { l: 'Sáng', v: med.morning },
                                      { l: 'Trưa', v: med.noon },
                                      { l: 'Chiều', v: med.afternoon },
                                      { l: 'Tối', v: med.evening }
                                   ].map((s, si) => (
                                      <div key={si} className={cn(
                                        "flex flex-col items-center p-2 rounded-xl border transition-all",
                                        s.v > 0 ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-slate-100 text-slate-300"
                                      )}>
                                        <span className="text-[10px] font-bold uppercase mb-1">{s.l}</span>
                                        <span className="text-sm font-black">{s.v}</span>
                                      </div>
                                   ))}
                                </div>
                             </div>

                             <div className="md:w-64 space-y-3 pt-4 md:pt-0 md:border-l md:border-slate-200 md:pl-6">
                                <div className="space-y-1">
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cách dùng</p>
                                   <p className="text-sm font-bold text-slate-700 leading-tight">{med.dosage}</p>
                                </div>
                                <div className="space-y-1">
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian dùng</p>
                                   <p className="text-xs font-bold text-slate-600 italic">"{med.instructions}"</p>
                                </div>
                                <div className="pt-2">
                                   <span className="text-[10px] font-bold bg-slate-200 px-2.5 py-1 rounded-full text-slate-600">{med.duration}</span>
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>

                      {/* Doctor's Final Notes */}
                      {record.results.prescriptionNotes && (
                        <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                              <FileText size={48} className="text-amber-600" />
                           </div>
                           <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Ghi chú & Lời dặn của bác sĩ</h5>
                           <p className="text-sm text-amber-900 font-medium leading-relaxed relative z-10">
                              {record.results.prescriptionNotes}
                           </p>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                         <div className="flex items-center gap-3">
                            <img 
                              src="https://api.dicebear.com/7.x/avataaars/svg?seed=doctor" 
                              alt="Signature" 
                              className="w-12 h-12 grayscale opacity-50"
                            />
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase">Chữ ký bác sĩ</p>
                               <p className="text-xs font-bold text-slate-800 italic">{record.doctor}</p>
                            </div>
                         </div>
                         <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                            <Download size={18} />
                            Tải Đơn Thuốc (PDF)
                         </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
           </div>
        )}
        {/* Add/Edit Record Modal */}
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
                className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
              >
                <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <ClipboardList size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{editingRecordId ? 'Chỉnh sửa hồ sơ bệnh án' : 'Tạo hồ sơ bệnh án mới'}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Chuyên môn bác sĩ • {newRecordData.date}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsCreatingRecord(false);
                      setEditingRecordId(null);
                    }} 
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                  {!editingRecordId && !canEditRecord(newRecordData.date) && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                      <AlertCircle size={20} />
                      <p className="text-xs font-bold">Lưu ý: Hồ sơ chỉ có thể chỉnh sửa trong vòng 3 ngày kể từ ngày tạo.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-widest">Tên bệnh nhân</label>
                      <input 
                        type="text"
                        value={newRecordData.patientName}
                        onChange={(e) => setNewRecordData(prev => ({ ...prev, patientName: e.target.value }))}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-widest">Triệu chứng</label>
                      <input 
                        type="text"
                        value={newRecordData.symptoms}
                        onChange={(e) => setNewRecordData(prev => ({ ...prev, symptoms: e.target.value }))}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        placeholder="Đau bụng, buồn nôn, mệt mỏi..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-widest">Chẩn đoán y khoa</label>
                    <input 
                      type="text"
                      value={newRecordData.diagnosis}
                      onChange={(e) => setNewRecordData(prev => ({ ...prev, diagnosis: e.target.value }))}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                      placeholder="Viêm dạ dày cấp tính..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase px-1 tracking-widest">Tóm tắt chuyên môn</label>
                    <textarea 
                      value={newRecordData.summary}
                      onChange={(e) => setNewRecordData(prev => ({ ...prev, summary: e.target.value }))}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none h-24"
                      placeholder="Bệnh nhân có biểu hiện đau vùng thượng vị..."
                    />
                  </div>

                  <div className="pt-8 border-t border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kê đơn thuốc chi tiết</h4>
                      <button 
                        onClick={() => setNewRecordData(prev => ({
                          ...prev,
                          medications: [...prev.medications, { name: '', dosage: '', quantity: 1, unit: 'viên', price: 0, purpose: '', morning: 1, noon: 0, afternoon: 0, evening: 1, duration: '5 ngày', instructions: 'Sau ăn 30p' }]
                        }))}
                        className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                      >
                        <Plus size={14} /> Thêm thuốc
                      </button>
                    </div>

                    <div className="space-y-6">
                      {newRecordData.medications.map((med, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 relative group">
                          <button 
                            onClick={() => setNewRecordData(prev => ({
                              ...prev,
                              medications: prev.medications.filter((_, i) => i !== idx)
                            }))}
                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <X size={16} />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Tên thuốc</label>
                              <input 
                                value={med.name}
                                onChange={(e) => {
                                  const meds = [...newRecordData.medications];
                                  meds[idx].name = e.target.value;
                                  setNewRecordData(prev => ({ ...prev, medications: meds }));
                                }}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Số lượng</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  value={med.quantity}
                                  onChange={(e) => {
                                    const meds = [...newRecordData.medications];
                                    meds[idx].quantity = Number(e.target.value);
                                    setNewRecordData(prev => ({ ...prev, medications: meds }));
                                  }}
                                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                                />
                                <span className="text-[10px] font-bold text-slate-400">{med.unit}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Đơn vị</label>
                              <input 
                                value={med.unit}
                                onChange={(e) => {
                                  const meds = [...newRecordData.medications];
                                  meds[idx].unit = e.target.value;
                                  setNewRecordData(prev => ({ ...prev, medications: meds }));
                                }}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 pt-2">
                            {[
                              { l: 'Sáng', k: 'morning' as const },
                              { l: 'Trưa', k: 'noon' as const },
                              { l: 'Chiều', k: 'afternoon' as const },
                              { l: 'Tối', k: 'evening' as const }
                            ].map(slot => (
                              <div key={slot.k} className="space-y-1">
                                <label className="text-[8px] font-bold text-slate-400 uppercase text-center block">{slot.l}</label>
                                <input 
                                  type="number"
                                  value={med[slot.k]}
                                  onChange={(e) => {
                                    const meds = [...newRecordData.medications];
                                    meds[idx][slot.k] = Number(e.target.value);
                                    setNewRecordData(prev => ({ ...prev, medications: meds }));
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-center outline-none"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Lưu ý sử dụng (Dose)</label>
                              <input 
                                value={med.dosage}
                                onChange={(e) => {
                                  const meds = [...newRecordData.medications];
                                  meds[idx].dosage = e.target.value;
                                  setNewRecordData(prev => ({ ...prev, medications: meds }));
                                }}
                                placeholder="Ngày uống 2 lần..."
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase px-1">Hướng dẫn chi tiết</label>
                              <input 
                                value={med.instructions}
                                onChange={(e) => {
                                  const meds = [...newRecordData.medications];
                                  meds[idx].instructions = e.target.value;
                                  setNewRecordData(prev => ({ ...prev, medications: meds }));
                                }}
                                placeholder="Uống sau khi ăn no..."
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Ghi chú & Lời dặn tổng quát</p>
                      <textarea 
                        value={newRecordData.prescriptionNotes}
                        onChange={(e) => setNewRecordData(prev => ({ ...prev, prescriptionNotes: e.target.value }))}
                        className="w-full p-4 bg-white border border-amber-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-amber-500/20"
                        placeholder="Ăn uống lành mạnh, tránh chất kích thích..."
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={() => {
                      setIsCreatingRecord(false);
                      setEditingRecordId(null);
                    }} 
                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    onClick={handleSaveRecord}
                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all"
                  >
                    {editingRecordId ? 'Cập nhật hồ sơ' : 'Hoàn tất & Lưu hồ sơ'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
