import { useEffect, useState } from 'react';
import { 
  BookOpen, Users, ArrowRight, LayoutList, Tag, Sparkles, 
  Globe, Lock, FileEdit, CheckCircle2, KeyRound, Copy, Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import CreateCourseModal from '../../components/CreateCourseModal'; 
import toast from '../../utils/toast'; 

const CoursesLecturer = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 STATE BARU UNTUK FILTER TAB
  // Pilihan: 'ALL' | 'PUBLIC' | 'PRIVATE' | 'PREMIUM'
  const [activeTab, setActiveTab] = useState('ALL'); 

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/courses');
      const data = response.data.data;
      setCourses(data.courses || data || []);
    } catch (error) {
      console.error("Gagal mengambil data", error);
      toast.error("Gagal memuat daftar kelas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  // 🔥 FUNGSI UTAMA: SALIN LINK AKSES MAHASISWA
  const handleShareLink = (courseId, title) => {
    // Menghasilkan link absolut halaman detail kelas untuk sisi mahasiswa
    const studentCourseUrl = `${window.location.origin}/courses/${courseId}`;
    navigator.clipboard.writeText(studentCourseUrl);
    toast.success(`Link kelas "${title}" berhasil disalin! Siap dibagikan.`);
  };

  const copyAccessCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Kode akses ${code} disalin!`);
  };

  // 🔥 LOGIKA FILTERING BERDASARKAN TAB YANG AKTIF
  const filteredCourses = courses.filter((course) => {
    if (activeTab === 'PUBLIC') return course.visibility === 'PUBLIC' && course.type === 'REGULAR';
    if (activeTab === 'PRIVATE') return course.visibility === 'PRIVATE';
    if (activeTab === 'PREMIUM') return course.type === 'PROJECT_BASED';
    return true; // ALL
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <span className="loading loading-spinner loading-lg text-slate-800"></span>
        <p className="text-slate-500 font-medium animate-pulse">Memuat studio mengajar...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ========================================== */}
      {/* 1. HEADER SECTIONS                           */}
      {/* ========================================== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <span className="p-2.5 bg-slate-900 text-white rounded-xl shadow-md">
              <LayoutList size={24} strokeWidth={2.5} />
            </span>
            Katalog Kelas Anda
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm sm:text-base max-w-xl">
            Kelola materi, atur model bisnis kelas, dan sebar akses pembelajaran ke mahasiswa.
          </p>
        </div>
        <CreateCourseModal onCourseCreated={fetchCourses} />
      </div>

      {/* ========================================== */}
      {/* 2. TAB FILTER CONTROLLER (Premium Nav)       */}
      {/* ========================================== */}
      <div className="flex bg-slate-200/60 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto gap-1">
        <button 
          onClick={() => setActiveTab('ALL')}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap cursor-pointer ${activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Semua Kelas ({courses.length})
        </button>
        <button 
          onClick={() => setActiveTab('PUBLIC')}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap cursor-pointer ${activeTab === 'PUBLIC' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          🌐 Publik Gratis ({courses.filter(c => c.visibility === 'PUBLIC' && c.type === 'REGULAR').length})
        </button>
        <button 
          onClick={() => setActiveTab('PRIVATE')}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap cursor-pointer ${activeTab === 'PRIVATE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          🔒 Privat / Rahasia ({courses.filter(c => c.visibility === 'PRIVATE').length})
        </button>
        <button 
          onClick={() => setActiveTab('PREMIUM')}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap cursor-pointer ${activeTab === 'PREMIUM' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          ✨ Premium Berbayar ({courses.filter(c => c.type === 'PROJECT_BASED').length})
        </button>
      </div>

      {/* ========================================== */}
      {/* 3. EMPTY STATE DATA TRUTHY                   */}
      {/* ========================================== */}
      {filteredCourses.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-inner mb-4">
            <BookOpen size={28} className="text-slate-300" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-lg mb-1">Tidak Ada Kelas</h3>
          <p className="text-slate-400 max-w-xs text-xs font-medium">
            Kategori ini kosong. Silakan buat kelas baru atau sesuaikan filter pencarian Anda.
          </p>
        </div>
      )}

      {/* ========================================== */}
      {/* 4. GRID DATA KELAS TERFILTER                 */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const totalBab = course._count?.chapters || course.chapters?.length || 0;
          const totalMhs = course._count?.enrollments || 0;
          const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(course.price || 0);

          return (
            <div key={course.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col h-full overflow-hidden group">
              
              {/* TOP STATUS CARDS */}
              <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
                {course.visibility === 'PUBLIC' ? (
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    <Globe size={12} /> Publik
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    <Lock size={12} /> Privat
                  </div>
                )}

                {course.is_published ? (
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <CheckCircle2 size={12} /> Rilis
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <FileEdit size={12} /> Draft
                  </div>
                )}
              </div>

              {/* BODY KELAS */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 border rounded-xl flex items-center justify-center shadow-sm ${course.type === 'PROJECT_BASED' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <BookOpen size={24} strokeWidth={2.5} />
                  </div>
                  
                  {course.type === 'PROJECT_BASED' ? (
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1">
                      <Sparkles size={10} /> Premium
                    </div>
                  ) : (
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                      <Tag size={10} /> Gratis
                    </div>
                  )}
                </div>
                
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight mb-1.5 line-clamp-2">{course.title}</h2>
                <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-4 flex-1">
                  {course.description || "Belum ada deskripsi untuk mata kuliah ini."}
                </p>

                {/* AREA HARGA & KODE AKSES */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  {course.type === 'PROJECT_BASED' && course.price > 0 ? (
                    <span className="font-black text-base text-slate-900">{formattedPrice}</span>
                  ) : (
                    <span className="font-bold text-xs text-emerald-600 uppercase tracking-wider">Akses Gratis</span>
                  )}

                  {/* Tampilkan Kode Akses untuk Kelas Privat */}
                  {course.visibility === 'PRIVATE' && course.access_code && (
                    <button 
                      onClick={() => copyAccessCode(course.access_code)}
                      className="flex items-center gap-1 text-[10px] font-black bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Klik untuk Salin Kunci"
                    >
                      <KeyRound size={10} /> Kunci: {course.access_code} <Copy size={10} className="opacity-60" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* FOOTER ACTION & QUICK MENUS */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2.5">
                
                {/* Info kecil di atas tombol */}
                <div className="flex gap-2 text-[11px] font-bold text-slate-500">
                  <span className="flex-1 flex justify-center items-center gap-1 bg-white border border-slate-200/80 py-1.5 rounded-lg">
                    <LayoutList size={12} className="text-slate-400" /> {totalBab} Bab
                  </span>
                  <span className="flex-1 flex justify-center items-center gap-1 bg-white border border-slate-200/80 py-1.5 rounded-lg">
                    <Users size={12} className="text-slate-400" /> {totalMhs} Siswa
                  </span>
                  
                  {/* 🔥 LINK BAGI (SHARE LINK MENU) KHUSUS UNTUK PRIVAT */}
                  {course.visibility === 'PRIVATE' && (
                    <button 
                      onClick={() => handleShareLink(course.id, course.title)}
                      className="flex-1 flex justify-center items-center gap-1 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white py-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Salin URL Kelas Rahasia untuk Mahasiswa"
                    >
                      <Share2 size={12} /> Bagikan Link
                    </button>
                  )}
                </div>

                <Link to={`/courses/${course.id}`} className="btn w-full bg-slate-900 border-none text-white hover:bg-slate-800 shadow-sm font-bold h-11 min-h-0 text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5">
                  Kelola Struktur <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoursesLecturer;