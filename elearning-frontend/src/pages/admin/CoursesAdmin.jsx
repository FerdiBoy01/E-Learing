import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Globe,
  Lock,
  AlertTriangle,
  Sparkles,
  Layers,
  Briefcase,
  EyeOff,
  Filter,
  RefreshCw,
} from "lucide-react";
import api from "../../config/axios";
import toast from "../../utils/toast";

const CoursesAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 🔥 State Baru Untuk Protokol Takedown
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [takedownReason, setTakedownReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/courses");
      setCourses(res.data.data.courses || []);
    } catch (error) {
      toast.error("Gagal menarik entitas data kelas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (
      !window.confirm(
        `🚨 PERINGATAN ROOT CONTROL!\n\nYakin ingin menghapus PERMANEN kurikulum "${courseTitle}"?`,
      )
    )
      return;
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success(`Kurikulum berhasil dilenyapkan dari basis data!`);
      fetchCourses();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal mengeksekusi penghapusan kelas",
      );
    }
  };

  // Buka Modal Takedown
  const openTakedownModal = (courseId, courseTitle) => {
    setSelectedCourse({ id: courseId, title: courseTitle });
    setTakedownReason(""); // Kosongin textareanya
    document.getElementById("modal_takedown").showModal();
  };

  // 🔥 Eksekusi Submit Takedown & Kirim Alasan
  const submitForceTakedown = async (e) => {
    e.preventDefault();
    if (!takedownReason.trim()) {
      return toast.error("Alasan pelanggaran wajib diisi!");
    }

    setIsSubmitting(true);
    try {
      await api.put(`/admin/courses/${selectedCourse.id}/takedown`, {
        takedown_reason: takedownReason,
      });
      toast.success(
        `Takedown sukses! Notifikasi alasan telah dikirim ke kreator.`,
      );
      document.getElementById("modal_takedown").close();
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal melakukan takedown.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestoreCourse = async (courseId, courseTitle) => {
    if (
      !window.confirm(
        `🔄 KEMBALIKAN KE PUBLIK?\n\nPulihkan kelas "${courseTitle}" agar berstatus APPROVED dan PUBLIC kembali?`,
      )
    )
      return;
    try {
      await api.put(`/admin/courses/${courseId}/restore`);
      toast.success(`Protokol Restore berhasil! Kelas kembali mengudara.`);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memulihkan kelas.");
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.lecturer?.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || c.type === typeFilter;
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const pendingCount = courses.filter((c) => c.status === "PENDING").length;

  return (
    <div className="max-w-[1500px] mx-auto font-sans pb-24 pt-2 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300 relative overflow-x-hidden">
      {/* HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between mb-6 p-6 bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-sm rounded-2xl shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <span className="p-2 bg-slate-900 text-white rounded-lg">
              <Layers size={16} strokeWidth={2.5} />
            </span>
            Katalog Manajemen Kurikulum
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Panel kendali root untuk memantau, mengurasi, force-takedown, dan
            mengeksekusi moderasi kelas.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3 shrink-0">
          {pendingCount > 0 && (
            <span className="bg-amber-100/80 border border-amber-200 text-amber-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm animate-pulse">
              <AlertTriangle size={14} strokeWidth={2.5} /> {pendingCount}{" "}
              Antrean Review
            </span>
          )}
          <div className="flex items-center gap-2 bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/50 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Total Indeks
            </span>
            <span className="text-slate-900 font-black text-sm">
              {filteredCourses.length}
            </span>
          </div>
        </div>
      </div>

      {/* TOOLBAR FILTER */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-4 mb-5 p-3 bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari judul kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/80 border border-slate-200/80 focus:bg-white focus:border-slate-900 rounded-lg text-xs font-semibold outline-none transition-colors shadow-sm"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="relative">
            <Filter
              size={12}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 pl-8 pr-4 py-2.5 bg-white/80 border border-slate-200/80 focus:bg-white focus:border-slate-900 rounded-lg text-xs font-bold outline-none shadow-sm text-slate-700 cursor-pointer appearance-none"
            >
              <option value="ALL">Semua Status Gate</option>
              <option value="PENDING">Menunggu Review</option>
              <option value="APPROVED">Lolos Kurasi</option>
              <option value="REJECTED">Takedown / Ditolak</option>
            </select>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 bg-white/80 border border-slate-200/80 focus:bg-white focus:border-slate-900 rounded-lg text-xs font-bold outline-none shadow-sm text-slate-700 cursor-pointer"
          >
            <option value="ALL">Semua Skema Bisnis</option>
            <option value="REGULAR">Regular (Gratis)</option>
            <option value="PROJECT_BASED">Premium Project</option>
          </select>
        </div>
      </div>

      {/* DATAGRID */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200/60 text-slate-400 text-[9px] uppercase tracking-widest font-black">
                <th className="pl-6 py-4 w-16">Kover</th>
                <th className="py-4">Identitas Kurikulum</th>
                <th className="py-4">Skema Bisnis</th>
                <th className="py-4">Status Quality Gate</th>
                <th className="text-center py-4 pr-6">Eksekusi Moderasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-slate-700 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <span className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin inline-block"></span>
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-16 font-bold text-slate-400 uppercase tracking-widest text-[10px]"
                  >
                    Entitas kelas tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/40 transition-colors"
                  >
                    <td className="pl-6 py-4">
                      <div className="w-16 h-11 bg-slate-100 rounded-md overflow-hidden border border-slate-200/80 shadow-xs relative group">
                        <img
                          src={
                            c.thumbnail_url ||
                            `https://ui-avatars.com/api/?name=${c.title}&background=f1f5f9&color=334155`
                          }
                          alt="kover"
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                        />
                        {c.visibility === "PRIVATE" && (
                          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center">
                            <Lock size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="font-black text-sm text-slate-900 line-clamp-1">
                        {c.title}
                      </div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                        <Briefcase size={10} /> {c.lecturer?.name || "Anonim"}
                      </div>
                    </td>
                    <td className="py-4">
                      {c.type === "PROJECT_BASED" ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-900 border border-slate-300 px-2 py-0.5 rounded bg-slate-100 shadow-sm">
                            <Sparkles size={8} /> Premium
                          </span>
                          <span className="text-xs font-black text-slate-800">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            }).format(c.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-600 border border-slate-200 px-2 py-0.5 rounded bg-slate-50 shadow-sm">
                          Regular Free
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        {c.status === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded shadow-sm">
                            <CheckCircle size={10} strokeWidth={2.5} /> Approved
                          </span>
                        ) : c.status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded shadow-sm">
                            <XCircle size={10} strokeWidth={2.5} /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded shadow-sm">
                            <AlertTriangle size={10} strokeWidth={2.5} />{" "}
                            Pending Review
                          </span>
                        )}
                        <span
                          className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${c.visibility === "PUBLIC" ? "text-slate-500" : "text-rose-500"}`}
                        >
                          {c.visibility === "PUBLIC" ? (
                            <Globe size={8} strokeWidth={2.5} />
                          ) : (
                            <Lock size={8} strokeWidth={2.5} />
                          )}{" "}
                          {c.visibility}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-4 pr-6">
                      <div className="flex justify-center items-center gap-1.5">
                        <Link
                          to={`/admin/courses/${c.id}/review`}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 transition-colors"
                        >
                          <Eye size={12} strokeWidth={2.5} /> Inspeksi
                        </Link>

                        {/* 🔥 Tombol Takedown Mengarah ke Modal */}
                        {c.visibility === "PUBLIC" ? (
                          <button
                            onClick={() => openTakedownModal(c.id, c.title)}
                            className="bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-400 hover:text-amber-600 p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            <EyeOff size={13} strokeWidth={2.5} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestoreCourse(c.id, c.title)}
                            className="bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            <RefreshCw size={13} strokeWidth={2.5} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCourse(c.id, c.title)}
                          className="bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🔥 MODAL TAKEDOWN DENGAN ALASAN (GLASSMORPHISM)                           */}
      {/* ========================================================================= */}
      <dialog
        id="modal_takedown"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box bg-white/95 backdrop-blur-2xl rounded-2xl p-0 max-w-md border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in zoom-in-95 duration-200">
          <div className="p-4 sm:p-5 border-b border-rose-100 flex justify-between items-center bg-rose-50/50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <AlertTriangle size={14} strokeWidth={2.5} /> Protokol Force
              Takedown
            </h3>
            <form method="dialog">
              <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition-colors cursor-pointer">
                ✕
              </button>
            </form>
          </div>

          <form onSubmit={submitForceTakedown} className="p-6 space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Target Kurikulum
              </p>
              <p className="text-sm font-black text-slate-900 line-clamp-2">
                {selectedCourse?.title}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Alasan Penurunan / Pelanggaran (Akan dikirim ke Kreator)
              </label>
              <textarea
                required
                rows="4"
                placeholder="Misal: Kelas mengandung unsur plagiasi atau materi video tidak bisa diputar..."
                value={takedownReason}
                onChange={(e) => setTakedownReason(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-xs font-medium outline-none transition-all shadow-inner resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                "Mengeksekusi Protokol..."
              ) : (
                <>
                  <EyeOff size={16} strokeWidth={2.5} /> Sembunyikan Paksa &
                  Kirim Peringatan
                </>
              )}
            </button>
          </form>
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-slate-900/30 backdrop-blur-sm"
        >
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default CoursesAdmin;
