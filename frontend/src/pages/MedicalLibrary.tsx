import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  BookOpen, 
  Stethoscope, 
  Pill, 
  Activity, 
  ChevronRight, 
  ArrowLeft,
  Bookmark,
  Sparkles,
  Info,
  ClipboardList,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole, type LibraryItem } from '../types';
import { dataService } from '../services/dataService';



export default function MedicalLibrary() {
  const [items, setItems] = useState<LibraryItem[]>([]);

  React.useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await dataService.getArticles();
        const mapped = data.map((a: any) => ({
          id: a.id,
          category: a.category ? (a.category.toUpperCase() === 'DISEASE' || a.category.toUpperCase() === 'TEST' || a.category.toUpperCase() === 'MEDICINE' || a.category.toUpperCase() === 'PROCEDURE' ? a.category.toUpperCase() : 'DISEASE') : 'DISEASE',
          title: a.title,
          description: a.description || (a.content ? a.content.substring(0, 100) + '...' : ''),
          content: a.content || ''
        }));
        setItems(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchArticles();
  }, []);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'DISEASE' | 'TEST' | 'MEDICINE' | 'PROCEDURE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingItem, setViewingItem] = useState<LibraryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<LibraryItem>>({});

  const userRole = localStorage.getItem('userRole') as UserRole;
  const isAdmin = userRole === UserRole.ADMIN;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = async () => {
    if (editForm.title && editForm.category && editForm.content) {
      try {
        if (editForm.id) {
          // await dataService.updateArticle(editForm.id, editForm);
          setItems(prev => prev.map(item => item.id === editForm.id ? { ...item, ...editForm } as LibraryItem : item));
        } else {
          // const newArt = await dataService.createArticle(editForm);
          const newItem: LibraryItem = {
            ...editForm as LibraryItem,
            id: Math.random().toString(36).substr(2, 9),
          };
          setItems(prev => [newItem, ...prev]);
        }
        setIsEditing(false);
        setEditForm({});
        setViewingItem(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      try {
        // await dataService.deleteArticle(id);
        setItems(prev => prev.filter(item => item.id !== id));
        if (viewingItem?.id === id) setViewingItem(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const categories = [
    { id: 'ALL', label: 'Tất cả', icon: BookOpen },
    { id: 'DISEASE', label: 'Bệnh lý', icon: Stethoscope },
    { id: 'TEST', label: 'Xét nghiệm', icon: Activity },
    { id: 'PROCEDURE', label: 'Quy trình', icon: ClipboardList },
    { id: 'MEDICINE', label: 'Thuốc', icon: Pill },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Thư viện Toàn thư</h2>
          <p className="text-slate-500 text-sm">Tra cứu thông tin tin cậy về y khoa, bệnh học và dược phẩm.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => {
                setEditForm({ category: 'DISEASE', title: '', description: '', content: '' });
                setIsEditing(true);
              }}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} /> Thêm bài viết
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all",
              activeCategory === cat.id 
                ? "bg-primary text-slate-900 shadow-lg shadow-primary/20" 
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            )}
          >
            <cat.icon size={18} />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setViewingItem(item)}
              className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full border-b-[6px] border-b-slate-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-2xl",
                  item.category === 'DISEASE' && "bg-rose-50 text-rose-500",
                  item.category === 'TEST' && "bg-blue-50 text-blue-500",
                  item.category === 'MEDICINE' && "bg-emerald-50 text-emerald-500",
                )}>
                  {item.category === 'DISEASE' && <Stethoscope size={20} />}
                  {item.category === 'TEST' && <Activity size={20} />}
                  {item.category === 'MEDICINE' && <Pill size={20} />}
                  {item.category === 'PROCEDURE' && <ClipboardList size={20} />}
                </div>
                {isAdmin && (
                  <button 
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-6 flex-1 italic">
                "{item.description}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đọc chi tiết</span>
                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-slate-900 transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Không tìm thấy nội dung</h3>
          <p className="text-sm text-slate-500 mt-1">Vui lòng thử danh mục khác.</p>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {(viewingItem || isEditing) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
            >
              {isEditing ? (
                <div className="p-8 overflow-y-auto max-h-[90vh] space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-black text-slate-900">{editForm.id ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</h3>
                    <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"><ArrowLeft size={24} /></button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Danh mục</label>
                      <select 
                        value={editForm.category}
                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none"
                      >
                        <option value="DISEASE">Bệnh lý</option>
                        <option value="TEST">Xét nghiệm</option>
                        <option value="PROCEDURE">Quy trình</option>
                        <option value="MEDICINE">Thuốc</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Tiêu đề</label>
                      <input 
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Mô tả ngắn</label>
                      <textarea 
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none h-20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Nội dung chi tiết</label>
                      <textarea 
                        value={editForm.content}
                        onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none h-60"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Hủy</button>
                    <button onClick={handleSave} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200">Lưu thay đổi</button>
                  </div>
                </div>
              ) : viewingItem && (
                <div className="p-8 overflow-y-auto max-h-[90vh]">
                  <div className="absolute top-6 right-6 flex gap-2">
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          setEditForm(viewingItem);
                          setIsEditing(true);
                        }}
                        className="p-2 bg-slate-50 hover:bg-primary/20 text-slate-400 hover:text-primary rounded-full transition-all"
                      >
                        <Edit2 size={20} />
                      </button>
                    )}
                    <button 
                      onClick={() => setViewingItem(null)}
                      className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <ArrowLeft size={24} />
                    </button>
                  </div>

                  <div className="space-y-8 pt-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                        viewingItem.category === 'DISEASE' && "bg-rose-50 text-rose-500",
                        viewingItem.category === 'TEST' && "bg-blue-50 text-blue-500",
                        viewingItem.category === 'MEDICINE' && "bg-emerald-50 text-emerald-500",
                      )}>
                        {viewingItem.category === 'DISEASE' && <Stethoscope size={28} />}
                        {viewingItem.category === 'TEST' && <Activity size={28} />}
                        {viewingItem.category === 'MEDICINE' && <Pill size={28} />}
                      </div>
                      <div>
                        <div className="flex gap-2 mb-1">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/10 rounded-full">
                            {viewingItem.category}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">{viewingItem.title}</h3>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-start gap-4">
                      <Info size={20} className="text-primary mt-1 shrink-0" />
                      <p className="text-slate-600 italic leading-relaxed">
                        {viewingItem.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Nội dung chi tiết</h4>
                      <div className="text-slate-700 leading-loose text-lg whitespace-pre-wrap font-medium">
                        {viewingItem.content}
                      </div>
                    </div>


                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
