import { useEffect, useState } from 'react';
import { BookOpen, Users, ArrowRight, LayoutList, Search, Sparkles, Tag, DollarSign, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';

const CoursesStudent = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'REGULAR' | 'PROJECT_BASED'
  const [searchQuery, setSearchQuery] = useState('');

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

  // Logika Filter & Pencarian
  const filteredCourses = courses.filter(course => {
    const matchFilter = filter === 'ALL' || course.type === filter;
    const matchSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center">
      <span className="loading loading-spinner loading-lg text-blue-600"></span>
      <p className="mt-4 text-slate-500 font-medium animate-pulse">Menyiapkan katalog kelas...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto font-sans pb-24 pt-2 text-slate-800">
      
      {/* ================================================= */}
      {/* 1. HERO BANNER (Gaya Premium SaaS Gelap)          */}
      {/* ================================================= */}
      <div className="relative mb-10 p-8 md:p-12 rounded-2xl bg-slate-900 overflow-hidden shadow-xl shadow-slate-900/10 border border-slate-800 group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full -mr-20 -mt-20 blur-[120px] opacity-30 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500 rounded-full -ml-20 -mb-20 blur-[100px] opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-blue-300 text-[10px] font-black uppercase tracking-widest mb-4">
              <Compass size={12} className="text-amber-400" /> Katalog Materi Terupdate
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              Ayo bantai <span className="text-blue-400">skill baru</span> hari ini! 🚀
            </h1>
            <p className="text-slate-400 text-base md:text-lg font-medium max-w-xl">
              Pilih kelas reguler untuk fundamental gratis, atau sikat kelas Project-Based untuk bangun portofolio aslimu.
            </p>
          </div>
          
          <div className="hidden lg:block relative shrink-0">
             <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center border border-white/10 transform transition-transform group-hover:scale-105 group-hover:-rotate-3 duration-500">
                <BookOpen size={80} className="text-white opacity-90" strokeWidth={1.5} />
             </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* 2. FILTER & SEARCH BAR (Clean UI)                 */}
      {/* ================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          
          {/* TAB FILTER FREEMIUM */}
          <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
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
        
        <div className="w-full md:w-auto shrink-0">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama kelas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-sm w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* 3. EMPTY STATE                                    */}
      {/* ================================================= */}
      {filteredCourses.length === 0 && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 py-20 px-6 rounded-2xl text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
            <Search size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Tidak Ditemukan</h2>
          <p className="text-slate-500 font-medium text-sm">Tidak ada kelas yang cocok dengan filter atau pencarianmu.</p>
        </div>
      )}

      {/* ================================================= */}
      {/* 4. GRID CARDS MATERI                              */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const totalBab = course._count?.chapters || course.chapters?.length || 0;
          const totalMhs = course._count?.enrollments || 0;
          const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(course.price || 0);

          return (
            <div 
              key={course.id} 
              className={`group bg-white rounded-2xl border overflow-hidden hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full ${course.type === 'PROJECT_BASED' ? 'border-amber-200 hover:shadow-xl hover:shadow-amber-900/10' : 'border-slate-200 hover:shadow-xl hover:shadow-slate-900/5'}`}
            >
              {/* Thumbnail / Header Area */}
              <div className={`h-44 relative overflow-hidden flex items-center justify-center transition-colors border-b ${course.type === 'PROJECT_BASED' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                    <div className={`relative z-10 w-16 h-16 bg-white rounded-xl shadow-md border flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 ${course.type === 'PROJECT_BASED' ? 'border-amber-100' : 'border-slate-100'}`}>
                      <BookOpen size={28} className={course.type === 'PROJECT_BASED' ? 'text-amber-500' : 'text-blue-600'} strokeWidth={2} />
                    </div>
                  </>
                )}
                
                {/* Overlay Hitam Halus agar Badge terbaca */}
                {course.thumbnail_url && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                )}

                {/* Badge Freemium */}
                {course.type === 'PROJECT_BASED' ? (
                  <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-amber-200 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700 shadow-sm">
                    <Sparkles size={12} className="text-amber-500" /> Premium
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-emerald-200 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 shadow-sm">
                    <Tag size={12} className="text-emerald-500" /> Gratis
                  </div>
                )}
              </div>
              
              {/* Content Area */}
              <div className="p-6 flex-1 flex flex-col">
                <h2 className={`text-lg font-bold leading-snug mb-2 line-clamp-2 transition-colors ${course.type === 'PROJECT_BASED' ? 'text-slate-800 group-hover:text-amber-600' : 'text-slate-800 group-hover:text-blue-600'}`}>
                  {course.title}
                </h2>
                
                <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-2 mb-6 flex-1">
                  {course.description || "Mulai petualangan belajar lo di sini. Klik untuk cek silabus lengkap."}
                </p>

                {/* Info Harga (Khusus Project Based) */}
                {course.type === 'PROJECT_BASED' && (
                  <div className="mb-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <DollarSign size={16} />
                    </div>
                    <span className="text-lg font-black text-slate-800">{formattedPrice}</span>
                  </div>
                )}
                
                {/* Info Badges (Bab & Siswa) */}
                <div className={`flex items-center gap-4 mt-auto pt-4 ${course.type === 'PROJECT_BASED' ? 'border-t border-slate-100' : 'border-t border-slate-100'}`}>
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${course.type === 'PROJECT_BASED' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      <LayoutList size={14} />
                    </div>
                    {totalBab} Bab
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                    <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Users size={14} />
                    </div>
                    {totalMhs} Mahasiswa
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-6 pb-6">
                <Link 
                  to={`/courses/${course.id}`} 
                  className={`w-full text-white p-3.5 rounded-xl font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 tracking-widest shadow-md ${course.type === 'PROJECT_BASED' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-slate-900 hover:bg-blue-600 shadow-slate-900/10 hover:shadow-blue-600/20'}`}
                >
                  Buka Silabus <ArrowRight size={16} />
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