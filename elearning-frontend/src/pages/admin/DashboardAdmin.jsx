import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  MoreHorizontal,
} from "lucide-react";
import api from "../../config/axios";

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
        console.error("Gagal tarik data admin", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <span className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></span>
        <p className="text-slate-500 font-semibold text-sm animate-pulse">
          Menghitung metrik data...
        </p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto font-sans animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Overview Sistem
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Analitik performa, pertumbuhan pengguna, dan finansial NusaLearn.
        </p>
      </div>

      {/* STATS CARDS (Glassmorphism) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Card Pengguna */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
            <Users size={32} className="text-indigo-500 opacity-50" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Total Pengguna
          </p>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            {stats?.users?.total || 0}
          </h2>
          <div className="flex gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            <span className="bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
              {stats?.users?.students || 0} Siswa
            </span>
            <span className="bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
              {stats?.users?.lecturers || 0} Dosen
            </span>
          </div>
        </div>

        {/* Card Kelas */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
            <BookOpen size={32} className="text-amber-500 opacity-50" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Katalog Silabus
          </p>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            {stats?.courses?.total || 0}
          </h2>
          <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded shadow-sm">
              {stats?.courses?.published || 0} Rilis
            </span>
            <span className="bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded shadow-sm">
              {stats?.courses?.draft || 0} Draft
            </span>
          </div>
        </div>

        {/* Card Pendapatan (Dark Mode Card for Contrast) */}
        <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -right-2 -top-2 w-16 h-16 bg-white/5 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
            <DollarSign size={24} className="text-emerald-400 opacity-50" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Total Pendapatan
            </p>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(stats?.finance?.totalRevenue || 0)}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded w-fit uppercase tracking-wider">
              <TrendingUp size={12} /> {stats?.finance?.totalTransactions || 0}{" "}
              Transaksi Sukses
            </div>
          </div>
        </div>
      </div>

      {/* LATEST USERS TABLE (Apple Clean Style) */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="p-5 border-b border-slate-200/60 flex justify-between items-center bg-white/50">
          <h3 className="font-bold text-sm text-slate-900">
            Pendaftar Terbaru
          </h3>
          <button className="p-1 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors border border-slate-200">
            <MoreHorizontal size={16} />
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-200/60">
                <th className="px-6 py-4 font-bold">Identitas</th>
                <th className="px-6 py-4 font-bold">Akses Peran</th>
                <th className="px-6 py-4 font-bold">Gamifikasi</th>
                <th className="px-6 py-4 font-bold">Tanggal Bergabung</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50/50 transition-colors border-b border-slate-100/80 last:border-none"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-xs text-slate-900">
                      {u.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${
                        u.role === "ADMIN"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : u.role === "LECTURER"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {u.role === "ADMIN" && <ShieldCheck size={10} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
                        Lvl {u.level || 1}
                      </span>
                      <span className="text-amber-600">
                        {new Intl.NumberFormat("id-ID").format(u.points || 0)}{" "}
                        Pts
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-semibold text-slate-500">
                    {new Date(u.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-slate-400 text-xs font-semibold"
                  >
                    Belum ada data pendaftar baru.
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
