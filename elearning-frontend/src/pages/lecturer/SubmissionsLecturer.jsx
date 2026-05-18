import { useEffect, useState } from "react";
import {
  FileText,
  ExternalLink,
  CheckCircle,
  Clock,
  X,
  Search,
  Image as ImageIcon,
  User,
  Award,
  MessageSquare,
  Layers,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import api from "../../config/axios";
import useAuthStore from "../../store/authStore";
import toast from "../../utils/toast";

const SubmissionsLecturer = () => {
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Modal Penilaian (Split-View)
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await api.get("/submissions/lecturer");
      const responseData = response.data.data;

      let finalData = [];
      if (Array.isArray(responseData)) {
        finalData = responseData;
      } else if (responseData && Array.isArray(responseData.submissions)) {
        finalData = responseData.submissions;
      }

      setSubmissions(finalData);
    } catch (error) {
      console.error("Gagal mengambil data", error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "LECTURER") {
      fetchSubmissions();
    }
  }, [user]);

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put(`/submissions/${selected.id}/grade`, {
        score: parseInt(score),
        feedback,
      });
      setSelected(null);
      setScore("");
      setFeedback("");
      toast.success("Evaluasi nilai berhasil disimpan!");
      fetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan nilai");
    } finally {
      setIsSaving(false);
    }
  };

  const openGradeModal = (sub) => {
    setSelected(sub);
    setScore(sub.score ?? "");
    setFeedback(sub.feedback || "");
  };

  if (user?.role !== "LECTURER")
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center font-bold text-rose-500 text-sm uppercase tracking-widest gap-2">
        <XCircle size={32} /> Akses Ditolak. Khusus Akun Pengajar.
      </div>
    );

  return (
    <div className="max-w-[1500px] mx-auto pb-20 font-sans p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300 relative overflow-x-hidden">
      {/* Ambient Background Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-slate-200 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* HEADER (Strict Dashboard Mode)                                            */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 p-6 bg-white border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] rounded-xl shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2.5 tracking-tight mb-1">
            <span className="p-2 bg-slate-900 text-white rounded-lg">
              <FileText size={16} strokeWidth={2.5} />
            </span>
            Pusat Penilaian & Evaluasi
          </h1>
          <p className="text-slate-500 font-medium text-xs max-w-xl">
            Tinjau hasil repositori penugasan praktik mahasiswa. Berikan skor
            angka dan umpan balik catatan evaluasi yang ketat.
          </p>
        </div>

        <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 shadow-sm">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100/50 text-amber-500 shrink-0">
            <Clock size={16} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Menunggu Review
            </p>
            <p className="text-sm font-black text-slate-900 mt-1 leading-none">
              {
                submissions.filter((s) => s.status === "PENDING" || !s.score)
                  .length
              }{" "}
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Berkas
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LIST DATA SUBMISSIONS                                                     */}
      {/* ========================================================================= */}
      <div className="relative z-10 space-y-3">
        {loading ? (
          <div className="h-[40vh] flex flex-col justify-center items-center">
            <span className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 p-16 rounded-xl text-center shadow-sm flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-3 border border-slate-200 shadow-sm text-slate-300">
              <Search size={22} />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1 uppercase tracking-wider">
              Antrean Kosong
            </h4>
            <p className="text-slate-400 text-[11px] font-medium max-w-xs">
              Belum ada mahasiswa yang mengumpulkan tugas pada ruang lingkup
              kelas Anda.
            </p>
          </div>
        ) : (
          submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:border-slate-300 transition-colors"
            >
              {/* Info Mahasiswa & Materi */}
              <div className="flex items-center gap-3.5 w-full md:w-auto flex-1 overflow-hidden">
                <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {sub.student?.avatar_url ? (
                    <img
                      src={sub.student.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User
                      size={16}
                      className="text-slate-400"
                      strokeWidth={2.5}
                    />
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-sm text-slate-900 truncate">
                    {sub.student?.name || "Anonymous Student"}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                    Modul:{" "}
                    <span className="text-slate-900 font-bold">
                      {sub.material?.title || "-"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Tautan Lampiran GITHUB & IMAGE */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-center">
                {sub.submission_url && (
                  <a
                    href={sub.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-slate-200 hover:border-slate-400 text-slate-700 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <ExternalLink size={12} strokeWidth={2.5} /> Repo GitHub
                  </a>
                )}
                {sub.image_url && (
                  <button
                    onClick={() => openGradeModal(sub)}
                    className="bg-white border border-slate-200 hover:border-slate-400 text-slate-700 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <ImageIcon size={12} strokeWidth={2.5} /> Hasil Atase SS
                  </button>
                )}
              </div>

              {/* Status & Action Panel */}
              <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5 mt-1 md:mt-0 shrink-0">
                <div className="text-center min-w-[70px]">
                  <p className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
                    Status
                  </p>
                  {sub.status === "PENDING" || !sub.score ? (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                      Menunggu
                    </span>
                  ) : (
                    <span className="bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                      Selesai
                    </span>
                  )}
                </div>

                <div className="text-center min-w-[50px]">
                  <p className="text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-widest">
                    Skor
                  </p>
                  <p className="text-lg font-black text-slate-900 tracking-tight">
                    {sub.score ?? "--"}
                  </p>
                </div>

                <button
                  onClick={() => openGradeModal(sub)}
                  className={`w-full sm:w-auto px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border shadow-sm cursor-pointer text-center ${
                    sub.status === "PENDING" || !sub.score
                      ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {sub.status === "PENDING" || !sub.score
                    ? "Evaluasi"
                    : "Ubah Nilai"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL VIEW EVALUASI (Split-View Premium Minimalis)                        */}
      {/* ========================================================================= */}
      {selected && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative border border-slate-200 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-20 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-colors cursor-pointer"
            >
              <X size={14} strokeWidth={2.5} />
            </button>

            {/* SISI KIRI: ATTACHMENT MEDIA */}
            <div className="w-full md:w-1/2 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-200/60 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200/60">
                <Layers size={14} className="text-slate-400" />
                <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-widest">
                  Berkas Kelulusan
                </h4>
              </div>

              {selected.image_url ? (
                <div className="rounded-lg overflow-hidden shadow-sm bg-white mb-5 border border-slate-200/80 p-1">
                  <img
                    src={selected.image_url}
                    alt="Screenshot Tugas"
                    className="w-full h-auto object-contain max-h-[40vh] md:max-h-[50vh] rounded"
                  />
                </div>
              ) : (
                <div className="h-44 mb-5 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg text-slate-400 font-medium bg-white text-xs">
                  <ImageIcon size={24} className="mb-2 text-slate-300" />
                  Mahasiswa tidak melampirkan gambar SS.
                </div>
              )}

              {selected.submission_url && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-[9px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest">
                    Tautan Tembusan Repository
                  </p>
                  <a
                    href={selected.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 font-bold break-all flex items-start gap-1.5 hover:underline text-xs"
                  >
                    <ExternalLink size={14} className="shrink-0 mt-0.5" />{" "}
                    {selected.submission_url}
                  </a>
                </div>
              )}
            </div>

            {/* SISI KANAN: FORM PENILAIAN */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto bg-white flex flex-col custom-scrollbar">
              <div className="mb-6 pb-5 border-b border-slate-100 mt-4 md:mt-0">
                <h2 className="text-lg font-black text-slate-900 mb-1 tracking-tight">
                  {selected.student?.name}
                </h2>
                <p className="font-bold text-slate-500 text-xs flex items-center gap-1.5">
                  <FileText size={14} className="text-slate-400" />{" "}
                  {selected.material?.title}
                </p>
              </div>

              <form
                onSubmit={handleGradeSubmit}
                className="flex-1 flex flex-col min-h-0"
              >
                {/* INPUT NILAI */}
                <div className="mb-5">
                  <label className="block font-bold text-xs uppercase tracking-widest text-slate-700 mb-2 flex items-center gap-1.5">
                    <Award size={14} className="text-slate-900" /> Input Nilai
                    Mahasiswa (0 - 100)
                  </label>
                  <input
                    type="number"
                    max="100"
                    min="0"
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-32 px-4 py-2 bg-slate-50 border border-slate-200 text-xl font-black text-slate-900 text-center focus:bg-white focus:border-slate-900 rounded-lg outline-none transition-all shadow-inner"
                    placeholder="0"
                  />
                </div>

                {/* FEEDBACK TEXTAREA */}
                <div className="mb-6 flex-1 flex flex-col min-h-0">
                  <label className="block font-bold text-xs uppercase tracking-widest text-slate-700 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-slate-900" />{" "}
                      Catatan Koreksi Instruktur
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold tracking-wide">
                      Opsional
                    </span>
                  </label>
                  <textarea
                    rows="5"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 font-medium text-xs focus:bg-white focus:border-slate-900 rounded-lg p-4 outline-none leading-relaxed transition-all resize-none flex-1"
                    placeholder="Tuliskan catatan perbaikan atau feedback code di sini..."
                  />
                </div>

                {/* ACTION TRIGGER BUTTONS */}
                <div className="flex gap-2 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !score}
                    className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <CheckCircle size={14} />
                    )}
                    {isSaving ? "Memproses..." : "Finalisasi Nilai"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsLecturer;
