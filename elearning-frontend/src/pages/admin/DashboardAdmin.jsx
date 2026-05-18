import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  MoreHorizontal,
  ChevronRight,
  User,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../config/axios";
import toast from "../../utils/toast";

const DashboardAdmin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const resStats = await api.get("/admin/stats");
        setStats(resStats.data.data);

        const resUsers = await api.get("/admin/users");
        setUsers(resUsers.data.data.slice(0, 5));
      } catch (error) {
        toast.error("Gagal menarik data log metrik server");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-[70vh]">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-sm px-6 py-4 rounded-2xl">
          <span className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></span>
          <p className="text-slate-900 font-bold text-xs uppercase tracking-widest">
            Sinkronisasi Data...
          </p>
        </div>
      </div>
    );

  return (
    <div className="max-w-[1500px] mx-auto font-sans animate-in fade-in duration-500 pb-10">
      {/* ========================================================================= */}
      {/* HEADER SECTION (Executive Title)                                          */}
      {/* ========================================================================= */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Activity size={28} className="text-slate-700" strokeWidth={2.5} />{" "}
          Eksekutif Dasbor
        </h1>
        <p className="text-slate-500 text-xs font-semibold mt-1">
          Pusat komando analitik performa server, pertumbuhan entitas pengguna,
          dan laporan finansial platform.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* STATS CARDS (Apple Glassmorphism Pro)                                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Card Pengguna */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-100/50 rounded-full flex items-center justify-center">
            <Users size={40} strokeWidth={2} className="text-slate-300" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Entitas Pengguna Aktif
            </p>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">
              {stats?.users?.total || 0}
            </h2>
          </div>
          <div className="flex gap-2 text-[9px] font-black uppercase tracking-widest relative z-10">
            <span className="bg-white border border-slate-200/80 text-slate-700 px-2 py-1 rounded shadow-sm">
              {stats?.users?.students || 0} Siswa
            </span>
            <span className="bg-slate-900 border border-slate-950 text-white px-2 py-1 rounded shadow-sm">
              {stats?.users?.lecturers || 0} Dosen/Kreator
            </span>
          </div>
        </div>

        {/* Card Kelas */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-100/50 rounded-full flex items-center justify-center">
            <BookOpen size={40} strokeWidth={2} className="text-slate-300" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Katalog Kurikulum
            </p>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">
              {stats?.courses?.total || 0}
            </h2>
          </div>
          <div className="flex gap-2 text-[9px] font-black uppercase tracking-widest relative z-10">
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded shadow-sm">
              {stats?.courses?.published || 0} Rilis Publik
            </span>
            <span className="bg-white border border-slate-200/80 text-slate-500 px-2 py-1 rounded shadow-sm">
              {stats?.courses?.draft || 0} Pending
            </span>
          </div>
        </div>

        {/* Card Pendapatan (Dark Executive Mode) */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-950 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
            <DollarSign size={32} className="text-slate-600" />
          </div>
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Total Arus Kas Masuk
            </p>
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4 tracking-tighter">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(stats?.finance?.totalRevenue || 0)}
            </h2>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-[9px] font-black text-white bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded shadow-inner w-fit uppercase tracking-widest">
            <TrendingUp size={12} className="text-emerald-400" />
            {stats?.finance?.totalTransactions || 0} Transaksi Finansial
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LATEST USERS TABLE (Clean Strict Grid)                                    */}
      {/* ========================================================================= */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Header Tabel */}
        <div className="p-5 border-b border-slate-200/60 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-black text-sm text-slate-900 tracking-tight">
              Aktivitas Registrasi Terakhir
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              5 Entitas Akun Terbaru
            </p>
          </div>
          <Link
            to="/admin/users"
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
          >
            Lihat Semua <ChevronRight size={12} strokeWidth={3} />
          </Link>
        </div>

        {/* Grid Tabel */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[9px] uppercase tracking-widest border-b border-slate-200/60 font-black">
                <th className="px-6 py-4">Otentikasi Identitas</th>
                <th className="px-6 py-4">Otoritas Akses</th>
                <th className="px-6 py-4">Status Gamifikasi</th>
                <th className="px-6 py-4 text-right">Waktu Registrasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50/40 transition-colors"
                >
                  {/* Kolom Nama & Email */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                        <img
                          src={
                            u.avatar_url ||
                            `https://ui-avatars.com/api/?name=${u.name}&background=f1f5f9&color=334155`
                          }
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Kolom Otoritas (Role) */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                        u.role === "ADMIN"
                          ? "bg-slate-900 text-white border-slate-950"
                          : u.role === "LECTURER"
                            ? "bg-slate-100 text-slate-700 border-slate-300"
                            : u.role === "BANNED"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-white text-slate-500 border-slate-200"
                      }`}
                    >
                      {u.role === "ADMIN" && (
                        <ShieldCheck size={10} strokeWidth={2.5} />
                      )}
                      {u.role}
                    </span>
                  </td>

                  {/* Kolom RPG Status */}
                  <td className="px-6 py-4">
                    {u.role === "LECTURER" || u.role === "CREATOR" ? (
                      <span className="text-[10px] font-bold text-slate-400 italic">
                        N/A (Kreator)
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-900 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
                          Lvl {u.level || 1}
                        </span>
                        <span className="text-slate-500">
                          {new Intl.NumberFormat("id-ID").format(u.points || 0)}{" "}
                          Pts
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Kolom Tanggal */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      {new Date(u.created_at || u.createdAt).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest"
                  >
                    Belum ada data pendaftar baru terekam di sistem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
