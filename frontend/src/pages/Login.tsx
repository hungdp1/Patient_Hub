import React, { useState } from 'react';
import { UserRole } from '../types';
import { authService } from '../services/authService';
import { LogIn, Lock, Phone, HeartPulse, User as UserIcon, Stethoscope, ShieldAlert, FlaskConical } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getDefaultUserName = (selectedRole: UserRole) => {
    switch (selectedRole) {
      case UserRole.ADMIN:
        return 'Quản Lý Bệnh Viện';
      case UserRole.DOCTOR:
        return 'BS. Lê Thành Nam';
      case UserRole.TECHNICIAN:
        return 'KTV. Nguyễn Văn Khoa';
      default:
        return 'Nguyễn Văn A';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({
        phoneNumber: phone,
        password: password,
      });

      if (response.success && response.token) {
        authService.setToken(response.token);
        if (response.user) {
          authService.setUserData(response.user);
        }
        localStorage.setItem('isAuthenticated', 'true');
        // Redirect to home page after login
        window.location.href = '/';
      } else {
        setError(response.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="bg-primary/40 p-8 text-center text-slate-800">
          <div className="inline-flex p-3 bg-white/50 rounded-full mb-4 text-primary-dark">
            <HeartPulse size={40} />
          </div>
          <h1 className="text-2xl font-bold">Mediflow</h1>
          <p className="text-slate-500 text-sm font-medium">Hệ thống Y tế Thông minh</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button 
                type="button"
                onClick={() => setRole(UserRole.PATIENT)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${role === UserRole.PATIENT ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <UserIcon size={16} /> Bệnh nhân
              </button>
              <button 
                type="button"
                onClick={() => setRole(UserRole.DOCTOR)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${role === UserRole.DOCTOR ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Stethoscope size={16} /> Bác sĩ
              </button>
              <button 
                type="button"
                onClick={() => setRole(UserRole.ADMIN)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${role === UserRole.ADMIN ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ShieldAlert size={16} /> Quản lý
              </button>
              <button 
                type="button"
                onClick={() => setRole(UserRole.TECHNICIAN)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${role === UserRole.TECHNICIAN ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <FlaskConical size={16} /> KTV
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Phone size={16} /> Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xx xxx xxx"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Lock size={16} /> Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <LogIn size={20} /> Đăng nhập
          </button>
        </form>
      </motion.div>
    </div>
  );
}
