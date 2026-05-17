import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  // 🔥 STATE BARU UNTUK PREVIEW MATERI
  const [previewMaterial, setPreviewMaterial] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/admin/courses/${id}/review`);
        setCourse(res.data.data);
        setPoints(res.data.data.reward_points);
        setExp(res.data.data.reward_exp);
      } catch (err) {
        toast.error("Gagal ambil data review");
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
        reward_points: points,
        reward_exp: exp,
      });
      toast.success(`Kelas berhasil di-${status}!`);
      navigate("/admin/courses");
    } catch (err) {
      toast.error("Gagal memproses approval");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 FUNGSI BUKA MODAL PREVIEW
  const openPreview = (material) => {
    setPreviewMaterial(material);
    document.getElementById("modal_preview_material").showModal();
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        <span className="loading loading-spinner loading-lg text-slate-800"></span>
      </div>
    );

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Review Kurikulum
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Periksa kualitas konten dan tentukan reward poin.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleAction("REJECTED")}
            disabled={isSubmitting}
            className="btn bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 font-bold"
          >
            <XCircle size={18} /> Tolak Kelas
          </button>
          <button
            onClick={() => handleAction("APPROVED")}
            disabled={isSubmitting}
            className="btn bg-emerald-600 text-white border-none hover:bg-emerald-700 font-bold"
          >
            <CheckCircle size={18} /> Setujui & Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KIRI: DAFTAR MATERI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <Layers size={20} className="text-blue-600" /> Struktur Silabus
            </h2>
            <div className="space-y-4">
              {course.chapters?.map((ch, idx) => (
                <div
                  key={ch.id}
                  className="border border-slate-200 rounded-2xl p-4 bg-slate-50"
                >
                  <h3 className="font-extrabold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-200 text-slate-600 rounded flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    {ch.title}
                  </h3>
                  <div className="space-y-2">
                    {ch.materials?.map((m) => (
                      <div
                        key={m.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm gap-3 transition-hover hover:border-blue-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            {m.type === "LESSON" ? (
                              <FileText size={16} className="text-blue-500" />
                            ) : m.type === "QUIZ" ? (
                              <HelpCircle
                                size={16}
                                className="text-amber-500"
                              />
                            ) : (
                              <Code size={16} className="text-indigo-500" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 text-sm block">
                              {m.title}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                              {m.type}
                            </span>
                          </div>
                        </div>

                        {/* 🔥 TOMBOL PREVIEW YANG SEKARANG BERFUNGSI */}
                        <button
                          className="btn btn-sm bg-blue-50 hover:bg-blue-100 text-blue-600 border-none font-bold shrink-0"
                          onClick={() => openPreview(m)}
                        >
                          <BookOpen size={14} /> Baca Isi
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KANAN: PENENTUAN POIN */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-6 rounded-3xl sticky top-8 shadow-xl border border-slate-800">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2">
              <Award size={20} className="text-amber-400" /> Tingkat Kesulitan
            </h2>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                  Tentukan Hadiah Poin
                </label>
                <div className="relative">
                  <Coins
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"
                    size={18}
                  />
                  <input
                    type="number"
                    min="0"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="input w-full bg-white/10 border-white/20 focus:border-amber-400 pl-12 font-black text-xl text-white"
                  />
                </div>
                <p className="text-[10px] mt-2 text-slate-400 font-medium">
                  Saran: Dasar (100), Menengah (500), Lanjut (1000+)
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                  Tentukan Bonus EXP
                </label>
                <div className="relative">
                  <Zap
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                    size={18}
                  />
                  <input
                    type="number"
                    min="0"
                    value={exp}
                    onChange={(e) => setExp(e.target.value)}
                    className="input w-full bg-white/10 border-white/20 focus:border-blue-400 pl-12 font-black text-xl text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-slate-400">
                  Instruktur
                </span>
                <span className="text-xs font-black">
                  {course.lecturer?.name}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-slate-400">
                  Model Bisnis
                </span>
                <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                  {course.type}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">
                  Harga Kelas
                </span>
                <span className="text-xs font-black">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(course.price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 MODAL BACA PREVIEW MATERI */}
      <dialog
        id="modal_preview_material"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box w-full max-w-4xl bg-white rounded-3xl p-0 h-[80vh] flex flex-col">
          {/* Header Modal */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
            <div>
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                {previewMaterial?.type === "LESSON" ? (
                  <FileText size={18} className="text-blue-500" />
                ) : previewMaterial?.type === "QUIZ" ? (
                  <HelpCircle size={18} className="text-amber-500" />
                ) : (
                  <Code size={18} className="text-indigo-500" />
                )}
                {previewMaterial?.title || "Preview Materi"}
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 block">
                Tipe: {previewMaterial?.type}
              </span>
            </div>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost text-slate-500 hover:bg-slate-200">
                <X size={18} />
              </button>
            </form>
          </div>

          {/* Isi Konten Materi */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-white">
            {previewMaterial?.content ? (
              // Pakai dangerouslySetInnerHTML karena biasanya teks materi dari Rich Text Editor (HTML)
              <div
                className="prose prose-slate max-w-none prose-headings:font-black prose-a:text-blue-600 prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: previewMaterial.content }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                <FileText size={48} className="mb-3" />
                <p className="font-bold">
                  Materi ini belum memiliki konten teks.
                </p>
              </div>
            )}
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-slate-900/60 backdrop-blur-sm"
        >
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default CourseReviewAdmin;
