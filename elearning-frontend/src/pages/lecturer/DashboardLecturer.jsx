import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Users, Clock, Wallet, Plus, ArrowRight, CheckCircle2, TrendingUp 
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../config/axios';

const DashboardLecturer = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    gradedSubmissions: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  const isCreator = user?.role === 'CREATOR' || user?.role === 'ADMIN';

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Asumsi endpoint ini nanti kita sesuaikan di backend biar ngirim data lengkap
        const response = await api.get('/dashboard/lecturer'); 
        if (response.data?.data) {
          setStats((prev) => ({ ...prev, ...response.data.data }));
        }
      } catch (error) {
        console.error("Gagal mengambil data statistik", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <span className="loading loading-spinner loading-lg text-slate-800"></span>
        <p className="text-slate-500 font-medium animate-pulse">Menyiapkan Studio Anda...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ========================================== */}
      {/* 1. HERO BANNER (Premium Dark Mode)         */}
      {/* ========================================== */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200 border border-slate-800">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <BookOpen size={200} className="text-white transform rotate-12" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm mb-6">
            <span className="flex w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isCreator ? 'Creator Workspace' : 'Lecturer Workspace'}
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Selamat datang kembali, {user?.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium mb-8">
            {isCreator 
              ? 'Pantau penjualan kelas premium Anda, kelola materi, dan lihat perkembangan siswa Anda hari ini.' 
              : 'Ringkasan aktivitas akademik, tugas mahasiswa, dan pengelolaan mata kuliah Anda ada di sini.'}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link to="/courses" className="btn bg-white hover:bg-slate-100 text-slate-900 border-none rounded-xl px-6 h-12 shadow-lg shadow-white/10 font-bold transition-transform hover:scale-105">
              <Plus size={20} className="mr-1" />
              Buat Kelas Baru
            </Link>
            {isCreator && (
              <Link to="/transactions" className="btn btn-ghost hover:bg-slate-800 text-white border border-slate-700 rounded-xl px-6 h-12 font-medium">
                Lihat Penjualan
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. STATISTIK GRID                            */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat 1: Total Kelas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-500 text-sm">Total Kelas</h3>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-800">{stats.totalCourses}</div>
          <p className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1">
            <span className="text-emerald-500 flex items-center"><TrendingUp size={12} className="mr-0.5" /> +1</span> bulan ini
          </p>
        </div>

        {/* Stat 2: Total Siswa */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-500 text-sm">Total Siswa</h3>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-800">{stats.totalStudents}</div>
          <p className="text-xs text-slate-500 font-medium mt-2">Siswa terdaftar di kelas Anda</p>
        </div>

        {/* Stat 3: Dinamis (Pendapatan untuk Creator / Tugas Dinilai untuk Dosen) */}
        {isCreator ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-500 text-sm">Pendapatan Kotor</h3>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Wallet size={20} strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-800 truncate" title={formatRupiah(stats.totalRevenue)}>
              {formatRupiah(stats.totalRevenue)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-2">Dari kelas Project-Based</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-500 text-sm">Tugas Dinilai</h3>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CheckCircle2 size={20} strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-800">{stats.gradedSubmissions}</div>
            <p className="text-xs text-slate-500 font-medium mt-2">Tugas berhasil direview</p>
          </div>
        )}

        {/* Stat 4: Tugas Menunggu */}
        <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm hover:border-rose-300 transition-colors group relative overflow-hidden">
          {stats.pendingSubmissions > 0 && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full -z-0"></div>
          )}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-semibold text-slate-500 text-sm">Perlu Dinilai</h3>
            <div className={`p-2.5 rounded-xl transition-colors ${stats.pendingSubmissions > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
              <Clock size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className={`text-3xl font-black relative z-10 ${stats.pendingSubmissions > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {stats.pendingSubmissions}
          </div>
          <Link to="/submissions" className={`text-xs font-bold mt-2 flex items-center gap-1 hover:underline relative z-10 ${stats.pendingSubmissions > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
            {stats.pendingSubmissions > 0 ? 'Review sekarang' : 'Tidak ada antrean'} <ArrowRight size={12} />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default DashboardLecturer;