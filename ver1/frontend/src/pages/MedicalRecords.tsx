/**
 * Patient Medical Records — comprehensive read-only view of a patient's
 * own clinical data. Pulls 4 endpoints in parallel:
 *   - /api/data/medical-records  (visits + diagnoses)
 *   - /api/data/lab-results      (test results)
 *   - /api/data/prescriptions    (Rx)
 *   - /api/data/user/dashboard   (patient profile: blood type, allergies, ...)
 *
 * Backend already scopes every list to the logged-in patient (see
 * `buildPatientScope` in dataController). Nothing to filter client-side.
 *
 * Layout:
 *   1. Patient profile header   — blood type / allergies / insurance / etc.
 *   2. 4 summary stat cards
 *   3. Three tabs:
 *        a) "Theo đợt khám"  — timeline of visits, each expandable to
 *           show its associated lab results + prescriptions
 *        b) "Đơn thuốc"      — full Rx list with details + doctor info
 *        c) "Xét nghiệm"     — lab results with normal-range highlighting
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardList,
  FlaskConical,
  Pill,
  Calendar,
  Stethoscope,
  HeartPulse,
  Droplet,
  AlertCircle,
  ChevronDown,
  Loader2,
  ShieldCheck,
  User as UserIcon,
  Phone,
  Building2,
  TrendingUp,
  TrendingDown,
  Check,
  History,
  FileText,
} from 'lucide-react';

import { cn } from '../lib/utils';
import { dataService } from '../services/dataService';

// ─── API response shapes ───────────────────────────────

interface ApiUser {
  id: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  role?: string;
}

interface ApiDoctor {
  id: string;
  specialization?: string;
  department?: string;
  office?: string;
  degree?: string;
  experience?: number;
  rating?: number;
  user?: ApiUser;
}

interface ApiPatient {
  id: string;
  bloodType?: string | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
  emergencyContact?: string | null;
  insuranceId?: string | null;
  insuranceProvider?: string | null;
  user?: ApiUser;
}

interface ApiMedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string | null;
  recordType?: string;
  diagnosis?: string | null;
  symptoms?: string | null;
  treatment?: string | null;
  notes?: string | null;
  recordDate: string;
  createdAt: string;
  doctor?: ApiDoctor;
  patient?: ApiPatient;
}

interface ApiLabResult {
  id: string;
  medicalRecordId?: string | null;
  testName: string;
  testCode?: string | null;
  status?: string;
  resultValue?: string | null;
  resultUnit?: string | null;
  normalRange?: string | null;
  testDate: string;
  doctor?: ApiDoctor;
  technician?: { user?: ApiUser; department?: string; specialization?: string };
}

interface ApiPrescription {
  id: string;
  medicalRecordId?: string | null;
  medicationName: string;
  treatmentType?: string | null;
  dosage: string;
  frequency: string;
  duration?: number | null;
  quantity?: number | null;
  instructions?: string | null;
  isActive: boolean;
  prescriptionDate: string;
  doctor?: ApiDoctor;
}

// ─── Helpers ───────────────────────────────────────────

const formatDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const doctorName = (d?: ApiDoctor) => {
  if (!d?.user) return 'Bác sĩ điều trị';
  return `BS. ${d.user.firstName ?? ''} ${d.user.lastName ?? ''}`.trim();
};

const RECORD_TYPE_LABEL: Record<string, string> = {
  GENERAL_CHECKUP: 'Khám tổng quát',
  DIAGNOSIS: 'Chẩn đoán',
  FOLLOW_UP: 'Tái khám',
  TREATMENT: 'Điều trị',
  EMERGENCY: 'Cấp cứu',
  SURGERY: 'Phẫu thuật',
};

const RECORD_TYPE_TONE: Record<string, string> = {
  GENERAL_CHECKUP: 'bg-sky-50 text-sky-700 border-sky-200',
  DIAGNOSIS: 'bg-violet-50 text-violet-700 border-violet-200',
  FOLLOW_UP: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  TREATMENT: 'bg-amber-50 text-amber-700 border-amber-200',
  EMERGENCY: 'bg-rose-50 text-rose-700 border-rose-200',
  SURGERY: 'bg-orange-50 text-orange-700 border-orange-200',
};

// Compare numeric result against `<N` / `N-M` style ranges. Returns 'HIGH',
// 'LOW', 'NORMAL', or 'UNKNOWN' if we can't parse the range.
function labStatus(value?: string | null, range?: string | null): 'HIGH' | 'LOW' | 'NORMAL' | 'UNKNOWN' {
  if (!value || !range) return 'UNKNOWN';
  const num = parseFloat(value);
  if (Number.isNaN(num)) return 'UNKNOWN';
  // "<5.2" or "<40"
  const ltMatch = range.match(/^<\s*([0-9.]+)/);
  if (ltMatch) return num <= parseFloat(ltMatch[1]) ? 'NORMAL' : 'HIGH';
  // ">5"
  const gtMatch = range.match(/^>\s*([0-9.]+)/);
  if (gtMatch) return num >= parseFloat(gtMatch[1]) ? 'NORMAL' : 'LOW';
  // "120-160" or "120 - 160"
  const rangeMatch = range.match(/([0-9.]+)\s*-\s*([0-9.]+)/);
  if (rangeMatch) {
    const lo = parseFloat(rangeMatch[1]);
    const hi = parseFloat(rangeMatch[2]);
    if (num < lo) return 'LOW';
    if (num > hi) return 'HIGH';
    return 'NORMAL';
  }
  return 'UNKNOWN';
}

const LAB_STATUS_TONE: Record<string, string> = {
  HIGH: 'text-rose-600 bg-rose-50',
  LOW: 'text-amber-600 bg-amber-50',
  NORMAL: 'text-emerald-600 bg-emerald-50',
  UNKNOWN: 'text-slate-500 bg-slate-50',
};

// ─── Component ─────────────────────────────────────────

type Tab = 'visits' | 'prescriptions' | 'labs';

export default function MedicalRecords() {
  const [records, setRecords] = useState<ApiMedicalRecord[]>([]);
  const [labs, setLabs] = useState<ApiLabResult[]>([]);
  const [prescriptions, setPrescriptions] = useState<ApiPrescription[]>([]);
  const [patientProfile, setPatientProfile] = useState<ApiPatient | null>(null);
  const [tab, setTab] = useState<Tab>('visits');
  const [loading, setLoading] = useState(true);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [recs, labResults, rx, dashboard] = await Promise.all([
          (dataService.getMedicalRecords() as unknown) as Promise<ApiMedicalRecord[]>,
          (dataService.getLabResults() as unknown) as Promise<ApiLabResult[]>,
          (dataService.getPrescriptions() as unknown) as Promise<ApiPrescription[]>,
          dataService.getPatientDashboard().catch(() => null),
        ]);
        setRecords(Array.isArray(recs) ? recs : []);
        setLabs(Array.isArray(labResults) ? labResults : []);
        setPrescriptions(Array.isArray(rx) ? rx : []);
        // Prefer joined `patient` from a record (always present); fall back
        // to the dashboard payload if no record exists yet.
        const fromRecord = recs?.[0]?.patient ?? null;
        setPatientProfile(fromRecord ?? dashboard ?? null);
      } catch (err) {
        console.error('Failed to load medical records', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Group labs / prescriptions by medical record for the timeline view.
  const labsByRecord = useMemo(() => {
    const map = new Map<string, ApiLabResult[]>();
    labs.forEach((l) => {
      if (!l.medicalRecordId) return;
      const arr = map.get(l.medicalRecordId) ?? [];
      arr.push(l);
      map.set(l.medicalRecordId, arr);
    });
    return map;
  }, [labs]);

  const prescriptionsByRecord = useMemo(() => {
    const map = new Map<string, ApiPrescription[]>();
    prescriptions.forEach((p) => {
      if (!p.medicalRecordId) return;
      const arr = map.get(p.medicalRecordId) ?? [];
      arr.push(p);
      map.set(p.medicalRecordId, arr);
    });
    return map;
  }, [prescriptions]);

  const activePrescriptions = prescriptions.filter((p) => p.isActive);

  // ─── Render ────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center">
        <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={32} />
        <p className="text-slate-500 text-sm">Đang tải hồ sơ bệnh án...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ─── Header ─── */}
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hồ sơ Bệnh án</h2>
        <p className="text-slate-500 text-sm">
          Toàn bộ thông tin sức khỏe, đợt khám, xét nghiệm và đơn thuốc của bạn — đồng bộ từ hệ thống bệnh viện.
        </p>
      </div>

      {/* ─── Patient profile card ─── */}
      {patientProfile && <PatientProfileHeader patient={patientProfile} />}

      {/* ─── Summary stats ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<History size={20} />} label="Đợt khám" value={records.length} tone="sky" />
        <StatCard
          icon={<Pill size={20} />}
          label="Đơn đang dùng"
          value={activePrescriptions.length}
          sub={`/ ${prescriptions.length} tổng`}
          tone="emerald"
        />
        <StatCard icon={<FlaskConical size={20} />} label="Kết quả XN" value={labs.length} tone="violet" />
        <StatCard
          icon={<AlertCircle size={20} />}
          label="Dị ứng"
          value={patientProfile?.allergies && patientProfile.allergies !== 'Không' ? 1 : 0}
          sub={patientProfile?.allergies ?? '—'}
          tone="rose"
        />
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-full md:max-w-xl">
        {([
          { id: 'visits', label: 'Theo đợt khám', icon: ClipboardList, count: records.length },
          { id: 'prescriptions', label: 'Đơn thuốc', icon: Pill, count: prescriptions.length },
          { id: 'labs', label: 'Xét nghiệm', icon: FlaskConical, count: labs.length },
        ] as { id: Tab; label: string; icon: any; count: number }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap',
              tab === t.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800',
            )}
          >
            <t.icon size={16} />
            <span className="hidden sm:inline">{t.label}</span>
            <span className={cn('text-[10px] px-1.5 rounded-full', tab === t.id ? 'bg-primary/10' : 'bg-slate-200')}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Tab content ─── */}
      <AnimatePresence mode="wait">
        {tab === 'visits' && (
          <motion.div
            key="visits"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {records.length === 0 ? (
              <EmptyState icon={<ClipboardList size={28} />} text="Bạn chưa có đợt khám nào trong hệ thống." />
            ) : (
              records.map((r) => (
                <VisitCard
                  key={r.id}
                  record={r}
                  expanded={expandedRecordId === r.id}
                  onToggle={() => setExpandedRecordId(expandedRecordId === r.id ? null : r.id)}
                  labs={labsByRecord.get(r.id) ?? []}
                  prescriptions={prescriptionsByRecord.get(r.id) ?? []}
                />
              ))
            )}
          </motion.div>
        )}

        {tab === 'prescriptions' && (
          <motion.div
            key="prescriptions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {prescriptions.length === 0 ? (
              <EmptyState icon={<Pill size={28} />} text="Chưa có đơn thuốc nào." />
            ) : (
              prescriptions.map((p) => <PrescriptionCard key={p.id} rx={p} />)
            )}
          </motion.div>
        )}

        {tab === 'labs' && (
          <motion.div
            key="labs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {labs.length === 0 ? (
              <EmptyState icon={<FlaskConical size={28} />} text="Chưa có kết quả xét nghiệm nào." />
            ) : (
              <LabResultsTable labs={labs} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────

function PatientProfileHeader({ patient }: { patient: ApiPatient }) {
  const u = patient.user;
  const name = u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : 'Bệnh nhân';
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';
  const age = u?.dateOfBirth ? new Date().getFullYear() - new Date(u.dateOfBirth).getFullYear() : null;

  return (
    <section className="bg-gradient-to-br from-sky-50 to-teal-50 border border-sky-200/50 rounded-3xl p-5 sm:p-6 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-sky-200/40 to-teal-200/40 rounded-full blur-2xl" />
      <div className="relative flex flex-col md:flex-row md:items-center gap-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-white font-extrabold text-2xl grid place-items-center shadow-lg shadow-sky-500/25 shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{name}</h3>
            {patient.bloodType && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                <Droplet size={11} /> Nhóm máu {patient.bloodType}
              </span>
            )}
          </div>
          <div className="text-sm text-slate-600 flex items-center gap-3 flex-wrap">
            {u?.phoneNumber && (
              <span className="inline-flex items-center gap-1">
                <Phone size={13} className="text-slate-400" /> {u.phoneNumber}
              </span>
            )}
            {age !== null && <span>· {age} tuổi</span>}
            {u?.gender && <span>· {u.gender === 'MALE' ? 'Nam' : u.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span>}
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <ProfileField
          icon={<AlertCircle size={14} className="text-rose-500" />}
          label="Dị ứng"
          value={patient.allergies || 'Không có'}
        />
        <ProfileField
          icon={<HeartPulse size={14} className="text-amber-500" />}
          label="Bệnh mạn tính"
          value={patient.chronicDiseases || 'Không có'}
        />
        <ProfileField
          icon={<Phone size={14} className="text-sky-500" />}
          label="Liên hệ khẩn cấp"
          value={patient.emergencyContact || '—'}
        />
        <ProfileField
          icon={<ShieldCheck size={14} className="text-emerald-500" />}
          label="Bảo hiểm"
          value={
            patient.insuranceProvider
              ? `${patient.insuranceProvider} · ${patient.insuranceId ?? ''}`
              : 'Chưa đăng ký'
          }
        />
      </div>
    </section>
  );
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/60">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1.5">
        {icon} {label}
      </p>
      <p className="text-sm font-semibold text-slate-800 leading-snug">{value}</p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  tone: 'sky' | 'emerald' | 'violet' | 'rose';
}) {
  const toneCls = {
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  }[tone];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
      <div className={cn('w-10 h-10 rounded-xl grid place-items-center border', toneCls)}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-slate-500 truncate mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function VisitCard({
  record,
  expanded,
  onToggle,
  labs,
  prescriptions,
}: {
  record: ApiMedicalRecord;
  expanded: boolean;
  onToggle: () => void;
  labs: ApiLabResult[];
  prescriptions: ApiPrescription[];
}) {
  const typeLabel = record.recordType ? RECORD_TYPE_LABEL[record.recordType] || record.recordType : 'Khám';
  const typeTone = record.recordType ? RECORD_TYPE_TONE[record.recordType] || RECORD_TYPE_TONE.DIAGNOSIS : '';
  const symptoms = (record.symptoms || '').split(',').map((s) => s.trim()).filter(Boolean);

  return (
    <article className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full text-left p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 md:items-start"
      >
        {/* Date pill */}
        <div className="shrink-0 flex flex-col items-center md:w-24 bg-gradient-to-br from-sky-50 to-teal-50 rounded-2xl py-3 px-3 border border-sky-100">
          <Calendar size={14} className="text-primary mb-1" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Ngày khám</p>
          <p className="text-sm font-extrabold text-slate-900">{formatDate(record.recordDate)}</p>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start gap-2 flex-wrap">
            <span className={cn('inline-block text-[10px] font-bold uppercase px-2 py-1 rounded-md border', typeTone)}>
              {typeLabel}
            </span>
            {record.doctor?.department && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                <Building2 size={10} /> {record.doctor.department}
              </span>
            )}
          </div>

          <h4 className="text-lg font-bold text-primary leading-tight">
            {record.diagnosis || 'Chưa có chẩn đoán'}
          </h4>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Stethoscope size={14} className="text-slate-400" />
            <span>{doctorName(record.doctor)}</span>
            {record.doctor?.specialization && (
              <span className="text-slate-400">· {record.doctor.specialization}</span>
            )}
          </div>

          {symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {symptoms.slice(0, 4).map((s, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100"
                >
                  {s}
                </span>
              ))}
              {symptoms.length > 4 && (
                <span className="text-[11px] text-slate-400 font-medium">+{symptoms.length - 4} khác</span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 font-medium">
            {labs.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-100">
                <FlaskConical size={11} /> {labs.length} xét nghiệm
              </span>
            )}
            {prescriptions.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Pill size={11} /> {prescriptions.length} đơn thuốc
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={20}
          className={cn(
            'text-slate-400 transition-transform shrink-0 mt-1',
            expanded && 'rotate-180 text-primary',
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-5 space-y-5 bg-slate-50/40">
              {/* Treatment + notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {record.treatment && (
                  <DetailBox icon={<HeartPulse size={14} />} title="Hướng điều trị" tone="emerald">
                    {record.treatment}
                  </DetailBox>
                )}
                {record.notes && (
                  <DetailBox icon={<FileText size={14} />} title="Ghi chú bác sĩ" tone="amber">
                    {record.notes}
                  </DetailBox>
                )}
              </div>

              {/* Doctor card */}
              {record.doctor && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white grid place-items-center shadow-sm shrink-0">
                    <Stethoscope size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{doctorName(record.doctor)}</p>
                    <p className="text-xs text-slate-500">
                      {record.doctor.specialization} · {record.doctor.degree ?? ''}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      {record.doctor.office && <span>Phòng {record.doctor.office}</span>}
                      {typeof record.doctor.experience === 'number' && (
                        <span>{record.doctor.experience} năm KN</span>
                      )}
                      {typeof record.doctor.rating === 'number' && (
                        <span>⭐ {record.doctor.rating.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Linked labs */}
              {labs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <FlaskConical size={12} /> Kết quả xét nghiệm
                  </p>
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <LabRows labs={labs} compact />
                  </div>
                </div>
              )}

              {/* Linked prescriptions */}
              {prescriptions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Pill size={12} /> Đơn thuốc kê
                  </p>
                  <div className="space-y-2">
                    {prescriptions.map((p) => (
                      <PrescriptionCard key={p.id} rx={p} compact />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

function DetailBox({
  icon,
  title,
  tone,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  tone: 'emerald' | 'amber';
  children: React.ReactNode;
}) {
  const cls = {
    emerald: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
    amber: 'bg-amber-50/70 border-amber-200 text-amber-900',
  }[tone];
  return (
    <div className={cn('rounded-2xl border p-4', cls)}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5 opacity-80">
        {icon} {title}
      </p>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function PrescriptionCard({ rx, compact = false }: { rx: ApiPrescription; compact?: boolean }) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-start gap-4',
        compact ? 'p-3' : 'p-4',
      )}
    >
      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0 border border-emerald-100">
        <Pill size={18} />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h5 className="font-bold text-slate-900">{rx.medicationName}</h5>
          {rx.isActive ? (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check size={9} className="inline mr-0.5" /> Đang dùng
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              Đã ngưng
            </span>
          )}
          {rx.treatmentType && (
            <span className="text-[10px] font-medium text-slate-500">· {rx.treatmentType}</span>
          )}
        </div>
        <p className="text-sm text-slate-700">
          <span className="font-semibold">{rx.dosage}</span> — {rx.frequency}
          {rx.duration && ` · ${rx.duration} ngày`}
          {rx.quantity && ` · SL ${rx.quantity}`}
        </p>
        {rx.instructions && (
          <p className="text-xs text-slate-500 italic leading-relaxed">💊 {rx.instructions}</p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
          <span>Kê ngày {formatDate(rx.prescriptionDate)}</span>
          {rx.doctor && <span>· {doctorName(rx.doctor)}</span>}
        </div>
      </div>
    </div>
  );
}

function LabResultsTable({ labs }: { labs: ApiLabResult[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
      <LabRows labs={labs} />
    </div>
  );
}

function LabRows({ labs, compact = false }: { labs: ApiLabResult[]; compact?: boolean }) {
  // Sort newest first
  const sorted = [...labs].sort(
    (a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime(),
  );

  return (
    <div className="divide-y divide-slate-100">
      {!compact && (
        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="col-span-5">Xét nghiệm</div>
          <div className="col-span-3">Kết quả</div>
          <div className="col-span-2">CS tham chiếu</div>
          <div className="col-span-2 text-right">Ngày</div>
        </div>
      )}
      {sorted.map((l) => {
        const status = labStatus(l.resultValue, l.normalRange);
        const tone = LAB_STATUS_TONE[status];
        return (
          <div
            key={l.id}
            className={cn(
              'grid grid-cols-12 gap-3 items-center hover:bg-slate-50/50 transition-colors',
              compact ? 'px-3 py-2.5' : 'px-5 py-3.5',
            )}
          >
            <div className="col-span-5 min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">{l.testName}</p>
              {l.doctor && (
                <p className="text-[11px] text-slate-400 truncate">{doctorName(l.doctor)}</p>
              )}
            </div>
            <div className="col-span-3 flex items-center gap-1.5">
              <span className={cn('font-bold text-sm px-2 py-0.5 rounded-md', tone)}>
                {l.resultValue ?? '—'}
              </span>
              <span className="text-xs text-slate-500">{l.resultUnit ?? ''}</span>
              {status === 'HIGH' && <TrendingUp size={12} className="text-rose-500" />}
              {status === 'LOW' && <TrendingDown size={12} className="text-amber-500" />}
            </div>
            <div className="col-span-2 text-xs text-slate-500 italic">{l.normalRange || '—'}</div>
            <div className="col-span-2 text-right text-[11px] text-slate-400 font-medium">
              {formatDate(l.testDate)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
      <div className="w-14 h-14 mx-auto bg-slate-100 text-slate-400 rounded-2xl grid place-items-center">
        {icon}
      </div>
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  );
}
