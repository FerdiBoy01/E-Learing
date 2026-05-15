import { useEffect, useState } from 'react';
import { BookOpen, Users, ArrowRight, Info, LayoutList, Tag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
// 🔥 IMPORT KOMPONEN MODAL YANG SUDAH KITA BUAT
import CreateCourseModal from '../../components/CreateCourseModal'; 

const CoursesLecturer = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/courses');
      const data = response.data.data;
      setCourses(data.courses || data || []);
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-blue-600"></span></div>;

  return (
    <div className="max-w-7xl mx-auto font-sans pb-20 px-4 pt-8 text-slate-800">
      
      {/* Header & Panduan */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen size={26} strokeWidth={2.5} />
            </span>
            Manajemen Mata Kuliah
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-base">Buat mata kuliah baru dan kelola silabus pembelajaran mahasiswa Anda.</p>
        </div>
        
        {/* 🔥 PANGGIL KOMPONEN MODAL DI SINI (Tombolnya ada di dalam komponen) */}
        <CreateCourseModal onCourseCreated={fetchCourses} />
      </div>

      {/* Petunjuk UX */}
      {courses.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 flex items-start gap-4 shadow-sm">
          <Info className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-blue-900 text-lg">Mulai Mengajar dalam 3 Langkah:</h3>
            <ol className="list-decimal list-inside text-blue-800 mt-3 space-y-2 font-medium">
              <li>Klik tombol <strong className="text-blue-900">"Buat Course"</strong> di sudut kanan atas.</li>
              <li>Klik <strong className="text-blue-900">"Kelola Silabus"</strong> pada kelas yang baru dibuat.</li>
              <li>Tambahkan Bab dan Materi (Teori, Kuis, atau Tugas Koding).</li>
            </ol>
          </div>
        </div>
      )}

      {/* Grid Mata Kuliah */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const totalBab = course._count?.chapters || course.chapters?.length || 0;
          const totalMhs = course._count?.enrollments || 0;

          // 🔥 FORMAT HARGA RUPIAH
          const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(course.price || 0);

          return (
            <div key={course.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 flex flex-col h-full overflow-hidden relative">
              
              {/* 🔥 BADGE TIPE KELAS */}
              <div className="absolute top-4 right-4 z-10">
                {course.type === 'PROJECT_BASED' ? (
                  <div className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Sparkles size={12} /> Berbayar
                  </div>
                ) : (
                  <div className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Tag size={12} /> Gratis
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className={`w-14 h-14 border rounded-xl flex items-center justify-center mb-5 ${course.type === 'PROJECT_BASED' ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100'}`}>
                  <BookOpen size={28} className={course.type === 'PROJECT_BASED' ? 'text-amber-600' : 'text-indigo-600'} strokeWidth={2} />
                </div>
                
                <h2 className="text-xl font-bold text-slate-800 leading-tight mb-3 line-clamp-2 pr-20">{course.title}</h2>
                <p className="text-sm font-medium text-slate-500 line-clamp-3 mb-4 flex-1">
                  {course.description || "Belum ada deskripsi untuk mata kuliah ini."}
                </p>

                {/* Tampilkan Harga kalau berbayar */}
                {course.type === 'PROJECT_BASED' && (
                  <div className="mb-4 text-amber-600 font-black text-lg">
                    {formattedPrice}
                  </div>
                )}
                
                <div className="flex gap-3 text-sm font-bold text-slate-600 mt-auto pt-5 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                    <LayoutList size={16} className="text-slate-400" /> {totalBab} Bab
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                    <Users size={16} className="text-slate-400" /> {totalMhs} Siswa
                  </span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <Link to={`/courses/${course.id}`} className="btn w-full bg-white border border-slate-300 text-blue-600 hover:bg-blue-50 hover:border-blue-300 shadow-sm font-bold h-auto py-3 rounded-xl transition-colors">
                  Kelola Silabus <ArrowRight size={18} strokeWidth={2.5} />
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