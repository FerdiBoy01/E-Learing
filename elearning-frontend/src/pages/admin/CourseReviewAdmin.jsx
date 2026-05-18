import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  Code,
  Award,
  Coins,
  Zap,
  X,
  ChevronLeft,
  Info,
  Briefcase,
  LayoutList,
} from "lucide-react";
import api from "../../config/axios";
import toast from "../../utils/toast";

const CourseReviewAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Form Approval
  const [points, setPoints] = useState(0);
  const [exp, setExp] = useState(500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview State
  const [previewMaterial, setPreviewMaterial] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/admin/courses/${id}/review`);
        setCourse(res.data.data);
        setPoints(res.data.data.reward_points || 0);
        setExp(res.data.data.reward_exp || 500);
      } catch (err) {
        toast.error("Gagal mengambil data review kurikulum");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleAction = async (status) => {
    setIsSubmitting(true);
    try {
      await api.put(`/admin/courses/${id}/approve`, {
        status,
        reward_points: parseInt(points) || 0,
        reward_exp: parseInt(exp) || 0,
      });
      toast.success(`Kurikulum berhasil di-${status.toLowerCase()}!`);
      navigate("/admin/courses");
    } catch (err) {
      toast.error("Gagal memproses keputusan approval");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPreview = (material) => {
    setPreviewMaterial(material);
    document.getElementById("modal_preview_material").showModal();
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka || 0);
  };

  if (loading)
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <span className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></span>
      </div>
    );

  return (
    <div className="max-w-[1500px] mx-auto font-sans pb-24 pt-2 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* HEADER NAVIGATION PANEL (Apple Glassmorphism)                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 p-4 border border-slate-200/60 bg-white/60 backdrop-blur-xl sticky top-0 z-40 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
          >
            <ChevronLeft size={16} strokeWidth={2.5} /> Kembali
          </button>
          <div className="h-5 w-px bg-slate-300 hidden sm:block"></div>
          <h1 className="font-bold text-slate-900 hidden sm:flex items-center gap-2 text-sm uppercase tracking-wider">
            <Layers size={16} /> Quality Gate Review
          </h1>
        </div>

        {/* Tombol Eksekusi Atas */}
        <div className="flex gap-2 w-full md:w-auto justify-end mt-4 md:mt-0">
          <button
            onClick={() => handleAction("REJECTED")}
            disabled={isSubmitting}
            className="bg-white border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 hover:border-rose-200 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
          >
            Tolak
          </button>
          <button
            onClick={() => handleAction("APPROVED")}
            disabled={isSubmitting}
            className="bg-slate-900 hover:bg-slate-800 text-white border-none rounded-xl px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
          >
            Approve & Publish
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEPARATOR GRID CONTENT                                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* KOLOM KIRI: STRUKTUR SILABUS */}
        <div className="lg:col-span-2 space-y-4">
          {/* Rangkuman Detail Kelas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200">
                {course?.visibility} ACCESS
              </span>
              <span className="bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200">
                {course?.type}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
              {course?.title}
            </h2>
            <p className="text-slate-600 text-xs font-medium leading-relaxed">
              {course?.description || "Tidak melampirkan info deskripsi dasar."}
            </p>
          </div>

          {/* List Silabus Konten */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                <LayoutList size={14} /> Berkas Struktur Materi
              </h3>
            </div>

            <div className="p-5 space-y-4 bg-slate-50/30">
              {!course?.chapters || course.chapters.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Silabus Kosong
                </div>
              ) : (
                course.chapters.map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                  >
                    {/* Judul Bab */}
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                      <div className="w-5 h-5 bg-slate-900 text-white rounded flex items-center justify-center text-[10px] font-black">
                        {idx + 1}
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs">
                        {ch.title}
                      </h4>
                    </div>

                    {/* Materi di dalam Bab */}
                    <div className="p-2 space-y-1 bg-white">
                      {!ch.materials || ch.materials.length === 0 ? (
                        <div className="text-center py-2 text-[10px] text-slate-400 font-medium">
                          Modul bab ini kosong.
                        </div>
                      ) : (
                        ch.materials.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors group"
                          >
                            <div className="flex items-center gap-3 overflow-hidden mr-4">
                              <div className="w-7 h-7 rounded bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                                {m.type === "LESSON" ? (
                                  <FileText size={13} />
                                ) : m.type === "QUIZ" ? (
                                  <HelpCircle size={13} />
                                ) : (
                                  <Code size={13} />
                                )}
                              </div>
                              <div className="overflow-hidden">
                                <span className="font-bold text-xs text-slate-800 block truncate">
                                  {m.title}
                                </span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mt-0.5">
                                  {m.type}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => openPreview(m)}
                              className="bg-white border border-slate-200 hover:border-slate-400 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm shrink-0 transition-colors cursor-pointer"
                            >
                              Inspeksi
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: EVALUASI REWARD */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Award size={16} className="text-slate-900" />
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest">
                Penilaian & Reward
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Alokasi NusaPoints (Harga Kelas)
                </label>
                <div className="relative">
                  <Coins
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={14}
                  />
                  <input
                    type="number"
                    min="0"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-xl text-sm font-black text-slate-900 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Alokasi Bonus EXP (Poin Kelulusan)
                </label>
                <div className="relative">
                  <Zap
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={14}
                  />
                  <input
                    type="number"
                    min="0"
                    value={exp}
                    onChange={(e) => setExp(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-xl text-sm font-black text-slate-900 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card Metadata Asal Kurikulum */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
              <span className="font-bold text-slate-400 uppercase text-[9px] tracking-widest flex items-center gap-1">
                <Briefcase size={12} /> Kreator
              </span>
              <span className="font-bold text-slate-800">
                {course?.lecturer?.name || "Asisten Dosen"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
              <span className="font-bold text-slate-400 uppercase text-[9px] tracking-widest flex items-center gap-1">
                <Info size={12} /> Bisnis Model
              </span>
              <span className="font-black text-slate-800 uppercase text-[9px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {course?.type}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-400 uppercase text-[9px] tracking-widest flex items-center gap-1">
                <Coins size={12} /> Harga Jual
              </span>
              <span className="font-black text-slate-900 text-sm tracking-tight">
                {formatRupiah(course?.price)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL INPEKSI PREVIEW MATERI HTML SAFE (APPLE GLASSMORPHISM)               */}
      {/* ========================================================================= */}
      <dialog
        id="modal_preview_material"
        className="modal modal-bottom sm:modal-middle"
      >
        {/* Box modal diubah jadi frosted glass elegan */}
        <div className="modal-box w-full max-w-4xl bg-white/90 backdrop-blur-2xl rounded-2xl p-0 h-[80vh] flex flex-col border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          {/* Header Modal */}
          <div className="p-4 sm:p-5 border-b border-slate-200/50 flex justify-between items-center bg-white/40 shrink-0">
            <div>
              <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                {previewMaterial?.type === "LESSON" ? (
                  <FileText size={16} />
                ) : previewMaterial?.type === "QUIZ" ? (
                  <HelpCircle size={16} />
                ) : (
                  <Code size={16} />
                )}
                {previewMaterial?.title || "Inspeksi Lembar Konten"}
              </h3>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1 block">
                Format: {previewMaterial?.type}
              </span>
            </div>
            <form method="dialog">
              <button className="w-8 h-8 rounded-full bg-slate-100/80 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
                <X size={16} strokeWidth={2.5} />
              </button>
            </form>
          </div>

          {/* Area Rangkuman Isi HTML Konten */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar bg-transparent">
            {previewMaterial?.content ? (
              <div className="material-review-html w-full text-slate-800">
                <style>{`
                  .material-review-html p { color: #334155; line-height: 1.8; margin-bottom: 1.25rem; font-size: 0.95rem; text-align: justify; }
                  .material-review-html h1, .material-review-html h2, .material-review-html h3 { color: #0f172a; font-weight: 800; margin-top: 1.75rem; margin-bottom: 0.75rem; }
                  .material-review-html h1 { font-size: 1.4rem; }
                  .material-review-html h2 { font-size: 1.25rem; }
                  .material-review-html ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-bottom: 1.25rem !important; }
                  .material-review-html ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-bottom: 1.25rem !important; }
                  .material-review-html li { margin-bottom: 0.4rem !important; color: #475569; font-size: 0.95rem; }
                  .material-review-html table { width: 100% !important; margin: 1.5rem 0 !important; border-collapse: collapse !important; border: 1px solid #e2e8f0 !important; display: block !important; overflow-x: auto !important; }
                  .material-review-html th, .material-review-html td { border: 1px solid #cbd5e1 !important; padding: 10px 12px !important; text-align: left; min-width: 90px; }
                  .material-review-html th { background-color: #f8fafc !important; font-weight: 700 !important; color: #0f172a !important; }
                  .material-review-html code:not(pre code) { background-color: #f1f5f9 !important; color: #0f172a !important; padding: 2px 5px !important; border-radius: 4px !important; font-family: ui-monospace, monospace !important; font-size: 0.85em !important; font-weight: 600 !important; border: 1px solid #e2e8f0 !important; }
                  .material-review-html .ql-syntax, .material-review-html pre { background: #0f172a !important; color: #f8fafc !important; padding: 2.2rem 1.25rem 1.25rem !important; border-radius: 0.75rem !important; font-family: ui-monospace, monospace !important; font-size: 0.85rem !important; line-height: 1.6 !important; overflow-x: auto !important; position: relative !important; margin: 1.5rem 0 !important; }
                  .material-review-html .ql-syntax::before, .material-review-html pre::before { content: ''; position: absolute; top: 0.9rem; left: 12px; width: 0.5rem; height: 0.5rem; border-radius: 50%; background: #ef4444; box-shadow: 0.8rem 0 0 #f59e0b, 1.6rem 0 0 #10b981; }
                `}</style>
                <div
                  dangerouslySetInnerHTML={{ __html: previewMaterial.content }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60 py-20">
                <FileText size={36} className="mb-2 text-slate-300" />
                <p className="font-bold text-xs uppercase tracking-wider">
                  Lembar Kosong
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Materi ini tidak memiliki lampiran teks / kodingan.
                </p>
              </div>
            )}
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

export default CourseReviewAdmin;
