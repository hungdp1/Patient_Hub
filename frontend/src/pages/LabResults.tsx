import React, { useState } from 'react';
import { 
  FlaskConical, 
  Search, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  ClipboardList,
  User,
  Plus,
  Trash2,
  FileText,
  Save,
  ArrowRight,
  Stethoscope,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

import { dataService } from '../services/dataService';

interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  tests: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  urgency: 'NORMAL' | 'URGENT';
}



export default function LabResults() {
  const [orders, setOrders] = useState<LabOrder[]>([]);

  React.useEffect(() => {
    const fetchLabOrders = async () => {
      try {
        const data = await dataService.getLabResults();
        const mappedOrders: LabOrder[] = data.map((lab: any) => ({
          id: lab.id,
          patientId: lab.patientId || 'BN-100',
          patientName: 'Bệnh nhân ' + (lab.patientId || '').substring(0, 4),
          doctorName: 'BS. ' + (lab.doctorId || '').substring(0, 4),
          date: new Date(lab.date || lab.createdAt || new Date()).toLocaleDateString('vi-VN'),
          tests: lab.testName ? lab.testName.split(',') : ['Xét nghiệm máu'],
          status: lab.status === 'COMPLETED' ? 'COMPLETED' : lab.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'PENDING',
          urgency: 'NORMAL'
        }));
        setOrders(mappedOrders);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLabOrders();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const filteredOrders = orders.filter(o => 
    o.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectOrder = (order: LabOrder) => {
    setSelectedOrder(order);
    
    if (order.status === 'PENDING') {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'IN_PROGRESS' } : o));
    }

    // If it has results already (simulated here by initialized results)
    // In a real app, we'd fetch these from the patient's document
    setResults(order.tests.map(t => ({
      name: t,
      items: [
        { name: 'Xét nghiệm ' + t, value: order.status === 'COMPLETED' ? 'Kết quả mẫu' : '', unit: 'đv', range: 'Tham chiếu', status: 'NORMAL' }
      ]
    })));
  };

  const handleAddItem = (testIdx: number) => {
    const newResults = [...results];
    newResults[testIdx].items.push({ name: '', value: '', unit: '', range: '', status: 'NORMAL' });
    setResults(newResults);
  };

  const handleRemoveItem = (testIdx: number, itemIdx: number) => {
    const newResults = [...results];
    newResults[testIdx].items = newResults[testIdx].items.filter((_: any, i: number) => i !== itemIdx);
    setResults(newResults);
  };

  const handleUpdateItem = (testIdx: number, itemIdx: number, field: string, value: string) => {
    const newResults = [...results];
    newResults[testIdx].items[itemIdx][field] = value;
    setResults(newResults);
  };

  const handleSaveToRecord = async () => {
    if (!selectedOrder) return;
    try {
      const resultStr = results.map(r => r.items.map((i: any) => `${i.name}: ${i.value} ${i.unit}`).join(', ')).join(' | ');
      await dataService.updateLabResult(selectedOrder.id, { 
        status: 'COMPLETED',
        result: resultStr
      });
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'COMPLETED' } : o));
      alert('Kết quả xét nghiệm đã được lưu thành công.');
    } catch(err) {
      console.error(err);
      alert('Lỗi lưu kết quả');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FlaskConical className="text-primary" size={32} /> 
            Xử lý Xét nghiệm
          </h2>
          <p className="text-slate-500 font-medium mt-1">Hệ thống nhập liệu và cập nhật kết quả tập trung</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm self-start md:self-auto">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Chờ</span>
              <span className="text-lg font-black text-primary leading-none">{orders.filter(o => o.status === 'PENDING').length}</span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Xong</span>
              <span className="text-lg font-black text-emerald-500 leading-none">{orders.filter(o => o.status === 'COMPLETED').length}</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Orders List Component */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ClipboardList size={16} /> Danh sách yêu cầu
            </h3>
            <div className="relative w-full max-w-xs group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm bệnh nhân..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.length === 0 ? (
              <div className="col-span-full py-10 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">Không tìm thấy hồ sơ phù hợp</p>
              </div>
            ) : (
              filteredOrders.map(order => (
                <motion.div 
                  key={order.id}
                  layoutId={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={cn(
                    "p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group",
                    selectedOrder?.id === order.id 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl ring-4 ring-primary/10" 
                      : "bg-white border-slate-200 hover:border-primary/50 hover:shadow-md"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all",
                        selectedOrder?.id === order.id ? "bg-white/10 text-white" : "bg-primary/5 text-primary"
                      )}>
                        {order.patientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{order.patientName}</p>
                        <p className={cn(
                          "text-[10px] font-medium uppercase tracking-tighter",
                          selectedOrder?.id === order.id ? "text-white/40" : "text-slate-400"
                        )}>{order.patientId}</p>
                      </div>
                    </div>
                    {order.urgency === 'URGENT' && (
                      <span className="bg-rose-500/10 text-rose-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse border border-rose-500/20">Khẩn</span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-1.5 flex-wrap">
                    {order.tests.slice(0, 2).map((t, i) => (
                      <span key={i} className={cn("text-[9px] font-bold px-2 py-0.5 rounded", selectedOrder?.id === order.id ? "bg-white/5 text-white/60" : "bg-slate-50 text-slate-500")}>{t}</span>
                    ))}
                    {order.tests.length > 2 && <span className="text-[9px] font-bold text-slate-400">+{order.tests.length - 2}</span>}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Processing Details - Vertical Flow */}
        <AnimatePresence mode="wait">
          {selectedOrder && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              key={selectedOrder.id}
              className="space-y-6"
            >
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                {/* Order Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                       <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{selectedOrder.patientName}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedOrder.patientId} • Bác sĩ chỉ định: <span className="text-primary">{selectedOrder.doctorName}</span></p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all text-xs font-bold border border-slate-100"
                  >
                    <ChevronLeft size={16} /> Đóng
                  </button>
                </div>

                {/* Input Area - LIST FORMAT */}
                <div className="p-8 space-y-10">
                   {results.map((test, testIdx) => (
                     <div key={testIdx} className="space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                                 <Activity size={16} />
                              </div>
                              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{test.name}</h4>
                           </div>
                           <button 
                              onClick={() => handleAddItem(testIdx)}
                              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                           >
                              <Plus size={18} />
                           </button>
                        </div>

                        <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-4">
                           {/* Custom List-style Inputs */}
                           <div className="grid grid-cols-12 gap-4 px-4 hidden md:flex items-center">
                              <div className="col-span-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chỉ số xét nghiệm</div>
                              <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Kết quả</div>
                              <div className="col-span-1 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Đ.vị</div>
                              <div className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Tham chiếu</div>
                              <div className="col-span-1 border-l-0" />
                           </div>

                           <div className="space-y-3">
                              {test.items.map((item: any, itemIdx: number) => (
                                <motion.div 
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  key={itemIdx} 
                                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white p-3 rounded-2xl border border-slate-200 hover:shadow-lg hover:border-primary/30 transition-all group"
                                >
                                   <div className="md:col-span-5">
                                      <input 
                                        type="text" 
                                        placeholder="Tên chỉ số..."
                                        value={item.name}
                                        onChange={(e) => handleUpdateItem(testIdx, itemIdx, 'name', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 text-sm font-bold transition-all placeholder:text-slate-300"
                                      />
                                   </div>
                                   <div className="md:col-span-2">
                                      <input 
                                        type="text" 
                                        placeholder="0.0"
                                        value={item.value}
                                        onChange={(e) => handleUpdateItem(testIdx, itemIdx, 'value', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 text-center text-sm font-black text-primary transition-all placeholder:text-slate-300"
                                      />
                                   </div>
                                   <div className="md:col-span-1">
                                      <input 
                                        type="text" 
                                        placeholder="Un"
                                        value={item.unit}
                                        onChange={(e) => handleUpdateItem(testIdx, itemIdx, 'unit', e.target.value)}
                                        className="w-full px-2 py-2.5 rounded-xl border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 text-center text-xs font-bold text-slate-500 transition-all placeholder:text-slate-300"
                                      />
                                   </div>
                                   <div className="md:col-span-3 lg:pl-4">
                                      <input 
                                        type="text" 
                                        placeholder="Mức tham chiếu..."
                                        value={item.range}
                                        onChange={(e) => handleUpdateItem(testIdx, itemIdx, 'range', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 text-xs font-medium text-slate-400 italic transition-all placeholder:text-slate-200"
                                      />
                                   </div>
                                   <div className="md:col-span-1 flex justify-center">
                                      <button 
                                        onClick={() => handleRemoveItem(testIdx, itemIdx)}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                      >
                                         <Trash2 size={16} />
                                      </button>
                                   </div>
                                </motion.div>
                              ))}
                           </div>
                        </div>
                     </div>
                   ))}

                   <div className="pt-8 border-t border-slate-100">
                      <div className="space-y-3">
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={16} className="text-primary" /> Kết luận & Ghi chú
                         </h5>
                         <textarea 
                           placeholder="Nhập kết luận chuyên môn..."
                           className="w-full h-32 bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all resize-none shadow-inner leading-relaxed"
                         />
                      </div>
                   </div>
                </div>

                <div className="px-8 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                   <div className="mr-auto hidden md:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                         <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                         </span>
                         Dữ liệu tự động đồng bộ hóa
                      </p>
                   </div>
                   <button 
                     onClick={handleSaveToRecord}
                     className="px-10 py-4 bg-primary text-slate-900 rounded-2xl text-sm font-black hover:bg-slate-900 hover:text-white transition-all shadow-lg flex items-center gap-3 active:scale-95"
                   >
                      <Save size={20} /> Lưu Kết quả
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
