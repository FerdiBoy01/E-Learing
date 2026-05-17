import { useEffect, useState } from "react";
import {
  BookOpen,
  Clock,
  Target,
  Zap,
  Activity,
  Award,
  CheckCircle,
  Coins,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import api from "../../config/axios";

const DashboardStudent = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/dashboard/student");
        setStats(response.data.data);
      } catch (error) {
        console.error("Error fetching stats", error);
        // Dummy fallback
        setStats({
          totalExp: 0,
          completionPercentage: 0,
          completedMaterials: 0,
          totalMaterials: 0,
          pendingGrades: 0,
          recentMaterials: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading)
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center font-sans">
        <span className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></span>
        <p className="text-slate-500 font-semibold text-sm animate-pulse">
          Menyiapkan ruang belajarmu...
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto font-sans pb-20 pt-4 px-4 sm:px-6 text-slate-800">
      {/* ================================================= */}
      {/* 1. WELCOME BANNER (Corporate Dark & Elegant)       */}
      {/* ================================================= */}
      <div className="relative mb-8 p-8 md:p-10 rounded-xl bg-slate-900 overflow-hidden shadow-lg border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        {/* Subtle iOS background glow inside dark card */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-4">
            <BookOpen size={14} className="text-indigo-400" /> Area Mahasiswa
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            Selamat datang, {user?.name.split(" ")[0] || "Siswa"}.
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-lg leading-relaxed">
            Konsistensi adalah kunci. Lanjutkan progres pembelajaran Anda hari
            ini dan kumpulkan poin untuk membuka materi premium.
          </p>
        </div>

        {/* 🔥 PANEL GAMIFIKASI (Level, EXP, Points) */}
        <div className="relative z-10 flex flex-wrap lg:flex-nowrap gap-3 shrink-0 w-full lg:w-auto">
          {/* LEVEL BADGE */}
          <div className="flex-1 lg:flex-none bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-400/30">
              <Shield size={20} className="text-indigo-300" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                Level Saat Ini
              </p>
              <h3 className="text-xl font-bold text-white leading-none">
                {user?.level || 1}
              </h3>
            </div>
          </div>

          {/* EXP BADGE */}
          <div className="flex-1 lg:flex-none bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
              <Zap size={20} className="text-blue-300" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                Experience
              </p>
              <h3 className="text-xl font-bold text-white leading-none">
                {user?.exp || stats?.totalExp || 0}{" "}
                <span className="text-xs font-semibold text-blue-300">XP</span>
              </h3>
            </div>
          </div>

          {/* NUSA POINTS BADGE */}
          <div className="flex-1 lg:flex-none bg-white/10 backdrop-blur-xl border border-amber-400/20 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite]"></div>
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-400/40">
              <Coins size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                Nusa Points
              </p>
              <h3 className="text-xl font-bold text-amber-400 leading-none">
                {new Intl.NumberFormat("id-ID").format(user?.points || 0)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* 2. GRID STATISTIK UTAMA (Glassmorphism Light)      */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Progres Belajar Card */}
        <div className="md:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200/60 p-6 md:p-8 rounded-xl shadow-sm flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-6 md:gap-8 transition-shadow hover:shadow-md">
          <div className="relative shrink-0">
            {/* Circle Progress Visual Clean */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-slate-100 flex items-center justify-center relative bg-white shadow-sm">
              <span className="text-xl md:text-2xl font-bold text-slate-800">
                {stats?.completionPercentage || 0}%
              </span>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="46%"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-indigo-600 transition-all duration-1000 ease-out"
                  strokeDasharray="289%"
                  strokeDashoffset={`calc(289% - (289% * ${stats?.completionPercentage || 0}) / 100)`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
              Progres Akademik
            </h3>
            <p className="text-slate-500 font-medium mb-5 text-sm md:text-base leading-relaxed">
              Anda telah menyelesaikan{" "}
              <span className="text-slate-900 font-semibold">
                {stats?.completedMaterials || 0}
              </span>{" "}
              dari{" "}
              <span className="text-slate-900 font-semibold">
                {stats?.totalMaterials || 0}
              </span>{" "}
              materi yang tersedia pada kurikulum aktif.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors w-full sm:w-auto"
            >
              Lanjutkan Belajar <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Tugas Pending Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 p-6 md:p-8 rounded-xl shadow-sm flex flex-col justify-between group transition-shadow hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center border border-slate-200/60">
              <Clock size={20} />
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest border border-indigo-100">
              Evaluasi
            </span>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
              {stats?.pendingGrades || 0}
            </h3>
            <p className="text-slate-900 font-semibold text-sm">
              Tugas Pending
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
              Instruktur sedang meninjau submisi Anda.
            </p>
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
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-indigo-600" /> Riwayat
              Aktivitas
            </h2>
          </div>

          <div className="space-y-3">
            {stats?.recentMaterials?.length > 0 ? (
              stats.recentMaterials.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100/50">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {item.courseTitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 self-start sm:self-auto">
                    <CheckCircle size={14} className="text-emerald-500" />
                    {new Date(item.completedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/50 backdrop-blur-sm border border-dashed border-slate-300 rounded-xl p-10 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen size={20} className="text-slate-400" />
                </div>
                <p className="text-slate-700 font-semibold text-sm">
                  Belum ada catatan aktivitas.
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Selesaikan satu materi untuk mulai mencatat progres.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action / Goals */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4 px-1">
            <Target size={18} className="text-rose-500" /> Fokus Target
          </h2>

          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl border border-slate-200/60 shadow-sm relative overflow-hidden">
            {/* Minimalist Graphic */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4"></div>

            <div className="relative z-10">
              <div className="w-10 h-10 bg-white text-rose-600 rounded-lg flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <Award size={20} />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                Sertifikasi Pertama
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
                Selesaikan kurikulum penuh untuk mengklaim sertifikat kelulusan
                digital dan bonus 500 XP.
              </p>

              <Link
                to="/courses"
                className="w-full flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-lg py-2.5 font-semibold text-xs transition-colors shadow-sm"
              >
                Jelajahi Katalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStudent;
