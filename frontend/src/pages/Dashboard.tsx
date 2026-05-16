import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  CalendarDays, 
  Pill, 
  Droplet,
  AlertTriangle,
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dataService.getPatientDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col space-y-4">
        <Activity size={48} className="text-slate-300" />
        <h2 className="text-xl font-bold text-slate-800">Chưa có dữ liệu tổng quan</h2>
        <p className="text-slate-500">Hồ sơ sức khỏe của bạn sẽ được cập nhật sau lần khám đầu tiên.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tổng quan Sức khỏe</h2>
        <p className="text-slate-500 text-sm">Cập nhật nhanh tình trạng y tế và các lịch trình sắp tới của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
            <Droplet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nhóm máu</p>
            <p className="text-2xl font-black text-slate-900">{dashboardData.bloodType || 'Chưa rõ'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 lg:col-span-3">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dị ứng ghi nhận</p>
            <p className="text-lg font-bold text-slate-900 truncate">{dashboardData.allergies || 'Không có ghi nhận'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Lịch khám */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <CalendarDays className="text-primary" size={24} /> Lịch khám sắp tới
              </h3>
              <Link to="/scheduling" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {dashboardData.appointments?.length > 0 ? (
                dashboardData.appointments.map((appt: any) => (
                  <div key={appt.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-primary shrink-0">
                        <span className="text-[10px] font-black uppercase leading-none">{new Date(appt.date).toLocaleString('vi-VN', { month: 'short' })}</span>
                        <span className="text-lg font-black leading-none mt-1">{new Date(appt.date).getDate()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{appt.reason}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                          <Clock size={12} /> {new Date(appt.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block text-center whitespace-nowrap shrink-0",
                      appt.status === 'CONFIRMED' ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                    )}>
                      {appt.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">Không có lịch khám nào sắp tới.</p>
              )}
            </div>
          </div>

          {/* Kết quả xét nghiệm */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Activity className="text-primary" size={24} /> Kết quả xét nghiệm mới
              </h3>
              <Link to="/lab-results" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight size={14} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboardData.labResults?.length > 0 ? (
                dashboardData.labResults.map((lab: any) => (
                  <div key={lab.id} className="p-5 rounded-2xl border border-slate-100 hover:border-primary/30 transition-all group">
                    <p className="text-sm font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{lab.testName}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kết quả</p>
                        <p className="text-lg font-black text-slate-900">{lab.resultValue}</p>
                      </div>
                      {lab.status === 'COMPLETED' && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-sm text-slate-500 italic">Chưa có kết quả xét nghiệm.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Đơn thuốc */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl p-8 text-white relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 relative z-10">
              <Pill className="text-primary" size={24} /> Đơn thuốc hiện tại
            </h3>
            
            <div className="space-y-4 relative z-10">
              {dashboardData.prescriptions?.length > 0 ? (
                dashboardData.prescriptions.map((presc: any) => (
                  <div key={presc.id} className="p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                    <p className="font-bold text-lg mb-1 tracking-tight">{presc.medicationName}</p>
                    <div className="flex justify-between text-sm text-white/70 font-medium">
                      <span>{presc.dosage}</span>
                      <span>{presc.frequency}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center mt-4">
                  <p className="text-sm text-white/50 italic">Không có đơn thuốc nào đang dùng.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
