import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  ArrowRight,
  LayoutList,
  Tag,
  Sparkles,
  Globe,
  Lock,
  FileEdit,
  CheckCircle2,
  KeyRound,
  Copy,
  Share2,
  AlertTriangle,
  XCircle,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../config/axios";
import CreateCourseModal from "../../components/CreateCourseModal";
import toast from "../../utils/toast";

const CoursesLecturer = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");

  // State untuk detail alasan ban
  const [banReason, setBanReason] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/courses/lecturer/me");
      setCourses(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data", error);
      toast.error("Gagal memuat daftar kurikulum internal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleShareLink = (courseId, title) => {
    const studentCourseUrl = `${window.location.origin}/courses/${courseId}`;
    navigator.clipboard.writeText(studentCourseUrl);
    toast.success(`Link kelas "${title}" berhasil disalin!`);
  };

  const copyAccessCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Kode akses ${code} disalin!`);
  };

  const openReasonModal = (reason) => {
    setBanReason(reason || "Pelanggaran hak cipta atau konten ilegal.");
    document.getElementById("modal_alasan_ban").showModal();
  };

  const filteredCourses = courses.filter((course) => {
    if (activeTab === "PUBLIC")
      return (
        course.visibility === "PUBLIC" &&
        course.type === "REGULAR" &&
        course.status !== "REJECTED"
      );
    if (activeTab === "PRIVATE")
      return course.visibility === "PRIVATE" && course.status !== "REJECTED";
    if (activeTab === "PREMIUM")
      return course.type === "PROJECT_BASED" && course.status !== "REJECTED";
    if (activeTab === "TAKEDOWN") return course.status === "REJECTED";
    return true;
  });

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <span className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></span>
        <p className="text-slate-500 text-sm font-semibold animate-pulse">
          Memuat manajemen silabus...
        </p>
      </div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 overflow-x-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight mb-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shadow-sm border border-indigo-100/50">
              <LayoutList size={22} strokeWidth={2.5} />
            </span>
            Katalog Silabus Anda
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base max-w-xl">
            Kelola rincian materi, atur kebijakan akses ruang kelas, dan
            publikasikan kurikulum ke mahasiswa.
          </p>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <CreateCourseModal onCourseCreated={fetchCourses} />
        </div>
      </div>

      {/* TAB FILTER */}
      <div className="flex bg-slate-200/50 backdrop-blur-md p-1 rounded-xl w-full sm:w-fit overflow-x-auto custom-scrollbar gap-1 border border-slate-300/40">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap border ${activeTab === "ALL" ? "bg-white text-slate-900 border-slate-200/50 shadow-sm" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          Semua ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab("PUBLIC")}
          className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap border flex items-center gap-1.5 ${activeTab === "PUBLIC" ? "bg-white text-blue-600 border-slate-200/50 shadow-sm" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <Globe size={14} /> Publik (
          {
            courses.filter(
              (c) =>
                c.visibility === "PUBLIC" &&
                c.type === "REGULAR" &&
                c.status !== "REJECTED",
            ).length
          }
          )
        </button>
        <button
          onClick={() => setActiveTab("PRIVATE")}
          className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap border flex items-center gap-1.5 ${activeTab === "PRIVATE" ? "bg-white text-rose-600 border-slate-200/50 shadow-sm" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <Lock size={14} /> Privat (
          {
            courses.filter(
              (c) => c.visibility === "PRIVATE" && c.status !== "REJECTED",
            ).length
          }
          )
        </button>
        <button
          onClick={() => setActiveTab("PREMIUM")}
          className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap border flex items-center gap-1.5 ${activeTab === "PREMIUM" ? "bg-white text-amber-600 border-slate-200/50 shadow-sm" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <Sparkles size={14} /> Premium (
          {
            courses.filter(
              (c) => c.type === "PROJECT_BASED" && c.status !== "REJECTED",
            ).length
          }
          )
        </button>

        {courses.filter((c) => c.status === "REJECTED").length > 0 && (
          <button
            onClick={() => setActiveTab("TAKEDOWN")}
            className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap border flex items-center gap-1.5 bg-rose-50/80 ${activeTab === "TAKEDOWN" ? "bg-rose-600 text-white border-rose-600 shadow-sm font-black" : "border-rose-200 text-rose-600 hover:bg-rose-100"}`}
          >
            <AlertTriangle size={14} /> Takedown (
            {courses.filter((c) => c.status === "REJECTED").length})
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {filteredCourses.length === 0 && (
        <div className="bg-white/50 backdrop-blur-md border border-dashed border-slate-300 rounded-xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            Kurikulum Kosong
          </h3>
          <p className="text-slate-500 text-xs font-medium max-w-sm">
            Tidak ada mata kuliah yang sesuai dengan kategori ini.
          </p>
        </div>
      )}

      {/* GRID DATA KELAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const totalBab =
            course._count?.chapters || course.chapters?.length || 0;
          const totalMhs = course._count?.enrollments || 0;
          const formattedPrice = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(course.price || 0);

          return (
            <div
              key={course.id}
              className={`bg-white/80 backdrop-blur-xl rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border flex flex-col h-full overflow-hidden group ${course.status === "REJECTED" ? "border-rose-300 shadow-rose-100/50 shadow-md" : "border-slate-200/60"}`}
            >
              {/* TOP STATUS BADGES */}
              <div
                className={`flex justify-between items-center px-5 py-3 border-b shrink-0 ${course.status === "REJECTED" ? "bg-rose-50/80 border-rose-100" : "bg-white/50 border-slate-100"}`}
              >
                {course.status === "REJECTED" ? (
                  <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-rose-700 bg-white px-2 py-1 rounded border border-rose-300 shadow-xs animate-pulse">
                    <XCircle size={10} /> Diturunkan Paksa
                  </span>
                ) : course.visibility === "PUBLIC" ? (
                  <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                    <Globe size={10} /> Kelas Publik
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-100">
                    <Lock size={10} /> Rahasia
                  </span>
                )}

                {course.status === "REJECTED" ? (
                  <button
                    onClick={() => openReasonModal(course.takedown_reason)}
                    className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded shadow-xs transition-colors cursor-pointer"
                  >
                    <Eye size={10} /> Cek Alasan
                  </button>
                ) : course.is_published ? (
                  <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                    <CheckCircle2 size={10} /> Dipublikasi
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                    <FileEdit size={10} /> Draf Tertutup
                  </span>
                )}
              </div>

              {/* CARD BODY */}
              <div className="p-5 flex-1 flex flex-col bg-white relative">
                {course.status === "REJECTED" && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[0.5px] pointer-events-none z-0" />
                )}

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div
                    className={`w-10 h-10 border rounded-lg flex items-center justify-center shadow-sm shrink-0 ${course.status === "REJECTED" ? "bg-rose-50 border-rose-200 text-rose-600" : course.type === "PROJECT_BASED" ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-slate-50 border-slate-200 text-slate-600"}`}
                  >
                    <BookOpen size={20} strokeWidth={2.5} />
                  </div>
                  {course.type === "PROJECT_BASED" ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100 flex items-center gap-1">
                      <Sparkles size={10} /> Premium
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 flex items-center gap-1">
                      <Tag size={10} /> Akses Bebas
                    </span>
                  )}
                </div>

                <h2
                  className={`text-base font-bold leading-snug mb-1.5 line-clamp-2 transition-colors relative z-10 ${course.status === "REJECTED" ? "text-slate-500 line-through" : "text-slate-900 group-hover:text-indigo-600"}`}
                >
                  {course.title}
                </h2>

                {course.status === "REJECTED" ? (
                  <div className="bg-rose-50 text-rose-700 text-[11px] font-bold p-2.5 rounded-lg border border-rose-100 mt-1 mb-3 flex items-start gap-1.5 animate-pulse relative z-10">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>
                      Kurikulum ini ditutup paksa oleh pusat karena melanggar
                      aturan sistem.
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] font-medium text-slate-500 line-clamp-2 mb-4 flex-1 relative z-10">
                    {course.description ||
                      "Silabus ini belum memiliki keterangan. Silakan edit detail kelas Anda."}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0 relative z-10">
                  {course.type === "PROJECT_BASED" && course.price > 0 ? (
                    <div className="font-black text-sm text-slate-900">
                      {formattedPrice}
                    </div>
                  ) : (
                    <div className="font-bold text-[10px] text-emerald-600 uppercase tracking-widest">
                      Akses Bebas Biaya
                    </div>
                  )}
                  {course.visibility === "PRIVATE" && course.access_code && (
                    <button
                      onClick={() => copyAccessCode(course.access_code)}
                      className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest bg-slate-50 text-slate-700 px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors"
                      title="Salin Kunci"
                    >
                      <KeyRound size={10} /> {course.access_code}{" "}
                      <Copy size={10} className="text-slate-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* CARD FOOTER */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-3 shrink-0">
                <div className="flex gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <span className="flex-1 flex justify-center items-center gap-1.5 bg-white border border-slate-200 py-1.5 rounded-lg shadow-sm">
                    <LayoutList size={12} className="text-slate-400" />{" "}
                    {totalBab} Bab
                  </span>
                  <span className="flex-1 flex justify-center items-center gap-1.5 bg-white border border-slate-200 py-1.5 rounded-lg shadow-sm">
                    <Users size={12} className="text-slate-400" /> {totalMhs}{" "}
                    Siswa
                  </span>
                  {course.visibility === "PRIVATE" &&
                    course.status !== "REJECTED" && (
                      <button
                        onClick={() => handleShareLink(course.id, course.title)}
                        className="flex-1 flex justify-center items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white py-1.5 rounded-lg transition-colors shadow-sm"
                        title="Bagikan Tautan"
                      >
                        <Share2 size={12} /> Tautan
                      </button>
                    )}
                </div>

                {course.status === "REJECTED" ? (
                  <button
                    disabled
                    className="w-full bg-slate-200 border border-slate-300 text-slate-400 py-2.5 text-[11px] font-bold rounded-lg uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    Modul Terkunci Gembok ROOT
                  </button>
                ) : (
                  <Link
                    to={`/courses/${course.id}`}
                    className="w-full bg-slate-950 border border-slate-900 text-white hover:bg-slate-800 shadow-sm py-2.5 text-[11px] font-bold rounded-lg uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Kelola Modul <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DETAIL REJECTED */}
      <dialog
        id="modal_alasan_ban"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box bg-white/95 backdrop-blur-2xl rounded-2xl p-0 max-w-md border border-slate-200/60 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="p-4 sm:p-5 border-b border-rose-100 flex justify-between items-center bg-rose-50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <AlertTriangle size={14} strokeWidth={2.5} /> Rincian Pelanggaran
              Kurikulum
            </h3>
            <form method="dialog">
              <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition-colors cursor-pointer">
                ✕
              </button>
            </form>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Superadmin telah membekukan sementara kurikulum ini dari peredaran
              publik karena alasan berikut:
            </p>
            <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-100 whitespace-pre-line text-xs font-semibold text-rose-900 leading-normal shadow-inner">
              {banReason}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 p-3 rounded-lg text-center border border-slate-200">
              💡 Silakan hubungi admin pusat atau perbaiki silabus materi Anda.
            </div>
          </div>
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

export default CoursesLecturer;
