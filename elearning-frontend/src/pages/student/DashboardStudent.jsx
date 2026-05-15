import { useEffect, useState } from 'react';
import { 
  BookOpen, Clock, Sparkles, Trophy, 
  ArrowRight, Target, Zap, Activity, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../config/axios';

const DashboardStudent = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/dashboard/student');
        setStats(response.data.data);
      } catch (error) { 
        console.error("Error fetching stats", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center">
      <span className="loading loading-spinner loading-lg text-blue-600"></span>
      <p className="mt-4 text-slate-500 font-medium animate-pulse">Ngerapihin meja belajar lo dulu...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto font-sans pb-20 pt-2 px-2">
      
      {/* 🔥 WELCOME SECTION (Gradient Glass) */}
      <div className="relative mb-10 p-8 md:p-12 rounded-[2.5rem] bg-slate-900 overflow-hidden shadow-2xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full -mr-20 -mt-20 blur-[100px] opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500 rounded-full -ml-20 -mb-20 blur-[80px] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1 rounded-full text-blue-200 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles size={14} /> Student Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              Gaspol, {user?.name.split(' ')[0]}! 🚀
            </h1>
            <p className="text-slate-400 text-lg font-medium">
              Udah siap bantai materi baru hari ini? Fokus, konsisten, sikat!
            </p>
          </div>

          {/* 🔥 STATS EXP (GAMIFICATION) */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-200 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Trophy size={32} className="text-amber-900" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-wider">Total Experience</p>
              <h3 className="text-3xl font-black text-white">{user?.exp || stats?.totalExp || 0} <span className="text-sm font-bold text-amber-400">EXP</span></h3>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* GRID STATISTIK UTAMA                             */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Progres Belajar */}
        <div className="md:col-span-2 bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="relative shrink-0">
            {/* Circle Progress Visual */}
            <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center relative">
              <span className="text-3xl font-black text-slate-800">{stats?.completionPercentage || 0}%</span>
              <svg className="absolute top-[-8px] left-[-8px] w-[144px] h-[144px] -rotate-90">
                <circle 
                  cx="72" cy="72" r="64" fill="transparent" stroke="currentColor" strokeWidth="8"
                  className="text-blue-500"
                  strokeDasharray={402}
                  strokeDashoffset={402 - (402 * (stats?.completionPercentage || 0)) / 100}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Progres Keseluruhan</h3>
            <p className="text-slate-500 font-medium mb-4 text-sm leading-relaxed">
              Lo udah nyikat <span className="text-blue-600 font-bold">{stats?.completedMaterials || 0}</span> dari <span className="text-slate-800 font-bold">{stats?.totalMaterials || 0}</span> materi yang tersedia di semua kelas.
            </p>
            <Link to="/courses" className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline">
              Lanjut Belajar <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Tugas Pending Card */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Pending</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-black text-slate-800 mb-1">{stats?.pendingGrades || 0}</h3>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-tight">Tugas Belum Dinilai</p>
            <p className="text-xs text-slate-400 mt-2">Dosen lo lagi sibuk meriksa, sabar ya coy.</p>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* ROW BAWAH: AKTIVITAS & QUICK ACTION              */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Aktivitas Terakhir */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Activity size={24} className="text-rose-500" /> Aktivitas Terakhir
            </h2>
          </div>
          
          <div className="space-y-4">
            {stats?.recentMaterials?.length > 0 ? stats.recentMaterials.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-xs text-slate-400 font-medium">{item.courseTitle} • {new Date(item.completedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm uppercase">
                  <CheckCircle size={16} /> Selesai
                </div>
              </div>
            )) : (
              <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                <Zap size={40} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">Belum ada aktivitas baru. Ayo bantai satu materi!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action / Goals */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Target size={24} className="text-amber-500" /> Fokus Belajar
          </h2>
          
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <h4 className="text-lg font-bold mb-2">Klaim Sertifikat Pertama?</h4>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Selesaikan 1 kelas sampai 100% buat dapetin sertifikat resmi dan 500 EXP.
            </p>
            
            <Link 
              to="/courses" 
              className="w-full btn bg-white hover:bg-slate-100 text-blue-700 border-none rounded-xl font-black uppercase text-sm tracking-widest shadow-lg"
            >
              Cek Katalog Kelas
            </Link>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Award size={18} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Level 1</span>
              </div>
              <span className="text-[10px] font-black uppercase text-white/50 tracking-tighter">Pratia Student Elite</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardStudent;