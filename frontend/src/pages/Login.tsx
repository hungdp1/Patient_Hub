import React, { useState } from 'react';
import { UserRole } from '../types';
import { authService } from '../services/authService';
import {
  Lock,
  Phone,
  HeartPulse,
  User as UserIcon,
  Stethoscope,
  ShieldAlert,
  FlaskConical,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { motion } from 'motion/react';

interface RoleOption {
  role: UserRole;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const ROLE_OPTIONS: RoleOption[] = [
  { role: UserRole.PATIENT,    label: 'Bệnh nhân', icon: UserIcon },
  { role: UserRole.DOCTOR,     label: 'Bác sĩ',    icon: Stethoscope },
  { role: UserRole.ADMIN,      label: 'Quản lý',   icon: ShieldAlert },
  { role: UserRole.TECHNICIAN, label: 'KTV',       icon: FlaskConical },
];

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({
        phoneNumber: phone,
        password,
      });

      if (response.success && response.token) {
        authService.setToken(response.token);
        if (response.user) {
          authService.setUserData(response.user);
        }
        localStorage.setItem('isAuthenticated', 'true');
        window.location.href = '/';
      } else {
        setError(response.message || 'Đăng nhập thất bại');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch">
      {/* ─── Hero side ───────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-700 to-teal-700">
        {/* Decorative blobs */}
        <div className="absolute top-0 -right-20 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-sky-300/15 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md grid place-items-center border border-white/20">
              <HeartPulse size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">Mediflow</p>
              <p className="text-xs text-white/70">Hệ thống y tế thông minh</p>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8 max-w-lg"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium">
                <Sparkles size={12} className="text-teal-200" />
                Tích hợp AI hỗ trợ chẩn đoán
              </span>
              <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1]">
                Chăm sóc sức khỏe<br />
                <span className="text-teal-200">thông minh & tận tâm.</span>
              </h1>
              <p className="text-white/80 text-base leading-relaxed">
                Quản lý lịch khám, hồ sơ bệnh án, kết quả xét nghiệm và trao đổi
                trực tiếp với đội ngũ y tế — tất cả trong một nền tảng.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {[
                { icon: Activity,    text: 'Theo dõi sức khỏe theo thời gian thực' },
                { icon: ShieldCheck, text: 'Hồ sơ y tế bảo mật đầu-cuối (AES-256)' },
                { icon: Sparkles,    text: 'Trợ lý AI sẵn sàng 24/7' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-white/85">
                  <div className="w-8 h-8 rounded-xl bg-white/10 grid place-items-center border border-white/10">
                    <Icon size={15} />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer note */}
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Mediflow. Bảo mật đạt chuẩn HIPAA.
          </p>
        </div>
      </div>

      {/* ─── Form side ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 grid place-items-center">
              <HeartPulse size={20} className="text-white" />
            </div>
            <p className="text-lg font-bold tracking-tight text-slate-900">Mediflow</p>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Đăng nhập
            </h2>
            <p className="text-sm text-slate-500">
              Chọn vai trò của bạn và nhập thông tin để tiếp tục.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700"
              >
                <span className="font-medium">⚠</span>
                <span>{error}</span>
              </motion.div>
            )}

            {/* Role chooser */}
            <div className="space-y-2">
              <label className="eyebrow">Vai trò</label>
              <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-2xl">
                {ROLE_OPTIONS.map(({ role: r, label, icon: Icon }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`relative flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-semibold transition-all
                      ${role === r
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70'
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    <Icon size={18} className={role === r ? 'text-primary' : ''} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="label">
                <Phone size={14} /> Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xx xxx xxx"
                className="input"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="label">
                <Lock size={14} /> Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-base"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </span>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 pt-2">
              Bạn được bảo vệ bởi mã hóa AES-256 và xác thực JWT 2 lớp.
            </p>

            {/* Demo accounts hint */}
            <div className="text-center text-[11px] text-slate-400 pt-1">
              Demo: <span className="font-mono">0900000001</span> (admin) ·{' '}
              <span className="font-mono">0900000004</span> (bệnh nhân) — mật khẩu{' '}
              <span className="font-mono">Password@123</span>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
