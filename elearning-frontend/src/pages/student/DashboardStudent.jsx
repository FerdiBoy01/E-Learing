import { useEffect, useState } from 'react';
import { 
  BookOpen, Clock, Sparkles, Trophy, 
  ArrowRight, Target, Zap, Activity, Award, CheckCircle
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
        // Biar nggak blank kalau API belum siap, kita kasih data dummy pas error buat preview
        setStats({
          totalExp: 0, completionPercentage: 0, completedMaterials: 0, totalMaterials: 0, pendingGrades: 0, recentMaterials: []
        });
      } finally { 
        setLoading(false); 
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center">
      <span className="loading loading-spinner loading-lg text-blue-600"></span>
      <p className="mt-4 text-slate-500 font-medium animate-pulse">Menyiapkan mejamu...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto font-sans pb-20 pt-2 text-slate-800">
      
      {/* ================================================= */}
      {/* 1. WELCOME BANNER (Gaya Premium SaaS)              */}
      {/* ================================================= */}
      <div className="relative mb-8 p-8 md:p-10 rounded-2xl bg-slate-900 overflow-hidden shadow-xl shadow-slate-900/10 border border-slate-800 group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full -mr-20 -mt-20 blur-[120px] opacity-30 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500 rounded-full -ml-20 -mb-20 blur-[100px] opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-blue-300 text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles size={12} className="text-amber-400" /> Student Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
              Gaspol, {user?.name.split(' ')[0] || 'Student'}! 🚀
            </h1>
            <p className="text-slate-400 text-base font-medium max-w-md">
              Fokus satu materi hari ini. Konsistensi adalah kunci menguasai skill baru.
            </p>
          </div>

          {/* 🔥 STATS EXP (GAMIFICATION) */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center gap-4 shrink-0">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/10 border border-amber-300/50">
              <Trophy size={28} className="text-amber-900" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Total Experience</p>
              <h3 className="text-2xl font-black text-white leading-none">
                {user?.exp || stats?.totalExp || 0} <span className="text-xs font-bold text-amber-400">EXP</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* 2. GRID STATISTIK UTAMA                            */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Progres Belajar Card */}
        <div className="md:col-span-2 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-6 md:gap-8 hover:shadow-md transition-shadow">
          <div className="relative shrink-0">
            {/* Circle Progress Visual */}
            <div className="w-28 h-28 rounded-full border-[6px] border-slate-50 flex items-center justify-center relative bg-white shadow-inner">
              <span className="text-2xl font-black text-slate-800">{stats?.completionPercentage || 0}%</span>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle 
                  cx="50" cy="50" r="50" fill="transparent" stroke="currentColor" strokeWidth="6"
                  className="text-blue-500"
                  strokeDasharray={314}
                  strokeDashoffset={314 - (314 * (stats?.completionPercentage || 0)) / 100}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Progres Keseluruhan</h3>
            <p className="text-slate-500 font-medium mb-4 text-sm leading-relaxed max-w-sm mx-auto sm:mx-0">
              Kamu telah menyelesaikan <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">{stats?.completedMaterials || 0}</span> dari <span className="text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{stats?.totalMaterials || 0}</span> materi yang tersedia.
            </p>
            <Link to="/courses" className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg">
              Lanjut Belajar <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Tugas Pending Card */}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col justify-between group hover:border-indigo-200 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
              <Clock size={24} />
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border border-indigo-100">Menunggu</span>
          </div>
          <div>
            <h3 className="text-4xl font-black text-slate-800 mb-1">{stats?.pendingGrades || 0}</h3>
            <p className="text-slate-600 font-bold text-sm">Tugas Pending</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">Instruktur sedang mengevaluasi tugas praktikmu.</p>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* 3. ROW BAWAH: AKTIVITAS & QUICK ACTION             */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Aktivitas Terakhir */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Activity size={20} className="text-blue-500" /> Riwayat Aktivitas
            </h2>
          </div>
          
          <div className="space-y-3">
            {stats?.recentMaterials?.length > 0 ? stats.recentMaterials.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0 border border-slate-100">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.courseTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shrink-0 self-start sm:self-auto">
                  <CheckCircle size={14} /> {new Date(item.completedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                </div>
              </div>
            )) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                <Zap size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-bold text-sm">Belum ada aktivitas belajar.</p>
                <p className="text-slate-400 text-xs mt-1">Ayo mulai pelajari satu materi hari ini!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action / Goals */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 mb-4 px-1">
            <Target size={20} className="text-amber-500" /> Fokus Belajar
          </h2>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
            {/* Ornamen halus di background */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 border border-blue-100">
                <Award size={20} />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-2">Klaim Sertifikat Pertama</h4>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
                Selesaikan seluruh materi pada salah satu kelas untuk mendapatkan sertifikat kelulusan dan tambahan 500 EXP.
              </p>
              
              <Link 
                to="/courses" 
                className="w-full flex items-center justify-center bg-slate-900 hover:bg-blue-600 text-white rounded-xl py-3 font-bold text-xs tracking-wider uppercase transition-colors shadow-sm"
              >
                Lihat Katalog
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardStudent;