import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, ShieldCheck, Lock, ChevronRight, Save, HeartPulse, LogOut, Sparkles, Activity, CreditCard, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import type { CreditCardDetails } from '../types';
import { userService, UserProfile } from '../services/userService';
export default function Profile() {
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'payment'>('info');
  const [successVisible, setSuccessVisible] = useState(false);
  const [userRole, setUserRole] = useState<string>('PATIENT');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment Security State
  const [isPaymentUnlocked, setIsPaymentUnlocked] = useState(false);
  const [paymentPin, setPaymentPin] = useState('');
  const [paymentPinError, setPaymentPinError] = useState(false);

  // Profile State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<any>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    city: '',
    country: '',
    specialty: '',
    education: '',
    achievements: [],
    rooms: ['Phòng 102 - Tầng 1']
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data);
        setUserRole(data.role || 'PATIENT');
        setEditForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          specialty: data.doctor?.specialization || '',
          education: data.doctor?.education || '',
          achievements: data.doctor?.achievements ? data.doctor.achievements.split(',') : [],
          rooms: ['Phòng 102 - Tầng 1'],
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const displayInfo = {
    name: profile ? `${profile.firstName} ${profile.lastName}` : '',
    id: profile?.id || '',
    dob: profile?.dateOfBirth || '',
    gender: profile?.gender === 'MALE' ? 'Nam' : 'Nữ',
    phone: editForm.phoneNumber || '',
    email: profile?.email || '',
    address: editForm.address || '',
    bloodType: profile?.patient?.bloodType || 'Chưa cập nhật',
    allergies: profile?.patient?.allergies || 'Không',
    specialty: editForm.specialty || '',
    education: editForm.education || '',
    achievements: editForm.achievements || [],
    rooms: editForm.rooms || [],
    age: profile?.dateOfBirth ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : 0,
  };

  const [creditCard, setCreditCard] = useState<CreditCardDetails>(() => {
    const saved = localStorage.getItem('creditCard');
    return saved ? JSON.parse(saved) : {
      number: '4455 6677 8899 1122',
      name: 'NGUYEN VAN A',
      expiry: '12/26',
      cvv: '123',
      address: '123 Đường ABC, Quận 1',
      city: 'TP. Hồ Chí Minh',
      zip: '700000'
    };
  });

  const handleSave = async () => {
    try {
      await userService.updateProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
        city: editForm.city,
        country: editForm.country,
      });
      setSuccessVisible(true);
      setTimeout(() => setSuccessVisible(false), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  const handleSaveCard = () => {
    localStorage.setItem('creditCard', JSON.stringify(creditCard));
    handleSave();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            {userRole === 'DOCTOR' 
              ? 'Hồ sơ chuyên môn' 
              : userRole === 'TECHNICIAN' 
                ? 'Hồ sơ KTV' 
                : userRole === 'ADMIN'
                  ? 'Quản lý bệnh viện'
                  : 'Hồ sơ bệnh nhân'}
          </h1>
          <p className="text-slate-500 mt-2">
            {userRole === 'DOCTOR' 
              ? 'Quản lý thông tin công tác và chứng chỉ chuyên môn.' 
              : userRole === 'TECHNICIAN'
                ? 'Quản lý thông tin kỹ thuật viên và cài đặt bảo mật.'
                : userRole === 'ADMIN'
                  ? 'Quản lý thông tin hệ thống và cấu hình bệnh viện.'
                  : 'Quản lý thông tin cá nhân và cài đặt bảo mật.'}
          </p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('info')}
            className={cn(
              "px-6 py-2 text-sm font-bold rounded-lg transition-all",
              activeTab === 'info' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {userRole === 'DOCTOR' ? 'Chuyên môn' : 'Thông tin'}
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={cn(
              "px-6 py-2 text-sm font-bold rounded-lg transition-all",
              activeTab === 'security' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Bảo mật
          </button>
          {userRole === 'PATIENT' && (
            <button 
              onClick={() => setActiveTab('payment')}
              className={cn(
                "px-6 py-2 text-sm font-bold rounded-lg transition-all",
                activeTab === 'payment' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Thanh toán
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'info' ? (
          <motion.div 
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Left Column: Avatar & Basic Stats */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-sm">
                <div className="relative inline-block group">
                  <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center border-4 border-slate-50 overflow-hidden mx-auto transition-transform group-hover:scale-[1.02]">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={64} className="text-slate-300" />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    <Camera size={24} />
                  </label>
                  <div className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full border-4 border-white flex items-center justify-center text-slate-800">
                    <ShieldCheck size={14} />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mt-6">{displayInfo.name}</h2>
                <p className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full inline-block mt-2">{(displayInfo as any).id}</p>
                
                <div className="mt-8 pt-8 border-t border-slate-100">
                  {userRole !== 'DOCTOR' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nhóm máu</p>
                        <p className="text-lg font-bold text-slate-800">{displayInfo.bloodType}</p>
                      </div>
                      <div className="text-left border-l border-slate-100 pl-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giới tính</p>
                        <p className="text-lg font-bold text-slate-800">{displayInfo.gender}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Info Form */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-8">{userRole === 'DOCTOR' ? 'Thông tin công tác' : 'Chi tiết liên hệ'}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Họ và tên</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={`${editForm.firstName} ${editForm.lastName}`.trim()}
                        onChange={(e) => {
                          const parts = e.target.value.split(' ');
                          setEditForm({
                            ...editForm, 
                            firstName: parts[0] || '', 
                            lastName: parts.slice(1).join(' ') || ''
                          });
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{userRole === 'DOCTOR' ? 'Tuổi' : 'Ngày sinh'}</label>
                    <div className="relative">
                      {userRole === 'DOCTOR' ? <Activity className="absolute left-4 top-3.5 text-slate-400" size={18} /> : <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />}
                      <input 
                        type="text" 
                        value={userRole === 'DOCTOR' ? `${displayInfo.age} tuổi` : displayInfo.dob}
                        disabled
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all cursor-not-allowed opacity-70"
                      />
                    </div>
                  </div>

                  {userRole === 'DOCTOR' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Chuyên khoa</label>
                      <div className="relative">
                        <Sparkles className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          value={editForm.specialty}
                          onChange={(e) => setEditForm({...editForm, specialty: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        value={displayInfo.email}
                        disabled
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all cursor-not-allowed opacity-70"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{userRole === 'DOCTOR' ? 'Học vấn' : 'Địa chỉ'}</label>
                    <div className="relative">
                      {userRole === 'DOCTOR' ? <ShieldCheck className="absolute left-4 top-3.5 text-slate-400" size={18} /> : <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />}
                      <input 
                        type="text" 
                        value={userRole === 'DOCTOR' ? editForm.education : editForm.address}
                        onChange={(e) => {
                          if (userRole === 'DOCTOR') setEditForm({...editForm, education: e.target.value});
                          else setEditForm({...editForm, address: e.target.value});
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  {userRole === 'DOCTOR' && (
                    <>
                      <div className="sm:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Phòng làm việc</label>
                          <button 
                            onClick={() => setEditForm({...editForm, rooms: [...editForm.rooms, '']})}
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            + Thêm phòng
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {editForm.rooms.map((room: string, idx: number) => (
                            <div key={idx} className="relative group">
                              <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                              <input 
                                type="text" 
                                value={room}
                                onChange={(e) => {
                                  const newRooms = [...editForm.rooms];
                                  newRooms[idx] = e.target.value;
                                  setEditForm({...editForm, rooms: newRooms});
                                }}
                                className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder={`Phòng ${idx + 1}...`}
                              />
                              {editForm.rooms.length > 1 && (
                                <button 
                                  onClick={() => setEditForm({...editForm, rooms: editForm.rooms.filter((_: any, i: number) => i !== idx)})}
                                  className="absolute right-3 top-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2 space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Thành tích & Kinh nghiệm chuyên môn</label>
                          <button 
                            onClick={() => setEditForm({...editForm, achievements: [...editForm.achievements, '']})}
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            + Thêm thành tích
                          </button>
                        </div>
                        <div className="space-y-3">
                          {editForm.achievements.map((ach: string, idx: number) => (
                            <div key={idx} className="relative group">
                              <Sparkles className="absolute left-4 top-3.5 text-slate-400" size={18} />
                              <textarea 
                                value={ach}
                                onChange={(e) => {
                                  const newAchs = [...editForm.achievements];
                                  newAchs[idx] = e.target.value;
                                  setEditForm({...editForm, achievements: newAchs});
                                }}
                                className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all min-h-[80px] resize-none"
                                placeholder={`Thành tích ${idx + 1}...`}
                              />
                              {editForm.achievements.length > 1 && (
                                <button 
                                  onClick={() => setEditForm({...editForm, achievements: editForm.achievements.filter((_: any, i: number) => i !== idx)})}
                                  className="absolute right-3 top-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                  {successVisible ? (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold text-green-500">
                      ✓ Cập nhật thành công!
                    </motion.p>
                  ) : <div />}
                  <button 
                    onClick={handleSave}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Save size={18} /> Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'security' ? (
          <motion.div 
            key="security"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Đổi mật khẩu</h3>
                  <p className="text-xs text-slate-500 mt-1">Đảm bảo tài khoản của bạn được bảo mật bằng mật khẩu mạnh.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Mật khẩu hiện tại</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Xác nhận mật khẩu</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                {successVisible ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold text-green-500">
                    ✓ Mật khẩu đã được thay đổi!
                  </motion.p>
                ) : <div />}
                <button 
                  onClick={handleSave}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                  Cập nhật mật khẩu
                </button>
              </div>
            </div>

            <div className="mt-8 p-6 border border-red-100 bg-red-50/30 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                    <LogOut size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-slate-800">Phiên đăng nhập</h4>
                    <p className="text-xs text-slate-500 mt-1">Đăng xuất khỏi tất cả các thiết bị khác.</p>
                 </div>
               </div>
               <button className="text-xs font-bold text-red-600 hover:underline">Đăng xuất tất cả</button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="payment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            {!isPaymentUnlocked ? (
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-6 text-center max-w-sm mx-auto">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Xác thực bảo mật</h3>
                <p className="text-sm text-slate-500">Vui lòng nhập mã PIN 6 số để truy cập thông tin thanh toán của bạn.</p>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (paymentPin === '123456') {
                      setIsPaymentUnlocked(true);
                      setPaymentPinError(false);
                    } else {
                      setPaymentPinError(true);
                      setTimeout(() => setPaymentPinError(false), 2000);
                    }
                  }}
                  className="space-y-4"
                >
                  <input 
                    type="password" 
                    maxLength={6}
                    value={paymentPin}
                    onChange={(e) => setPaymentPin(e.target.value)}
                    placeholder="Mã PIN 6 số"
                    className={cn(
                      "w-full px-4 py-4 bg-slate-50 border rounded-2xl text-center text-xl tracking-[0.5em] font-black focus:ring-2 focus:ring-primary outline-none transition-all",
                      paymentPinError ? "border-red-500 animate-shake" : "border-slate-200"
                    )}
                  />
                  <button 
                    type="submit"
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Xác nhận
                  </button>
                  {paymentPinError && <p className="text-[10px] text-red-500 font-bold">Mã PIN không chính xác!</p>}
                </form>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-xl font-bold text-slate-800">Thông tin thẻ thanh toán</h3>
                   <p className="text-sm text-slate-500">Thông tin này sẽ được lưu an toàn để thanh toán hóa đơn nhanh chóng.</p>
                </div>
                <div className="w-12 h-12 bg-slate-900 text-primary rounded-2xl flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Họ và tên chủ thẻ</label>
                  <input 
                    type="text" 
                    value={creditCard.name}
                    onChange={(e) => setCreditCard({...creditCard, name: e.target.value})}
                    placeholder="NGUYEN VAN A"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Số thẻ</label>
                  <input 
                    type="text" 
                    value={creditCard.number}
                    onChange={(e) => setCreditCard({...creditCard, number: e.target.value})}
                    placeholder="XXXX XXXX XXXX XXXX"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ngày hết hạn (MM/YY)</label>
                    <input 
                      type="text" 
                      value={creditCard.expiry}
                      onChange={(e) => setCreditCard({...creditCard, expiry: e.target.value})}
                      placeholder="MM/YY"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mã CVV</label>
                    <input 
                      type="password" 
                      value={creditCard.cvv}
                      onChange={(e) => setCreditCard({...creditCard, cvv: e.target.value})}
                      placeholder="***"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Địa chỉ bưu điện</label>
                  <input 
                    type="text" 
                    value={creditCard.address}
                    onChange={(e) => setCreditCard({...creditCard, address: e.target.value})}
                    placeholder="Số nhà, đường..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thành phố</label>
                    <input 
                      type="text" 
                      value={creditCard.city}
                      onChange={(e) => setCreditCard({...creditCard, city: e.target.value})}
                      placeholder="TP. HCM"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mã bưu điện</label>
                    <input 
                      type="text" 
                      value={creditCard.zip}
                      onChange={(e) => setCreditCard({...creditCard, zip: e.target.value})}
                      placeholder="700000"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                {successVisible ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold text-green-500">
                    ✓ Đã lưu thông tin thẻ!
                  </motion.p>
                ) : <div />}
                <button 
                  onClick={handleSaveCard}
                  className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
                >
                  <Save size={18} /> Lưu thông tin thẻ
                </button>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-6 rounded-[2rem] flex items-start gap-4">
               <ShieldCheck className="text-primary mt-1" size={24} />
               <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Bảo mật đa tầng</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">Thông tin của bạn được mã hóa AES-256 và lưu trữ cục bộ. Chúng tôi không bao giờ chia sẻ dữ liệu thanh toán của bạn cho bên thứ ba.</p>
               </div>
            </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
