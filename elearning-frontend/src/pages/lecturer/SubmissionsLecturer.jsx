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
} from "lucide-react";
import api from "../../config/axios";
import useAuthStore from "../../store/authStore";

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
      fetchSubmissions();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan nilai");
    } finally {
      setIsSaving(false);
    }
  };

  const openGradeModal = (sub) => {
    setSelected(sub);
    setScore(sub.score || "");
    setFeedback(sub.feedback || "");
  };

  if (user?.role !== "LECTURER")
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-rose-500 text-xl">
        Akses Ditolak. Khusus Dosen.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto pb-20 font-sans px-4 pt-8 text-slate-800">
      {/* HEADER DASHBOARD (Clean & Professional) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-4">
            <span className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FileText size={28} strokeWidth={2.5} />
            </span>
            Pusat Penilaian
          </h1>
          <p className="text-slate-500 font-medium mt-3 max-w-xl text-base">
            Evaluasi tugas koding mahasiswa Anda. Berikan skor dan masukan yang
            membangun.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 px-6 py-4 rounded-xl flex items-center gap-3 mt-4 md:mt-0">
          <Clock size={22} className="text-amber-500" strokeWidth={2.5} />
          <span className="font-bold text-amber-700 text-base">
            {
              submissions.filter((s) => s.status === "PENDING" || !s.score)
                .length
            }{" "}
            Tugas Menunggu
          </span>
        </div>
      </div>

      {/* DAFTAR TUGAS (CARD LAYOUT - Clean) */}
      <div className="grid grid-cols-1 gap-5">
        {loading ? (
          <div className="text-center py-20">
            <span className="loading loading-spinner loading-lg text-blue-600"></span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-20 text-center shadow-sm">
            <Search
              size={48}
              className="mx-auto mb-4 text-slate-300"
              strokeWidth={2}
            />
            <p className="font-bold text-xl text-slate-400">
              Belum Ada Tugas Masuk
            </p>
          </div>
        ) : (
          submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow"
            >
              {/* Info Mahasiswa & Materi */}
              <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                <div className="w-14 h-14 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {sub.student?.avatar_url ? (
                    <img
                      src={sub.student.avatar_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User
                      size={24}
                      className="text-slate-400"
                      strokeWidth={2}
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 mb-1">
                    {sub.student?.name || "Anonim"}
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    Tugas:{" "}
                    <span className="text-blue-600 font-semibold">
                      {sub.material?.title || "-"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Tautan Lampiran (GitHub & Gambar) */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {sub.submission_url && (
                  <a
                    href={sub.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold transition-colors"
                  >
                    <ExternalLink size={14} /> GitHub
                  </a>
                )}
                {sub.image_url && (
                  <button
                    onClick={() => openGradeModal(sub)}
                    className="btn btn-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 font-bold transition-colors"
                  >
                    <ImageIcon size={14} /> Bukti SS
                  </button>
                )}
              </div>

              {/* Status & Action */}
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6 mt-2 md:mt-0">
                <div className="text-center">
                  <p className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Status
                  </p>
                  {sub.status === "PENDING" || !sub.score ? (
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md font-bold text-xs">
                      Menunggu
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md font-bold text-xs">
                      Dinilai
                    </span>
                  )}
                </div>

                <div className="text-center min-w-[60px]">
                  <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    Skor
                  </p>
                  <p className="text-2xl font-black text-slate-800">
                    {sub.score ?? "--"}
                  </p>
                </div>

                <button
                  onClick={() => openGradeModal(sub)}
                  className={`btn font-bold rounded-xl px-6 h-auto py-2.5 transition-colors ${sub.status === "PENDING" || !sub.score ? "bg-blue-600 hover:bg-blue-700 text-white border-none" : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-300"}`}
                >
                  {sub.status === "PENDING" || !sub.score
                    ? "Periksa"
                    : "Ubah Nilai"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================= */}
      {/* MODAL PEMERIKSAAN (SPLIT-VIEW)             */}
      {/* ========================================= */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative border border-slate-200">
            {/* Tombol Close Absolute */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 btn btn-sm btn-circle bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 shadow-sm transition-colors"
            >
              <X size={18} />
            </button>

            {/* SISI KIRI: Bukti Gambar & Link */}
            <div className="w-full md:w-1/2 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto p-8">
              <h4 className="font-bold text-slate-700 text-sm mb-5 flex items-center gap-2">
                <ImageIcon size={18} className="text-slate-400" /> Lampiran
                Mahasiswa
              </h4>

              {selected.image_url ? (
                <div className="rounded-xl overflow-hidden shadow-sm bg-white mb-6 border border-slate-200">
                  <img
                    src={selected.image_url}
                    alt="Screenshot Tugas"
                    className="w-full h-auto object-contain bg-slate-100"
                  />
                </div>
              ) : (
                <div className="h-64 mb-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-medium bg-white">
                  <ImageIcon size={32} className="mb-3 text-slate-300" />
                  Tidak Melampirkan Screenshot
                </div>
              )}

              {selected.submission_url && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-bold uppercase text-slate-400 mb-2 tracking-wider">
                    Tautan Repository
                  </p>
                  <a
                    href={selected.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-semibold break-all flex items-start gap-2 hover:underline text-sm"
                  >
                    <ExternalLink size={16} className="shrink-0 mt-0.5" />{" "}
                    {selected.submission_url}
                  </a>
                </div>
              )}
            </div>

            {/* SISI KANAN: Form Penilaian */}
            <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white flex flex-col">
              <div className="mb-8 pb-6 border-b border-slate-100 mt-4 md:mt-0">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {selected.student?.name}
                </h2>
                <p className="font-semibold text-slate-500 text-sm flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" />{" "}
                  {selected.material?.title}
                </p>
              </div>

              <form
                onSubmit={handleGradeSubmit}
                className="flex-1 flex flex-col"
              >
                <div className="mb-6">
                  <label className="block font-bold text-sm mb-2 flex items-center gap-2 text-slate-700">
                    <Award size={18} className="text-amber-500" /> Skor Akhir
                    (0-100)
                  </label>
                  <input
                    type="number"
                    max="100"
                    min="0"
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="input w-full md:w-1/2 bg-slate-50 border border-slate-200 text-3xl font-black focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl h-16 text-center text-blue-600 transition-all"
                    placeholder="0"
                  />
                </div>

                <div className="mb-8 flex-1">
                  <label className="block font-bold text-sm mb-2 flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-2">
                      <MessageSquare size={18} className="text-blue-500" />{" "}
                      Catatan Evaluasi
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Opsional
                    </span>
                  </label>
                  <textarea
                    rows="6"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="textarea w-full bg-slate-50 border border-slate-200 font-medium text-base focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl leading-relaxed p-4 transition-all"
                    placeholder="Tuliskan masukan untuk mahasiswa di sini..."
                  />
                </div>

                <div className="flex gap-3 mt-auto">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="btn flex-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 h-auto py-3 font-bold rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !score}
                    className="btn flex-[2] bg-blue-600 hover:bg-blue-700 text-white border-none h-auto py-3 text-base font-bold rounded-xl shadow-sm transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    {isSaving ? "Menyimpan..." : "Simpan Penilaian"}
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
