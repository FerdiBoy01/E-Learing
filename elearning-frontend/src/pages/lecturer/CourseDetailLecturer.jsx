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
        "Silabus masih kosong! Tambahkan minimal 1 Bab dan Materi.",
      );
    }
    if (window.confirm("Ajukan kelas ini ke Admin untuk direview?")) {
      try {
        await api.put(`/courses/${courseId}`, {
          status: "PENDING",
          is_published: false,
        });
        toast.success("Pengajuan berhasil dikirim ke Admin!");
        fetchCourseDetail();
      } catch (err) {
        toast.error("Gagal mengajukan review kelas.");
      }
    }
  };

  const handleCancelReview = async () => {
    if (
      window.confirm("Batalkan pengajuan dan kembalikan kelas ke Mode Draf?")
    ) {
      try {
        await api.put(`/courses/${courseId}`, {
          status: "DRAFT",
          is_published: false,
        });
        toast.success("Pengajuan dibatalkan. Kelas kembali menjadi Draf.");
        fetchCourseDetail();
      } catch (err) {
        toast.error("Gagal membatalkan pengajuan.");
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
        toast.success("Kelas berhasil dihapus.");
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
    if (window.confirm("Yakin ingin menghapus Bab ini beserta isinya?")) {
      try {
        await api.delete(`/content/chapters/${chapterId}`);
        toast.success("Bab dihapus.");
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
      toast.success("Info materi diupdate!");
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
        toast.success("Materi dihapus.");
        fetchCourseDetail();
      } catch (err) {
        toast.error("Gagal menghapus materi.");
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`Kode akses berhasil disalin!`);
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case "LESSON":
        return (
          <div className="p-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-md shadow-sm">
            <FileText size={14} strokeWidth={2.5} />
          </div>
        );
      case "QUIZ":
        return (
          <div className="p-1.5 bg-amber-50 border border-amber-100 text-amber-500 rounded-md shadow-sm">
            <HelpCircle size={14} strokeWidth={2.5} />
          </div>
        );
      case "CHALLENGE":
        return (
          <div className="p-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-md shadow-sm">
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
    <div className="max-w-6xl mx-auto font-sans pb-24 pt-2 px-4 sm:px-6 animate-in fade-in duration-500">
      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 rounded-lg transition-colors mb-4 -ml-3"
      >
        <ChevronLeft size={16} /> Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* KOLOM KIRI: INFO KELAS */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200/60 relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {course?.visibility === "PUBLIC" ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wider shadow-sm">
                  <Globe size={12} /> Publik
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100 uppercase tracking-wider shadow-sm">
                  <Lock size={12} /> Privat
                </span>
              )}

              {course?.type === "PROJECT_BASED" ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 uppercase tracking-wider shadow-sm">
                  <Sparkles size={12} className="text-amber-500" /> Premium (
                  {formatRupiah(course?.price)})
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 uppercase tracking-wider shadow-sm">
                  <Tag size={12} className="text-slate-400" /> Gratis
                </span>
              )}

              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 uppercase tracking-wider shadow-sm">
                <Trophy size={12} className="text-indigo-500" />{" "}
                {course?.reward_points} Pts & {course?.reward_exp} EXP
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight leading-tight">
              {course?.title}
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl font-medium">
              {course?.description || "Belum ada deskripsi."}
            </p>

            {course?.visibility === "PRIVATE" && course?.access_code && (
              <div className="mt-6 flex items-center justify-between bg-slate-50 border border-slate-200 w-full sm:w-fit p-2 pr-4 rounded-xl shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="bg-white border border-slate-200 text-slate-500 p-2 rounded-lg shadow-sm">
                    <KeyRound size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Kunci Pendaftaran
                    </p>
                    <p className="text-slate-800 font-black tracking-widest text-sm leading-none mt-0.5">
                      {course?.access_code}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(course?.access_code)}
                  className="ml-6 p-2 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 transition-colors shadow-sm"
                  title="Salin Kunci"
                >
                  <Copy size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: STATUS & AKSI */}
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200/60 flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <Info size={18} className="text-slate-400" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
              Status Publikasi
            </h3>
          </div>

          <div
            className={`p-4 rounded-xl border mb-6 flex flex-col items-center justify-center text-center shadow-sm ${
              course?.status === "PENDING"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : course?.status === "PUBLISHED" || course?.is_published
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            {course?.status === "PENDING" ? (
              <div className="flex flex-col items-center">
                <Clock size={28} className="mb-2 text-amber-500 opacity-80" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Menunggu Review
                </span>
                <span className="text-[10px] font-medium mt-1 opacity-80">
                  Sedang diperiksa oleh Admin.
                </span>
              </div>
            ) : course?.status === "PUBLISHED" || course?.is_published ? (
              <div className="flex flex-col items-center">
                <CheckCircle2
                  size={28}
                  className="mb-2 text-emerald-500 opacity-80"
                />
                <span className="text-xs font-black uppercase tracking-widest">
                  Dipublikasikan
                </span>
                <span className="text-[10px] font-medium mt-1 opacity-80">
                  Dapat diakses mahasiswa.
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FileEdit
                  size={28}
                  className="mb-2 text-slate-400 opacity-80"
                />
                <span className="text-xs font-black uppercase tracking-widest">
                  Mode Draf
                </span>
                <span className="text-[10px] font-medium mt-1 opacity-80">
                  Tersembunyi dari katalog.
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5 mt-auto">
            {course?.status === "PUBLISHED" || course?.is_published ? (
              <button
                onClick={handleCancelReview}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <FileEdit size={14} className="text-slate-400" /> Turunkan ke
                Draf
              </button>
            ) : course?.status === "PENDING" ? (
              <button
                onClick={handleCancelReview}
                className="w-full bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 shadow-sm py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <X size={14} /> Batalkan Pengajuan
              </button>
            ) : (
              <button
                onClick={handleRequestReview}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <Send size={14} /> Ajukan Review
              </button>
            )}

            <button
              onClick={handleDeleteCourse}
              className="w-full bg-transparent hover:bg-rose-50 text-rose-500 border border-transparent hover:border-rose-100 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <Trash2 size={12} /> Hapus Permanen
            </button>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* BAGIAN SILABUS (Apple Finder Style)         */}
      {/* ========================================= */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200/60 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-200/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <LayoutList size={20} className="text-indigo-600" /> Struktur
              Silabus
            </h2>
            <p className="text-slate-500 mt-1 text-xs font-medium">
              Susun hierarki materi. Gunakan tombol 'Tambah Bab' untuk memulai.
            </p>
          </div>
          <button
            className="w-full sm:w-auto bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            onClick={() => {
              setIsEditingChapter(false);
              setChapterTitle("");
              setChapterOrder(course?.chapters?.length + 1 || 1);
              document.getElementById("modal_chapter").showModal();
            }}
          >
            <Plus size={16} strokeWidth={2.5} /> Tambah Bab Baru
          </button>
        </div>

        <div className="p-6 sm:p-8 bg-slate-50/30">
          {course?.chapters?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-200 shadow-sm">
                <BookOpen size={24} className="text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Silabus Masih Kosong
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto text-xs font-medium">
                Mulai susun struktur pembelajaran dengan menambahkan Bab pertama
                Anda.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {course?.chapters?.map((chapter, idx) => (
                <div
                  key={chapter.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group/chapter"
                >
                  <div className="bg-white px-5 py-4 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 border border-slate-200 text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
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
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
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
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                      >
                        <Plus size={12} strokeWidth={2.5} /> Materi Baru
                      </Link>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 bg-slate-50/50">
                    {!chapter.materials || chapter.materials.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400 font-bold bg-white rounded-lg border border-dashed border-slate-200">
                        Belum ada materi di bab ini.
                      </div>
                    ) : (
                      <ul className="relative space-y-1.5 before:absolute before:inset-y-3 before:left-[1.25rem] before:w-px before:bg-slate-200">
                        {chapter.materials.map((mat) => (
                          <li
                            key={mat.id}
                            className="relative flex justify-between items-center p-2.5 pl-10 hover:bg-white rounded-lg transition-colors group/mat border border-transparent hover:border-slate-200/60 hover:shadow-sm"
                          >
                            <div className="absolute left-[1.25rem] top-1/2 -mt-px w-4 h-px bg-slate-200"></div>

                            <div className="flex items-center gap-3">
                              {getMaterialIcon(mat.type)}
                              <div>
                                <span className="font-semibold text-xs text-slate-800 block mb-0.5">
                                  {mat.title}
                                </span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-500 tracking-wider uppercase shadow-sm">
                                  {mat.type}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover/mat:opacity-100 transition-opacity bg-white p-1 rounded-lg shadow-sm border border-slate-200">
                              <Link
                                to={`/courses/${courseId}/chapters/${chapter.id}/materials/${mat.id}/edit`}
                                className="px-2 py-1 rounded text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-1 transition-colors"
                              >
                                <FileEdit size={12} /> Tulis Konten
                              </Link>
                              <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
                              <button
                                onClick={() => openEditMaterialModal(mat)}
                                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                title="Edit Info"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteMaterial(mat.id)}
                                className="p-1.5 rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                title="Hapus Materi"
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

      <dialog id="modal_chapter" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl p-0 border border-slate-200 max-w-sm">
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              {isEditingChapter ? "Edit Info Bab" : "Tambah Bab Baru"}
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
                className="w-full px-3 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg text-xs font-semibold outline-none shadow-sm transition-colors"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Contoh: Pengenalan Dasar"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Urutan Tampil
              </label>
              <input
                type="number"
                min="1"
                className="w-24 px-3 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg text-sm font-black text-center outline-none shadow-sm transition-colors"
                value={chapterOrder}
                onChange={(e) => setChapterOrder(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                onClick={() => document.getElementById("modal_chapter").close()}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-colors"
              >
                Simpan Bab
              </button>
            </div>
          </form>
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-slate-900/20 backdrop-blur-sm"
        >
          <button>close</button>
        </form>
      </dialog>

      <dialog
        id="modal_edit_material"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl p-0 border border-slate-200 max-w-sm">
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Edit Info Materi
            </h3>
            <form method="dialog">
              <button className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm">
                <X size={14} />
              </button>
            </form>
          </div>
          <form onSubmit={handleSaveMaterial} className="p-6">
            <div className="bg-indigo-50 text-indigo-700 p-3 rounded-lg text-[10px] font-bold mb-5 flex gap-2 items-start border border-indigo-100 uppercase tracking-wide">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <p>Mengubah Judul Utama dan Jenis Tipe Materi Pembelajaran.</p>
            </div>
            <div className="mb-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Judul Materi
              </label>
              <input
                type="text"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg text-xs font-semibold outline-none shadow-sm transition-colors"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Tipe Materi
              </label>
              <select
                className="w-full px-3 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg text-xs font-bold outline-none shadow-sm transition-colors"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
              >
                <option value="LESSON">Lesson (Teori & Bacaan)</option>
                <option value="QUIZ">Quiz (Ujian Formatif)</option>
                <option value="CHALLENGE">
                  Challenge (Tugas Praktik/Kode)
                </option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                onClick={() =>
                  document.getElementById("modal_edit_material").close()
                }
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-colors"
              >
                Simpan Ubahan
              </button>
            </div>
          </form>
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-slate-900/20 backdrop-blur-sm"
        >
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default CourseDetailLecturer;
