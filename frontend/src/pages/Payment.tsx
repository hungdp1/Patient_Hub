import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Receipt,
  CircleDollarSign,
  History,
  QrCode,
  X,
  User,
  Calendar,
  ChevronRight,
  Lock
} from 'lucide-react';

import { ExamStatus, type MedicalExam, type PaymentHistoryItem, type PaymentMethodType } from '../types';
import { cn } from '../lib/utils';
import { dataService } from '../services/dataService';



export default function Payment() {
  const [pendingExams, setPendingExams] = useState<MedicalExam[]>([]);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('QR_CODE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingBill, setViewingBill] = useState<PaymentHistoryItem | null>(null);
  const [showQRPortal, setShowQRPortal] = useState(false);
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyData, pendingData] = await Promise.all([
          dataService.getPayments(),
          dataService.getPendingInvoices().catch(() => [])
        ]);
        
        const mappedHistory: PaymentHistoryItem[] = historyData.map((pay: any) => ({
          id: pay.id,
          date: new Date(pay.date || pay.createdAt || new Date()).toLocaleString('vi-VN'),
          totalAmount: pay.amount || 0,
          method: pay.method === 'CREDIT_CARD' ? 'CARD' : 'QR_CODE',
          items: [{ id: pay.recordId || '1', name: 'Dịch vụ y tế', price: pay.amount || 0 }],
          status: pay.status === 'COMPLETED' ? 'SUCCESS' : 'PENDING'
        }));
        setHistory(mappedHistory);

        const mappedExams = pendingData.map((e: any) => ({
          id: e.id,
          name: e.name || 'Dịch vụ khám bệnh',
          date: e.date || new Date().toISOString(),
          price: e.price || 150000,
          status: e.status || ExamStatus.PENDING,
          room: e.room || 'Phòng chờ',
          estimatedDuration: 0,
          currentWaitTime: 0,
          order: 0
        }));
        setPendingExams(mappedExams);
        setSelectedExams(mappedExams.filter((e: any) => e.status !== ExamStatus.COMPLETED).map((e: any) => e.id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [showPinError, setShowPinError] = useState(false);

  const savedCard = JSON.parse(localStorage.getItem('creditCard') || 'null');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') { // Default PIN for demo
      setIsUnlocked(true);
      setShowPinError(false);
    } else {
      setShowPinError(true);
      setTimeout(() => setShowPinError(false), 2000);
    }
  };

  const toggleExam = (id: string) => {
    setSelectedExams(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedTotal = pendingExams
    .filter(e => selectedExams.includes(e.id))
    .reduce((sum, e) => sum + e.price, 0);

  const handlePayment = async () => {
    if (selectedExams.length === 0) return;
    
    if (paymentMethod === 'CARD' && !isUnlocked) {
      alert('Vui lòng mở khóa thẻ trước khi thanh toán.');
      return;
    }

    if (paymentMethod === 'QR_CODE') {
      setShowQRPortal(true);
      return;
    }

    setIsProcessing(true);
    try {
      await dataService.createPayment({
        patientId: 'patient123',
        recordId: 'record123',
        amount: selectedTotal,
        method: 'CREDIT_CARD',
        status: 'COMPLETED',
        date: new Date().toISOString()
      });
      setIsProcessing(false);
      setIsSuccess(true);
    } catch(err) {
      console.error(err);
      setIsProcessing(false);
      alert('Thanh toán thất bại');
    }
  };

  const finalizeQR = async () => {
    setIsProcessing(true);
    try {
      await dataService.createPayment({
        patientId: 'patient123',
        recordId: 'record123',
        amount: selectedTotal,
        method: 'CASH', // or QR if API supports
        status: 'COMPLETED',
        date: new Date().toISOString()
      });
      setShowQRPortal(false);
      setIsProcessing(false);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  if (showQRPortal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          <button 
            onClick={() => setShowQRPortal(false)}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="text-center space-y-6 pt-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">Cổng thanh toán QR</h3>
              <p className="text-sm text-slate-500">Mở ứng dụng Ngân hàng của bạn để quét mã</p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 flex items-center justify-center relative group">
              <QrCode size={180} className="text-slate-800 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Quét ngay</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-slate-500">Tổng tiền thanh toán</span>
                <span className="font-bold text-primary text-lg">{selectedTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span>Mã đơn hàng</span>
                <span>MF-{Math.floor(Math.random() * 90000) + 10000}</span>
              </div>
            </div>

            <button 
              onClick={finalizeQR}
              disabled={isProcessing}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "Xác nhận đã chuyển khoản"
              )}
            </button>
            <p className="text-[10px] text-slate-400">Hệ thống sẽ tự động xác nhận sau 1-2 phút</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-3xl font-bold text-slate-800">Thanh toán thành công!</h2>
        <p className="text-slate-500 leading-relaxed">
          Cảm ơn bạn đã sử dụng dịch vụ tại Mediflow. <br />
          Hóa đơn điện tử đã được gửi tới ứng dụng và email của bạn.
        </p>
        <div className="w-full bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
           <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Mã giao dịch</span>
              <span className="font-bold text-slate-800">#MF-99201-X</span>
           </div>
           <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Thời gian</span>
              <span className="font-bold text-slate-800">{new Date().toLocaleString('vi-VN')}</span>
           </div>
           <div className="h-px bg-slate-100 w-full"></div>
           <div className="flex justify-between items-center font-bold">
              <span className="text-slate-800">Tổng cộng</span>
              <span className="text-primary">{selectedTotal.toLocaleString('vi-VN')}đ</span>
           </div>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold w-full max-w-xs hover:bg-slate-800 transition-all"
        >
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Patient Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Thanh toán & Hóa đơn</h2>
          <p className="text-slate-500 text-sm">Quản lý các khoản phí y tế và lịch sử giao dịch một cách an toàn.</p>
        </div>
        <div className="flex items-center gap-3">
          {showHistory ? (
            <button 
              onClick={() => setShowHistory(false)}
              className="px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 bg-slate-900 text-white shadow-lg shadow-slate-200 transition-all"
            >
              <ArrowRight size={18} className="rotate-180" />
              Quay lại thanh toán
            </button>
          ) : (
            <button 
              onClick={() => setShowHistory(true)}
              className="px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              <History size={18} />
              Lịch sử hóa đơn
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Bệnh nhân', value: 'Nguyễn Văn A', icon: User },
          { label: 'Mã hồ sơ', value: 'BN2024-0511', icon: Receipt },
          { label: 'Ngày sinh', value: '15/05/1990', icon: Calendar },
        ].map((info, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <info.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{info.label}</p>
              <p className="text-sm font-bold text-slate-800">{info.value}</p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {showHistory ? (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                  Lịch sử thanh toán gần đây
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {history.map((bill) => (
                  <div key={bill.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{bill.id}</p>
                        <p className="text-xs text-slate-400 font-medium">{bill.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="text-right hidden md:block">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Phương thức</p>
                          <p className="text-xs font-bold text-slate-600">{bill.method === 'CARD' ? 'Thẻ tín dụng' : 'Mã QR'}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-lg font-black text-slate-800">{bill.totalAmount.toLocaleString('vi-VN')}đ</p>
                          <button 
                            onClick={() => setViewingBill(bill)}
                            className="text-xs font-bold text-primary hover:underline underline-offset-4"
                          >
                            Xem chi tiết
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-12 gap-8"
          >
            {/* Left Column: Selection */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden border-b-[6px] border-b-primary/20">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Receipt className="text-primary" size={18} /> Danh sách chỉ định thanh toán
                  </h3>
                  <span className="text-xs font-bold text-slate-400">{selectedExams.length} dịch vụ được chọn</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {pendingExams.map((exam) => (
                    <div 
                      key={exam.id}
                      onClick={() => toggleExam(exam.id)}
                      className={cn(
                        "p-6 flex items-center gap-4 cursor-pointer transition-all hover:bg-slate-50",
                        selectedExams.includes(exam.id) ? "bg-primary/5" : "opacity-70"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                        selectedExams.includes(exam.id) ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-slate-300 bg-white"
                      )}>
                        {selectedExams.includes(exam.id) && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 mb-0.5">{exam.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{exam.room}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{exam.price.toLocaleString('vi-VN')}đ</p>
                        {exam.status === ExamStatus.COMPLETED ? (
                          <span className="text-[10px] font-bold text-green-500">Đã xong</span>
                        ) : (
                          <span className="text-[10px] font-bold text-orange-500">Chờ khám</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Summary */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8 sticky top-6">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest border-b border-slate-100 pb-4">Chi tiết thanh toán</h3>
                
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Phương thức thanh toán</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'CARD', label: 'Thẻ tín dụng', icon: CreditCard },
                      { id: 'QR_CODE', label: 'Mã QR Ngân hàng', icon: QrCode },
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as PaymentMethodType)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-5 rounded-3xl border-2 transition-all text-center relative overflow-hidden",
                          paymentMethod === method.id 
                            ? "border-primary bg-primary/5 text-primary shadow-sm" 
                            : "border-slate-100 text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        {paymentMethod === method.id && (
                          <motion.div 
                            layoutId="activeMethod"
                            className="absolute inset-0 bg-primary/5"
                          />
                        )}
                        <method.icon size={24} />
                        <span className="text-[10px] font-bold leading-tight">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {paymentMethod === 'CARD' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 border-t border-slate-100 overflow-hidden"
                    >
                      {!isUnlocked ? (
                        <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 space-y-4">
                          <div className="flex items-center gap-3 text-slate-800">
                             <Lock size={20} className="text-primary" />
                             <h4 className="text-sm font-bold">Yêu cầu Khóa bảo vệ</h4>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">Nhập mã PIN (1234) để truy xuất thông tin thẻ đã lưu của bạn.</p>
                          <form onSubmit={handleUnlock} className="space-y-3">
                             <input 
                              type="password" 
                              maxLength={4}
                              value={pin}
                              onChange={(e) => setPin(e.target.value)}
                              placeholder="Mã PIN 4 số"
                              className={cn(
                                "w-full px-4 py-3 bg-white border rounded-xl text-center text-lg tracking-[0.5em] font-black focus:ring-2 focus:ring-primary outline-none transition-all",
                                showPinError ? "border-red-500 animate-shake" : "border-slate-200"
                              )}
                             />
                             <button 
                              type="submit"
                              className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md"
                             >
                               Xác nhận mở khóa
                             </button>
                             {showPinError && <p className="text-[10px] text-red-500 font-bold text-center">Mã PIN không chính xác!</p>}
                          </form>
                        </div>
                      ) : (
                        <div className="space-y-4">
                           <div className="p-4 bg-slate-900 rounded-2xl text-white relative overflow-hidden group shadow-lg">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -mr-12 -mt-12 blur-xl" />
                              <div className="relative z-10 space-y-4">
                                 <div className="flex justify-between items-center">
                                    <div className="flex gap-1">
                                       <div className="w-8 h-5 bg-white/20 rounded-sm" />
                                       <div className="w-8 h-5 bg-white/10 rounded-sm" />
                                    </div>
                                    <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-widest">Visa Platinum</span>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-sm font-mono tracking-widest">
                                       {savedCard ? `**** **** **** ${savedCard.number.slice(-4)}` : '**** **** **** ****'}
                                    </p>
                                    <p className="text-[8px] font-bold opacity-50 uppercase tracking-[0.2em]">{savedCard?.name || 'CHUA CO THONG TIN'}</p>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center justify-between px-2">
                              <p className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                                 <ShieldCheck size={12} /> Đã kết nối thẻ an toàn
                              </p>
                              <button 
                                onClick={() => setIsUnlocked(false)}
                                className="text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest"
                              >
                                Khóa lại
                              </button>
                           </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>Tạm tính</span>
                    <span className="font-bold text-slate-800">{selectedTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>Phí giao dịch (0%)</span>
                    <span className="font-bold text-green-600">Miễn phí</span>
                  </div>
                  <div className="h-px bg-slate-100 w-full"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Tổng cộng</span>
                    <span className="text-2xl font-black text-primary">{selectedTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <button 
                  disabled={selectedExams.length === 0 || isProcessing}
                  onClick={handlePayment}
                  className={cn(
                    "w-full py-5 rounded-3xl font-bold flex items-center justify-center gap-2 transition-all",
                    isProcessing ? "bg-slate-200 text-slate-400" : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Xác nhận thanh toán
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 justify-center py-2">
                  <ShieldCheck size={14} className="text-green-500" />
                  <p className="text-[10px] text-slate-400 font-medium tracking-wide first-letter:uppercase">Thanh toán an toàn bởi Mediflow-Security</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bill Detail Modal */}
      <AnimatePresence>
        {viewingBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setViewingBill(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Receipt size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Chi tiết hóa đơn</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{viewingBill.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Thời gian</p>
                      <p className="text-sm font-bold text-slate-800">{viewingBill.date}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Hình thức</p>
                      <p className="text-sm font-bold text-slate-800">{viewingBill.method === 'CARD' ? 'Thẻ tín dụng' : 'Chuyển khoản QR'}</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dịch vụ đã dùng</p>
                  <div className="space-y-3">
                    {viewingBill.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-sm font-medium text-slate-700">{item.name}</span>
                        <span className="text-sm font-bold text-slate-900">{item.price.toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                  <span className="text-lg font-bold text-slate-800">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-primary">{viewingBill.totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>

                <button 
                  onClick={() => setViewingBill(null)}
                  className="w-full py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
