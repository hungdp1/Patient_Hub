import React, { useState } from 'react';
import { 
  Stethoscope, 
  Settings, 
  Activity, 
  Search,
  ChevronRight,
  Clock,
  CircleDollarSign,
  Info,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { dataService } from '../services/dataService';

interface HospitalService {
  id: string;
  name: string;
  category: string;
  price: string;
  duration: string;
  description: string;
  icon: any;
}

export default function HospitalServices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'clinic' | 'lab' | 'imaging'>('all');

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'clinic', label: 'Khám lâm sàng' },
    { id: 'lab', label: 'Xét nghiệm' },
    { id: 'imaging', label: 'Chẩn đoán hình ảnh' },
  ];

  const [services, setServices] = useState<HospitalService[]>([]);

  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await dataService.getServices();
        const mapped = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          category: s.category ? (s.category.toLowerCase().includes('lab') ? 'lab' : s.category.toLowerCase().includes('clinic') ? 'clinic' : 'imaging') : 'clinic',
          price: (s.price || 0).toLocaleString('vi-VN') + ' VND',
          duration: s.duration + ' phút',
          description: s.description || '',
          icon: s.category?.toLowerCase().includes('lab') ? Activity : s.category?.toLowerCase().includes('imaging') ? Settings : Stethoscope
        }));
        setServices(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dịch vụ bệnh viện</h1>
          <p className="text-slate-500 mt-2">Danh mục các dịch vụ khám chữa bệnh và bảng giá tham khảo.</p>
        </div>
        
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
              selectedCategory === cat.id 
                ? "bg-primary text-slate-800 shadow-lg shadow-primary/20" 
                : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service, idx) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-slate-50 text-slate-800 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-primary/20 group-hover:text-slate-900 border border-slate-100">
                <service.icon size={26} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Giá từ</p>
                <p className="text-sm font-bold text-slate-800">{service.price}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2 truncate group-hover:text-primary transition-colors">{service.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1 line-clamp-3 italic">
              "{service.description}"
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock size={14} />
                  <span className="text-[10px] font-bold uppercase">{service.duration}</span>
                </div>
              </div>
              <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                <Calendar size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <Search size={32} />
          </div>
          <p className="text-slate-500 font-medium">Không tìm thấy dịch vụ nào phù hợp.</p>
        </div>
      )}
    </div>
  );
}
