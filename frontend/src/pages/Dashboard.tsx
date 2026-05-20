import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  CalendarDays,
  Pill,
  Droplet,
  AlertTriangle,
  ChevronRight,
  Clock,
  CheckCircle2,
  Stethoscope,
  TrendingUp,
  Heart,
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface StatCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  trend?: string;
}

function StatCard({ icon: Icon, iconColor, iconBg, label, value, trend }: StatCardProps) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-2xl grid place-items-center shrink-0', iconBg, iconColor)}>
        <Icon size={22} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="eyebrow mb-1">{label}</p>
        <p className="text-xl font-bold text-slate-900 truncate leading-tight">{value}</p>
        {trend && (
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
            <TrendingUp size={11} /> {trend}
          </p>
        )}
      </div>
    </div>
  );
}

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
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="card max-w-md mx-auto p-10 text-center mt-12">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 grid place-items-center text-slate-400 mb-4">
          <Activity size={26} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Chưa có dữ liệu tổng quan</h2>
        <p className="text-sm text-slate-500">
          Hồ sơ sức khỏe của bạn sẽ được cập nhật sau lần khám đầu tiên.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-1.5">Bảng điều khiển</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Tổng quan sức khỏe
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Cập nhật nhanh tình trạng y tế và lịch trình sắp tới của bạn.
          </p>
        </div>
        <Link to="/scheduling" className="btn-primary">
          <CalendarDays size={16} />
          Đặt lịch khám
        </Link>
      </div>

      {/* ─── Stat cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Droplet}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          label="Nhóm máu"
          value={dashboardData.bloodType || 'Chưa rõ'}
        />
        <StatCard
          icon={Heart}
          iconColor="text-primary"
          iconBg="bg-sky-50"
          label="Trạng thái"
          value="Khỏe mạnh"
          trend="ổn định"
        />
        <StatCard
          icon={CalendarDays}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
          label="Lịch sắp tới"
          value={`${dashboardData.appointments?.length || 0} lịch`}
        />
        <StatCard
          icon={Pill}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          label="Đơn thuốc đang dùng"
          value={`${dashboardData.prescriptions?.length || 0} đơn`}
        />
      </div>

      {/* ─── Allergies banner ──────────────────────────── */}
      {dashboardData.allergies && dashboardData.allergies !== 'Không' && (
        <div className="card-flat p-5 bg-amber-50/60 border-amber-200/70 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 grid place-items-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Dị ứng đã ghi nhận</p>
            <p className="text-sm text-amber-800/80 mt-0.5">{dashboardData.allergies}</p>
          </div>
        </div>
      )}

      {/* ─── Main grid: appointments + labs / prescriptions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming appointments */}
          <section className="card p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-primary grid place-items-center">
                  <CalendarDays size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Lịch khám sắp tới</h3>
              </div>
              <Link
                to="/scheduling"
                className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-0.5"
              >
                Xem tất cả <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {dashboardData.appointments?.length > 0 ? (
                dashboardData.appointments.map((appt: any) => (
                  <div
                    key={appt.id}
                    className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-slate-200/70 bg-white hover:border-primary/40 hover:shadow-soft transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Date block */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-50 to-teal-50 border border-sky-100/70 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold uppercase text-primary tracking-wider leading-none">
                          {new Date(appt.date).toLocaleString('vi-VN', { month: 'short' })}
                        </span>
                        <span className="text-xl font-extrabold text-slate-900 mt-0.5">
                          {new Date(appt.date).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{appt.reason}</p>
                        <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(appt.date).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {appt.department && (
                            <span className="inline-flex items-center gap-1">
                              <Stethoscope size={12} /> {appt.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        appt.status === 'CONFIRMED'
                          ? 'pill-success'
                          : appt.status === 'COMPLETED'
                          ? 'pill-primary'
                          : appt.status === 'CANCELLED'
                          ? 'pill-danger'
                          : 'pill-warning',
                      )}
                    >
                      {appt.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500">Không có lịch khám nào sắp tới.</p>
                </div>
              )}
            </div>
          </section>

          {/* Lab results */}
          <section className="card p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 grid place-items-center">
                  <Activity size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Kết quả xét nghiệm gần đây</h3>
              </div>
              <Link
                to="/lab-results"
                className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-0.5"
              >
                Xem tất cả <ChevronRight size={14} />
              </Link>
            </div>

            {dashboardData.labResults?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dashboardData.labResults.map((lab: any) => (
                  <div
                    key={lab.id}
                    className="p-4 rounded-2xl border border-slate-200/70 hover:border-primary/40 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {lab.testName}
                      </p>
                      {lab.status === 'COMPLETED' && (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
                        {lab.resultValue}
                      </p>
                      {lab.resultUnit && (
                        <p className="text-xs text-slate-500 font-medium">{lab.resultUnit}</p>
                      )}
                    </div>
                    {lab.normalRange && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Khoảng bình thường: {lab.normalRange}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500">Chưa có kết quả xét nghiệm.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right column: prescriptions */}
        <div className="space-y-6">
          <section className="card p-6 sm:p-7 lg:sticky lg:top-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 grid place-items-center">
                <Pill size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Đơn thuốc hiện tại</h3>
            </div>

            <div className="space-y-3">
              {dashboardData.prescriptions?.length > 0 ? (
                dashboardData.prescriptions.map((presc: any) => (
                  <div
                    key={presc.id}
                    className="p-4 rounded-2xl border border-slate-200/70 hover:border-amber-300 hover:bg-amber-50/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {presc.medicationName}
                      </p>
                      {presc.duration && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md shrink-0">
                          {presc.duration} ngày
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                      <span>{presc.dosage}</span>
                      <span className="text-slate-400">·</span>
                      <span>{presc.frequency}</span>
                    </div>
                    {presc.instructions && (
                      <p className="text-[11px] text-slate-500 mt-2 italic line-clamp-2">
                        {presc.instructions}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200">
                  <Pill size={20} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">Không có đơn thuốc đang dùng.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
