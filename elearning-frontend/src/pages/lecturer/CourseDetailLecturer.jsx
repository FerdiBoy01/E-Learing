import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Code,
  Plus,
  ChevronLeft,
  LayoutList,
  X,
  Trash2,
  Edit,
  AlertTriangle,
  Globe,
  Lock,
  Tag,
  Sparkles,
  CheckCircle2,
  FileEdit,
  Copy,
  KeyRound,
  Trophy,
  Send,
  Clock,
  Info,
  Layers,
} from "lucide-react";
import api from "../../config/axios";
import toast from "../../utils/toast";

const CourseDetailLecturer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Modal
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterOrder, setChapterOrder] = useState(1);

  const [activeMaterialId, setActiveMaterialId] = useState(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialType, setMaterialType] = useState("LESSON");

  const fetchCourseDetail = async () => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data.data.course);
    } catch (error) {
      toast.error("Gagal mengambil detail kelas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetail();
    window.scrollTo(0, 0);
  }, [courseId]);

  const handleRequestReview = async () => {
    if (!course?.chapters || course.chapters.length === 0) {
      return toast.error(
        "Silabus masih kosong! Tambahkan minimal 1 Bab dan Materi sebelum mengajukan.",
      );
    }
    if (window.confirm("Ajukan silabus kelas ini ke Admin untuk direview?")) {
      try {
        await api.put(`/courses/${courseId}`, {
          status: "PENDING",
          is_published: false,
        });
        toast.success(
          "Pengajuan berhasil dikirim! Menunggu persetujuan Admin.",
        );
        fetchCourseDetail();
      } catch (err) {
        toast.error("Gagal mengajukan review kelas.");
      }
    }
  };

  const handleCancelReview = async () => {
    const msg =
      course?.status?.toUpperCase() === "PUBLISHED" || course?.is_published
        ? "Turunkan kelas dari publikasi dan kembalikan ke Mode Draf?"
        : "Batalkan pengajuan dan kembalikan kelas ke Mode Draf?";

    if (window.confirm(msg)) {
      try {
        await api.put(`/courses/${courseId}`, {
          status: "DRAFT",
          is_published: false,
        });
        toast.success("Kelas berhasil dikembalikan ke Mode Draf.");
        fetchCourseDetail();
      } catch (err) {
        toast.error("Gagal mengubah status kelas ke draf.");
      }
    }
  };

  const handleDeleteCourse = async () => {
    if (
      window.confirm(
        "PERINGATAN KERAS! 🚨\nYakin ingin menghapus kelas ini secara permanen?",
      )
    ) {
      try {
        await api.delete(`/courses/${courseId}`);
        toast.success("Kelas berhasil deleted.");
        navigate("/courses");
      } catch (err) {
        toast.error("Gagal menghapus kelas.");
      }
    }
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    try {
      if (isEditingChapter) {
        await api.put(`/content/chapters/${activeChapterId}`, {
          title: chapterTitle,
          order_index: parseInt(chapterOrder),
        });
      } else {
        await api.post(`/content/courses/${courseId}/chapters`, {
          title: chapterTitle,
          order_index: parseInt(chapterOrder),
        });
      }
      document.getElementById("modal_chapter").close();
      toast.success("Bab berhasil disimpan!");
      fetchCourseDetail();
    } catch (err) {
      toast.error("Gagal menyimpan bab");
    }
  };

  const openEditChapterModal = (chapter) => {
    setIsEditingChapter(true);
    setActiveChapterId(chapter.id);
    setChapterTitle(chapter.title);
    setChapterOrder(chapter.order_index || 1);
    document.getElementById("modal_chapter").showModal();
  };

  const handleDeleteChapter = async (chapterId) => {
    if (
      window.confirm("Yakin ingin menghapus Bab ini beserta seluruh isinya?")
    ) {
      try {
        await api.delete(`/content/chapters/${chapterId}`);
        toast.success("Bab berhasil dihapus.");
        fetchCourseDetail();
      } catch (err) {
        toast.error("Gagal menghapus bab.");
      }
    }
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/content/materials/${activeMaterialId}`, {
        title: materialTitle,
        type: materialType,
      });
      document.getElementById("modal_edit_material").close();
      toast.success("Info materi diperbarui!");
      fetchCourseDetail();
    } catch (err) {
      toast.error("Gagal mengupdate materi");
    }
  };

  const openEditMaterialModal = (mat) => {
    setActiveMaterialId(mat.id);
    setMaterialTitle(mat.title);
    setMaterialType(mat.type);
    document.getElementById("modal_edit_material").showModal();
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm("Yakin ingin menghapus materi ini?")) {
      try {
        await api.delete(`/content/materials/${materialId}`);
        toast.success("Materi berhasil dihapus.");
        fetchCourseDetail();
      } catch (err) {
        toast.error("Gagal menghapus materi.");
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`Kunci akses disalin!`);
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case "LESSON":
        return (
          <div className="p-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-md shadow-sm">
            <FileText size={14} strokeWidth={2.5} />
          </div>
        );
      case "QUIZ":
        return (
          <div className="p-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-md shadow-sm">
            <HelpCircle size={14} strokeWidth={2.5} />
          </div>
        );
      case "CHALLENGE":
        return (
          <div className="p-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-md shadow-sm">
            <Code size={14} strokeWidth={2.5} />
          </div>
        );
      default:
        return (
          <div className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-md shadow-sm">
            <FileText size={14} strokeWidth={2.5} />
          </div>
        );
    }
  };

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number || 0);

  // 🔥 SOLUSI UTAMA: Pengecekan super ketat anti string kosong / case-sensitive
  const dbStatus = course?.status ? course.status.toUpperCase() : "";
  let currentStatus = "DRAFT";

  if (dbStatus === "PUBLISHED" || course?.is_published === true) {
    currentStatus = "PUBLISHED";
  } else if (dbStatus === "PENDING") {
    currentStatus = "PENDING";
  } else {
    currentStatus = "DRAFT";
  }

  if (loading)
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <span className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></span>
        <p className="text-slate-500 text-sm font-semibold animate-pulse">
          Memuat data silabus...
        </p>
      </div>
    );

  return (
    <div className="max-w-[1500px] mx-auto font-sans pb-24 pt-2 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300 relative overflow-x-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-indigo-300/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* HEADER NAV */}
      <div className="flex items-center justify-between mb-6 p-4 border-b border-slate-200/80 bg-white/70 backdrop-blur-2xl sticky top-0 z-50 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <Link
            to="/courses"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            <ChevronLeft size={16} strokeWidth={2.5} /> Kembali ke Katalog
          </Link>
          <div className="h-5 w-px bg-slate-300 hidden sm:block"></div>
          <h1 className="font-bold text-slate-900 hidden sm:flex items-center gap-2 text-sm uppercase tracking-wider">
            <Layers size={16} /> Rincian Kelas
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-10">
        {/* KOLOM KIRI: INFO KELAS */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {course?.visibility === "PUBLIC" ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 uppercase tracking-wider shadow-sm">
                <Globe size={12} /> Katalog Publik
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 uppercase tracking-wider shadow-sm">
                <Lock size={12} /> Privat Tertutup
              </span>
            )}

            {course?.type === "PROJECT_BASED" ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-300 uppercase tracking-wider shadow-sm">
                <Sparkles size={12} className="text-amber-500" /> Premium (
                {formatRupiah(course?.price)})
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-300 uppercase tracking-wider shadow-sm">
                <Tag size={12} className="text-slate-500" /> Akses Gratis
              </span>
            )}

            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 uppercase tracking-wider shadow-sm">
              <Trophy size={12} className="text-slate-400" /> Reward:{" "}
              {course?.reward_points || 0} Pts & {course?.reward_exp || 0} EXP
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight leading-tight">
            {course?.title}
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed max-w-2xl font-medium">
            {course?.description || "Belum ada deskripsi spesifik."}
          </p>

          {course?.visibility === "PRIVATE" && course?.access_code && (
            <div className="mt-8 flex items-center justify-between bg-slate-50 border border-slate-200 w-full sm:w-fit p-2 pr-4 rounded-xl shadow-inner">
              <div className="flex items-center gap-3">
                <div className="bg-white border border-slate-200 text-slate-600 p-2 rounded-lg shadow-sm">
                  <KeyRound size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    Kunci Pendaftaran
                  </p>
                  <p className="text-slate-900 font-black tracking-widest text-sm leading-none mt-0.5">
                    {course?.access_code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(course?.access_code)}
                className="ml-6 p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
                title="Salin Kunci"
              >
                <Copy size={14} />
              </button>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: PUSAT KENDALI RILIS */}
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            <Info size={16} className="text-slate-900" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest">
              Pusat Kendali Rilis
            </h3>
          </div>

          <div
            className={`p-5 rounded-xl border mb-6 flex flex-col items-center justify-center text-center shadow-sm ${
              currentStatus === "PENDING"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : currentStatus === "PUBLISHED"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            {currentStatus === "PENDING" && (
              <div className="flex flex-col items-center">
                <Clock
                  size={28}
                  strokeWidth={2.5}
                  className="mb-2 text-amber-500"
                />
                <span className="text-xs font-black uppercase tracking-widest">
                  Menunggu Review Admin
                </span>
                <span className="text-[10px] font-medium mt-1.5 text-amber-700/80">
                  Silabus sedang diperiksa kelayakannya.
                </span>
              </div>
            )}
            {currentStatus === "PUBLISHED" && (
              <div className="flex flex-col items-center">
                <CheckCircle2
                  size={28}
                  strokeWidth={2.5}
                  className="mb-2 text-emerald-500"
                />
                <span className="text-xs font-black uppercase tracking-widest">
                  Dipublikasikan Aktif
                </span>
                <span className="text-[10px] font-medium mt-1.5 text-emerald-700/80">
                  Silabus dapat diakses mahasiswa.
                </span>
              </div>
            )}
            {currentStatus === "DRAFT" && (
              <div className="flex flex-col items-center">
                <FileEdit
                  size={28}
                  strokeWidth={2.5}
                  className="mb-2 text-slate-400"
                />
                <span className="text-xs font-black uppercase tracking-widest">
                  Mode Draf Tertutup
                </span>
                <span className="text-[10px] font-medium mt-1.5 text-slate-500">
                  Ajukan review setelah materi selesai disusun.
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5 mt-auto">
            {currentStatus === "PUBLISHED" && (
              <button
                onClick={handleCancelReview}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <FileEdit size={14} /> Tarik Jadi Draf
              </button>
            )}

            {currentStatus === "PENDING" && (
              <button
                onClick={handleCancelReview}
                className="w-full bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 shadow-sm py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <X size={14} strokeWidth={2.5} /> Batalkan Pengajuan
              </button>
            )}

            {currentStatus === "DRAFT" && (
              <button
                onClick={handleRequestReview}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <Send size={14} strokeWidth={2.5} /> Ajukan Ke Admin
              </button>
            )}

            <button
              onClick={handleDeleteCourse}
              className="w-full bg-transparent hover:bg-rose-50 text-rose-500 border border-transparent hover:border-rose-200 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <Trash2 size={12} strokeWidth={2.5} /> Hapus Permanen
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN SILABUS */}
      {/* ========================================================================= */}
      <div className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden relative z-10">
        <div className="p-6 sm:p-8 border-b border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <LayoutList size={20} className="text-slate-900" /> Struktur Modul
              Pembelajaran
            </h2>
            <p className="text-slate-500 mt-1 text-xs font-medium">
              Susun hierarki bab dan materi di sini sebelum diajukan ke Admin.
            </p>
          </div>
          <button
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            onClick={() => {
              setIsEditingChapter(false);
              setChapterTitle("");
              setChapterOrder(course?.chapters?.length + 1 || 1);
              document.getElementById("modal_chapter").showModal();
            }}
          >
            <Plus size={16} strokeWidth={2.5} /> Tambah Bab
          </button>
        </div>

        <div className="p-6 sm:p-8 bg-slate-50/50">
          {!course?.chapters || course.chapters.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm">
              <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
                <BookOpen size={24} className="text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
                Silabus Kosong
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto text-xs font-medium">
                Buat Bab pertama untuk memulai penyusunan kurikulum.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {course.chapters.map((chapter, idx) => (
                <div
                  key={chapter.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden group/chapter"
                >
                  <div className="bg-white px-5 py-4 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 border border-slate-200 text-slate-800 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                        {idx + 1}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {chapter.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="opacity-0 group-hover/chapter:opacity-100 transition-opacity flex gap-0.5 mr-2">
                        <button
                          onClick={() => openEditChapterModal(chapter)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit Bab"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chapter.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Bab"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <Link
                        to={`/courses/${courseId}/chapters/${chapter.id}/materials/new`}
                        className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                      >
                        <Plus size={12} strokeWidth={2.5} /> Materi Baru
                      </Link>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 bg-slate-50/50">
                    {!chapter.materials || chapter.materials.length === 0 ? (
                      <div className="text-center py-4 text-[11px] text-slate-400 font-bold uppercase tracking-widest bg-white rounded-lg border border-dashed border-slate-200">
                        Belum ada materi
                      </div>
                    ) : (
                      <ul className="relative space-y-1.5 before:absolute before:inset-y-3 before:left-[1.25rem] before:w-px before:bg-slate-200">
                        {chapter.materials.map((mat) => (
                          <li
                            key={mat.id}
                            className="relative flex justify-between items-center p-2.5 pl-10 hover:bg-white rounded-lg transition-colors group/mat border border-transparent hover:border-slate-200/80 hover:shadow-sm"
                          >
                            <div className="absolute left-[1.25rem] top-1/2 -mt-px w-4 h-px bg-slate-200"></div>

                            <div className="flex items-center gap-3">
                              {getMaterialIcon(mat.type)}
                              <div>
                                <span className="font-bold text-xs text-slate-800 block mb-0.5">
                                  {mat.title}
                                </span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500 tracking-wider uppercase shadow-sm">
                                  {mat.type}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover/mat:opacity-100 transition-opacity bg-white p-1 rounded-lg shadow-sm border border-slate-200">
                              <Link
                                to={`/courses/${courseId}/chapters/${chapter.id}/materials/${mat.id}/edit`}
                                className="px-2 py-1 rounded text-[10px] font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center gap-1 transition-colors uppercase tracking-wider"
                              >
                                <FileEdit size={12} /> Tulis Konten
                              </Link>
                              <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
                              <button
                                onClick={() => openEditMaterialModal(mat)}
                                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                title="Edit Atribut"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteMaterial(mat.id)}
                                className="p-1.5 rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL EDIT BAB & MATERI */}
      <dialog id="modal_chapter" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-0 border border-slate-200 max-w-sm">
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              {isEditingChapter ? "Ubah Info Bab" : "Buat Bab Baru"}
            </h3>
            <form method="dialog">
              <button className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm">
                <X size={14} />
              </button>
            </form>
          </div>
          <form onSubmit={handleSaveChapter} className="p-6">
            <div className="mb-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Judul Bab
              </label>
              <input
                type="text"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 focus:border-slate-900 rounded-lg text-xs font-semibold outline-none shadow-sm transition-colors"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Contoh: Modul Dasar"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Posisi Urutan
              </label>
              <input
                type="number"
                min="1"
                className="w-24 px-3 py-2.5 bg-white border border-slate-200 focus:border-slate-900 rounded-lg text-sm font-black text-center outline-none shadow-sm transition-colors"
                value={chapterOrder}
                onChange={(e) => setChapterOrder(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                onClick={() => document.getElementById("modal_chapter").close()}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
              >
                Simpan Bab
              </button>
            </div>
          </form>
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-slate-900/40 backdrop-blur-sm"
        >
          <button>close</button>
        </form>
      </dialog>

      <dialog
        id="modal_edit_material"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-0 border border-slate-200 max-w-sm">
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Ubah Atribut Materi
            </h3>
            <form method="dialog">
              <button className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm">
                <X size={14} />
              </button>
            </form>
          </div>
          <form onSubmit={handleSaveMaterial} className="p-6">
            <div className="bg-slate-50 text-slate-600 p-3 rounded-lg text-[10px] font-bold mb-5 flex gap-2 items-start border border-slate-200 uppercase tracking-wide">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <p>Mengubah Judul Utama dan Jenis Format Materi Pembelajaran.</p>
            </div>
            <div className="mb-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Judul Materi
              </label>
              <input
                type="text"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 focus:border-slate-900 rounded-lg text-xs font-semibold outline-none shadow-sm transition-colors"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Format Materi
              </label>
              <select
                className="w-full px-3 py-2.5 bg-white border border-slate-200 focus:border-slate-900 rounded-lg text-xs font-bold outline-none shadow-sm transition-colors"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
              >
                <option value="LESSON">Lesson (Teks/Teori)</option>
                <option value="QUIZ">Quiz (Instruksi Ujian)</option>
                <option value="CHALLENGE">Challenge (Kumpul Tugas/Link)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                onClick={() =>
                  document.getElementById("modal_edit_material").close()
                }
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
              >
                Terapkan
              </button>
            </div>
          </form>
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-slate-900/40 backdrop-blur-sm"
        >
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default CourseDetailLecturer;
