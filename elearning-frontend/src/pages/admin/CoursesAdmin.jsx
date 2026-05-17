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
} from "lucide-react";
import api from "../../config/axios";
import toast from "../../utils/toast";

const CoursesAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Sebagai ADMIN, endpoint ini otomatis mengembalikan SEMUA kelas
      const res = await api.get("/courses");
      setCourses(res.data.data.courses);
    } catch (error) {
      toast.error("Gagal menarik data kelas");
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
        `⚠️ PERINGATAN GOD-MODE ⚠️\n\nYakin mau menghapus permanen kelas "${courseTitle}"? Semua data materi dan progres siswa di kelas ini bakal musnah!`,
      )
    )
      return;

    try {
      await api.delete(`/courses/${courseId}`);
      toast.success(`Kelas "${courseTitle}" berhasil dilenyapkan dari sistem!`);
      fetchCourses(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus kelas");
    }
  };

  // Logika Pencarian dan Filter
  const filteredCourses = courses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.lecturer?.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || c.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen size={32} className="text-blue-600" /> Manajemen Kelas
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Pantau, kurasi, dan moderasi semua kurikulum yang dibuat kreator.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm font-bold text-sm text-slate-700 flex items-center gap-2">
          Total Katalog:{" "}
          <span className="text-blue-600 font-black text-lg">
            {filteredCourses.length}
          </span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari judul kelas atau nama instruktur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full pl-11 bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-medium"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="select select-bordered bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-bold sm:w-56"
        >
          <option value="ALL">Semua Tipe Kelas</option>
          <option value="REGULAR">Regular (Gratis)</option>
          <option value="PROJECT_BASED">Premium Project</option>
        </select>
      </div>

      {/* TABEL DATA KELAS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest border-b-slate-200">
                <th className="pl-6 w-16">Sampul</th>
                <th>Detail Kelas & Instruktur</th>
                <th>Model Bisnis</th>
                <th>Status Kurasi</th>
                <th className="text-center">Aksi Moderasi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10">
                    <span className="loading loading-spinner text-slate-800"></span>
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-10 font-bold text-slate-400"
                  >
                    Tidak ada kelas yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 transition-colors border-b-slate-100"
                  >
                    <td className="pl-6">
                      <div className="w-16 h-12 bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
                        <img
                          src={
                            c.thumbnail_url ||
                            `https://ui-avatars.com/api/?name=${c.title}&background=random`
                          }
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-sm text-slate-800 line-clamp-1">
                        {c.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        By:{" "}
                        <span className="text-blue-600">
                          {c.lecturer?.name || "Anonim"}
                        </span>
                      </div>
                    </td>
                    <td>
                      {c.type === "PROJECT_BASED" ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="badge border-amber-200 bg-amber-50 text-amber-600 gap-1 text-[9px] font-black uppercase tracking-widest py-2">
                            <Sparkles size={10} /> Premium
                          </span>
                          <span className="text-xs font-black text-slate-700 mt-1">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            }).format(c.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="badge border-slate-200 bg-slate-100 text-slate-600 gap-1 text-[9px] font-black uppercase tracking-widest py-2">
                          Regular (Gratis)
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-col items-start gap-1">
                        {/* 🔥 STATUS APPROVAL DARI ENUM BARU */}
                        {c.status === "APPROVED" ? (
                          <span className="badge border-emerald-200 bg-emerald-50 text-emerald-600 text-[9px] font-black py-2.5 tracking-wider">
                            <CheckCircle size={10} className="mr-1" /> APPROVED
                          </span>
                        ) : c.status === "REJECTED" ? (
                          <span className="badge border-rose-200 bg-rose-50 text-rose-600 text-[9px] font-black py-2.5 tracking-wider">
                            <XCircle size={10} className="mr-1" /> REJECTED
                          </span>
                        ) : (
                          <span className="badge border-amber-200 bg-amber-50 text-amber-600 text-[9px] font-black py-2.5 tracking-wider">
                            <AlertTriangle size={10} className="mr-1" /> PENDING
                            REVIEW
                          </span>
                        )}

                        {c.visibility === "PUBLIC" ? (
                          <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1 uppercase">
                            <Globe size={10} /> Publik
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-rose-500 flex items-center gap-1 uppercase">
                            <Lock size={10} /> Privat
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        {/* 🔥 TOMBOL REVIEW */}
                        <Link
                          to={`/admin/courses/${c.id}/review`}
                          className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg shadow-sm"
                          title="Review Kelas Ini"
                        >
                          <Eye size={14} /> Review
                        </Link>

                        {/* TOMBOL HAPUS */}
                        <button
                          onClick={() => handleDeleteCourse(c.id, c.title)}
                          className="btn btn-sm bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-rose-600 rounded-lg shadow-sm"
                          title="Hapus Kelas Ini"
                        >
                          <Trash2 size={16} />
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
    </div>
  );
};

export default CoursesAdmin;
