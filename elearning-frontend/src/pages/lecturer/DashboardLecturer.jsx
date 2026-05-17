import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Clock,
  Wallet,
  Plus,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Layers,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import api from "../../config/axios";

const DashboardLecturer = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    gradedSubmissions: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const isCreator = user?.role === "CREATOR" || user?.role === "ADMIN";

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/dashboard/lecturer");
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

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <span className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></span>
        <p className="text-slate-500 text-sm font-semibold animate-pulse">
          Menyiapkan workspace studio...
        </p>
      </div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* ========================================== */}
      {/* 1. HERO BANNER (Premium Slate)             */}
      {/* ========================================== */}
      <div className="relative overflow-hidden bg-slate-950 rounded-xl p-8 sm:p-10 shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-[0.03] pointer-events-none hidden md:block">
          <Layers size={240} />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md mb-5 shadow-sm">
            <span className="flex w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {isCreator ? "Kreator Workspace" : "Instruktur Workspace"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
            Selamat datang kembali, {user?.name.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-medium mb-8 leading-relaxed">
            {isCreator
              ? "Pantau metrik penjualan kelas premium, kelola kurikulum materi, dan tinjau perkembangan siswa Anda di platform."
              : "Ringkasan aktivitas akademik, pengelolaan evaluasi tugas mahasiswa, dan pembaruan mata kuliah Anda tersedia di sini."}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/courses"
              className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-lg px-6 py-2.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center shadow-sm"
            >
              <Plus size={16} className="mr-1.5" /> Buat Kelas Baru
            </Link>
            {isCreator && (
              <Link
                to="/transactions"
                className="bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 rounded-lg px-6 py-2.5 font-bold text-xs uppercase tracking-wider transition-colors backdrop-blur-md"
              >
                Tinjau Penjualan
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. METRIK GRID (Glassmorphism Light)       */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Total Kelas */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] transition-all group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
              Silabus Anda
            </h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-indigo-100/50">
              <BookOpen size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.totalCourses}
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-2 flex items-center gap-1 uppercase tracking-wider">
            <span className="text-emerald-500 flex items-center">
              <TrendingUp size={12} className="mr-0.5" /> +1
            </span>{" "}
            Modul Aktif
          </p>
        </div>

        {/* Stat 2: Total Siswa */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] transition-all group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
              Siswa Terdaftar
            </h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100/50">
              <Users size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.totalStudents}
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-wider">
            Mempelajari kelas Anda
          </p>
        </div>

        {/* Stat 3: Pendapatan (Creator) / Review (Lecturer) */}
        {isCreator ? (
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] transition-all group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                Pemasukan Kotor
              </h3>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors border border-emerald-100/50">
                <Wallet size={18} strokeWidth={2.5} />
              </div>
            </div>
            <div
              className="text-2xl font-black text-slate-900 truncate tracking-tight"
              title={formatRupiah(stats.totalRevenue)}
            >
              {formatRupiah(stats.totalRevenue)}
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-wider">
              Estimasi Project-Based
            </p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] transition-all group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                Evaluasi Selesai
              </h3>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors border border-emerald-100/50">
                <CheckCircle2 size={18} strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.gradedSubmissions}
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-wider">
              Tugas berhasil ditinjau
            </p>
          </div>
        )}

        {/* Stat 4: Tugas Pending */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl border border-rose-200/50 shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:border-rose-300/80 transition-all group relative overflow-hidden">
          {stats.pendingSubmissions > 0 && (
            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-50 rounded-bl-full -z-0"></div>
          )}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
              Menunggu Evaluasi
            </h3>
            <div
              className={`p-2 rounded-lg transition-colors border ${stats.pendingSubmissions > 0 ? "bg-rose-50 text-rose-600 border-rose-100/50" : "bg-slate-50 text-slate-400 border-slate-100/50"}`}
            >
              <Clock size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div
            className={`text-3xl font-black tracking-tight relative z-10 ${stats.pendingSubmissions > 0 ? "text-rose-600" : "text-slate-900"}`}
          >
            {stats.pendingSubmissions}
          </div>
          <Link
            to="/submissions"
            className={`text-[10px] font-bold mt-2 flex items-center gap-1 hover:underline relative z-10 uppercase tracking-wider ${stats.pendingSubmissions > 0 ? "text-rose-600" : "text-slate-400"}`}
          >
            {stats.pendingSubmissions > 0
              ? "Tinjau Sekarang"
              : "Tidak ada antrean"}{" "}
            <ArrowRight size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardLecturer;
