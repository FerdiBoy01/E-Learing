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
  Layers,
  BarChart3,
  Award,
  ArrowUpRight,
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
    coursePerformance: [], // Tambahan data performa produk dari backend
  });
  const [loading, setLoading] = useState(true);

  const isCreator =
    user?.role === "CREATOR" ||
    user?.role === "ADMIN" ||
    user?.role === "LECTURER";

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
    }).format(number || 0);
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
        <span className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></span>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
          Menyiapkan Workspace...
        </p>
      </div>
    );

  return (
    <div className="w-full max-w-[1500px] mx-auto space-y-6 animate-in fade-in duration-500 p-4 sm:p-6 lg:p-8">
      {/* ========================================== */}
      {/* 1. HERO BANNER (Professional Flat Style)   */}
      {/* ========================================== */}
      <div className="relative overflow-hidden bg-slate-900 rounded-xl p-8 sm:p-10 shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center">
        {/* Dekorasi Aksent Minimalis */}
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none hidden md:block">
          <Layers size={200} />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 mb-4">
            <span className="flex w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {user?.role} WORKSPACE
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
            Selamat Datang, {user?.name}
          </h1>
          <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed max-w-xl">
            Pantau metrik akademik mahasiswa Anda, kelola kurikulum materi, dan
            evaluasi hasil penjualan kelas premium langsung dari satu dasbor
            pusat.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/courses"
              className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-lg px-6 py-2.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center shadow-sm"
            >
              <Plus size={16} className="mr-1.5" /> Buat Kelas Baru
            </Link>
            <Link
              to="/transactions"
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg px-6 py-2.5 font-bold text-xs uppercase tracking-wider transition-colors flex items-center"
            >
              Manajemen Finansial <ArrowRight size={14} className="ml-1.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. METRIK GRID (Flat Pro Design)           */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Pendapatan Kotor */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
              Total Pendapatan
            </h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <Wallet size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div
            className="text-2xl font-black text-slate-900 tracking-tight truncate"
            title={formatRupiah(stats.totalRevenue)}
          >
            {formatRupiah(stats.totalRevenue)}
          </div>
          <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1 uppercase tracking-wider">
            <TrendingUp size={12} strokeWidth={3} /> Akumulasi Penjualan
          </p>
        </div>

        {/* Stat 2: Total Siswa */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
              Siswa Terdaftar
            </h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              <Users size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalStudents}{" "}
            <span className="text-xs text-slate-400">Orang</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-wider">
            Mempelajari modul Anda
          </p>
        </div>

        {/* Stat 3: Total Kelas */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
              Silabus Aktif
            </h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <BookOpen size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalCourses}{" "}
            <span className="text-xs text-slate-400">Kelas</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-wider">
            Kurikulum yang diterbitkan
          </p>
        </div>

        {/* Stat 4: Tugas Pending */}
        <div className="bg-white p-6 rounded-xl border border-rose-200 shadow-sm relative overflow-hidden">
          {stats.pendingSubmissions > 0 && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full"></div>
          )}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
              Menunggu Evaluasi
            </h3>
            <div
              className={`p-2 rounded-lg border ${stats.pendingSubmissions > 0 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}
            >
              <Clock size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div
            className={`text-2xl font-black tracking-tight relative z-10 ${stats.pendingSubmissions > 0 ? "text-rose-600" : "text-slate-900"}`}
          >
            {stats.pendingSubmissions}{" "}
            <span className="text-xs font-bold text-slate-400 uppercase">
              Berkas
            </span>
          </div>
          <Link
            to="/submissions"
            className={`text-[10px] font-bold mt-2 flex items-center gap-1 hover:underline relative z-10 uppercase tracking-wider ${stats.pendingSubmissions > 0 ? "text-rose-600" : "text-slate-400"}`}
          >
            {stats.pendingSubmissions > 0
              ? "Tinjau Sekarang"
              : "Tidak ada antrean"}{" "}
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. PERFORMANCE & ACTIVITY BOARD            */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEADERBOARD PRODUK */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-600" /> Performa
              Penjualan Kelas
            </h3>
            <Link
              to="/transactions"
              className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-1"
            >
              Lihat Detail <ArrowRight size={10} />
            </Link>
          </div>

          {!stats.coursePerformance || stats.coursePerformance.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <Award size={32} className="text-slate-200 mb-3" />
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Belum Ada Data
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                Buat kelas premium dan mulai hasilkan pendapatan.
              </p>
            </div>
          ) : (
            <div
              className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar"
              style={{ maxHeight: "250px" }}
            >
              {stats.coursePerformance.map((course, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-200 text-slate-500 font-black text-xs flex items-center justify-center border border-slate-300">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs line-clamp-1 max-w-[200px]">
                        {course.title}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                        {course.sales_count} Terjual
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-indigo-600">
                      {formatRupiah(course.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROGRESS & EVALUASI */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" /> Rasio
              Evaluasi Tugas
            </h3>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-6">
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              {/* Fake Donut Chart / Progress Circle */}
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset={
                    stats.pendingSubmissions + stats.gradedSubmissions === 0
                      ? "251.2"
                      : 251.2 -
                        (251.2 * stats.gradedSubmissions) /
                          (stats.pendingSubmissions + stats.gradedSubmissions)
                  }
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {stats.pendingSubmissions + stats.gradedSubmissions === 0
                    ? "0"
                    : Math.round(
                        (stats.gradedSubmissions /
                          (stats.pendingSubmissions +
                            stats.gradedSubmissions)) *
                          100,
                      )}
                  %
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Diselesaikan
                </span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Sudah Dinilai
                </p>
                <p className="text-lg font-black text-emerald-600">
                  {stats.gradedSubmissions}
                </p>
              </div>
              <div className="text-center p-3 bg-rose-50 rounded-lg border border-rose-100">
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">
                  Perlu Aksi
                </p>
                <p className="text-lg font-black text-rose-600">
                  {stats.pendingSubmissions}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLecturer;
