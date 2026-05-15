import { useEffect, useState } from 'react';
import { BookOpen, Users, ArrowRight, LayoutList, Search, Sparkles, Tag, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';

const CoursesStudent = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state (Opsional, tapi bagus untuk UX)
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'REGULAR' | 'PROJECT_BASED'

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await api.get('/courses');
        const data = response.data.data;
        setCourses(data.courses || data || []);
      } catch (error) {
        console.error("Gagal mengambil data katalog", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Logika Filter
  const filteredCourses = courses.filter(course => {
    if (filter === 'ALL') return true;
    return course.type === filter;
  });

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center">
      <span className="loading loading-spinner loading-lg text-blue-600"></span>
      <p className="mt-4 text-slate-500 font-medium animate-pulse">Menyiapkan materi terbaik buat lo...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto font-sans pb-20 pt-2 px-4">
      
      {/* 🔥 Modern Hero Header */}
      <div className="relative mb-12 rounded-[2rem] overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-8 md:p-14 shadow-xl shadow-blue-200/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} className="text-yellow-300" /> Katalog Materi Terupdate
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
              Ayo bantai <span className="text-blue-200">skill baru</span> hari ini! 🚀
            </h1>
            <p className="text-blue-100 text-lg md:text-xl font-medium max-w-xl">
              Pilih kelas reguler untuk fundamental gratis, atau sikat kelas Project-Based untuk bangun portofolio aslimu.
            </p>
          </div>
          
          <div className="hidden lg:block w-72 h-72 relative">
             <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 rotate-6 translate-x-4"></div>
             <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 -rotate-3 translate-y-2"></div>
             <div className="absolute inset-0 bg-blue-500 rounded-3xl shadow-2xl flex items-center justify-center border border-white/30 transform transition-transform hover:scale-105 duration-500">
                <BookOpen size={100} className="text-white" strokeWidth={1} />
             </div>
          </div>
        </div>
      </div>

      {/* Filter & Info Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mr-2 hidden md:block">Katalog</h2>
          
          {/* TAB FILTER FREEMIUM */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'ALL' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Semua Kelas
            </button>
            <button 
              onClick={() => setFilter('REGULAR')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${filter === 'REGULAR' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Tag size={14}/> Gratis
            </button>
            <button 
              onClick={() => setFilter('PROJECT_BASED')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${filter === 'PROJECT_BASED' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Sparkles size={14}/> Project-Based
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari kelas..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-medium text-sm w-full sm:w-48 md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Jika Belum Ada Kelas (Berdasarkan filter) */}
      {filteredCourses.length === 0 && (
        <div className="bg-white border border-slate-200 p-20 rounded-[2.5rem] text-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={40} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Kategori Ini Masih Kosong!</h2>
          <p className="text-slate-500 font-medium">Belum ada kelas yang dirilis untuk filter yang kamu pilih.</p>
        </div>
      )}

      {/* 🔥 Modern Grid Cards (Clean & Premium) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => {
          const totalBab = course._count?.chapters || course.chapters?.length || 0;
          const totalMhs = course._count?.enrollments || 0;

          // Format harga rupiah
          const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(course.price || 0);

          return (
            <div 
              key={course.id} 
              className={`group bg-white rounded-[2rem] border overflow-hidden hover:-translate-y-2 transition-all duration-300 flex flex-col h-full ${course.type === 'PROJECT_BASED' ? 'border-amber-200 hover:shadow-2xl hover:shadow-amber-900/10' : 'border-slate-200 hover:shadow-2xl hover:shadow-blue-900/10'}`}
            >
              {/* Thumbnail / Header area */}
              <div className={`h-48 relative overflow-hidden flex items-center justify-center transition-colors ${course.type === 'PROJECT_BASED' ? 'bg-amber-50 group-hover:bg-amber-100/50' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                
                <div className={`relative z-10 w-20 h-20 bg-white rounded-2xl shadow-lg border flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 ${course.type === 'PROJECT_BASED' ? 'border-amber-100' : 'border-slate-100'}`}>
                  <BookOpen size={36} className={course.type === 'PROJECT_BASED' ? 'text-amber-500' : 'text-blue-600'} strokeWidth={2} />
                </div>
                
                {/* 🔥 BADGE FREEMIUM */}
                {course.type === 'PROJECT_BASED' ? (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700 shadow-sm">
                    <Sparkles size={12} className="text-amber-500" /> Project-Based
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 shadow-sm">
                    <Tag size={12} className="text-emerald-500" /> Gratis
                  </div>
                )}
              </div>
              
              {/* Content area */}
              <div className="p-8 flex-1 flex flex-col">
                <h2 className={`text-xl font-bold leading-tight mb-3 line-clamp-2 transition-colors ${course.type === 'PROJECT_BASED' ? 'text-slate-800 group-hover:text-amber-600' : 'text-slate-800 group-hover:text-blue-600'}`}>
                  {course.title}
                </h2>
                
                <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-3 mb-6 flex-1">
                  {course.description || "Mulai petualangan belajar lo di sini. Klik selengkapnya buat cek silabus lengkap."}
                </p>

                {/* 🔥 INFO HARGA (MUNCUL JIKA PROJECT BASED) */}
                {course.type === 'PROJECT_BASED' && (
                  <div className="mb-4 pt-2 border-t border-slate-50 flex items-center gap-2">
                    <DollarSign size={18} className="text-amber-500"/>
                    <span className="text-lg font-black text-slate-800">{formattedPrice}</span>
                  </div>
                )}
                
                {/* Info Badges */}
                <div className={`flex items-center gap-4 mt-auto border-t pt-6 ${course.type === 'PROJECT_BASED' && !course.price ? 'border-slate-50' : course.type === 'PROJECT_BASED' ? 'border-transparent pt-2' : 'border-slate-50'}`}>
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${course.type === 'PROJECT_BASED' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      <LayoutList size={16} />
                    </div>
                    {totalBab} Bab
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Users size={16} />
                    </div>
                    {totalMhs} Mahasiswa
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-8 pb-8">
                <Link 
                  to={`/courses/${course.id}`} 
                  className={`w-full text-white p-4 rounded-xl font-bold text-sm uppercase transition-all flex items-center justify-center gap-2 tracking-widest shadow-lg ${course.type === 'PROJECT_BASED' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-slate-900 hover:bg-blue-600 shadow-slate-900/10 hover:shadow-blue-600/20'}`}
                >
                  Buka Silabus <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default CoursesStudent;