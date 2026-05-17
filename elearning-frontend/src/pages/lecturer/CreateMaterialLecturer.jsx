import { useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Save,
  BookOpen,
  Code,
  HelpCircle,
  FileText,
  Image as ImageIcon,
  Table,
  Info,
  CheckSquare,
  Layers,
  Settings2,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import api from "../../config/axios";
import toast from "../../utils/toast";

const CreateMaterialLecturer = () => {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();

  // State Form
  const [matTitle, setMatTitle] = useState("");
  const [matType, setMatType] = useState("LESSON");
  const [matOrder, setMatOrder] = useState(1);
  const [content, setContent] = useState("");

  // State Loading
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // KONFIGURASI TOOLBAR QUILL (Tegas & Minimalis)
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block", "link"],
      ["clean"],
    ],
  };

  // TEMPLATE SISIPAN KOMPONEN
  const templateCode =
    "<pre class='ql-syntax' spellcheck='false'>// Tulis baris kode di sini...</pre><p><br></p>";
  const templateTable =
    "<table border='1' style='width: 100%; border-collapse: collapse; border-color: #e2e8f0;'><tbody><tr><th style='padding: 10px; background: #f8fafc; text-align: left;'>Header 1</th><th style='padding: 10px; background: #f8fafc; text-align: left;'>Header 2</th></tr><tr><td style='padding: 10px;'>Data 1</td><td style='padding: 10px;'>Data 2</td></tr></tbody></table><p><br></p>";
  const templateInfo =
    "<blockquote style='border-left: 4px solid #0f172a; background: #f8fafc; padding: 12px; margin: 16px 0; color: #334155;'><strong>INFORMASI:</strong><br/>Tulis catatan untuk mahasiswa di sini...</blockquote><p><br></p>";
  const templateChecklist =
    "<ul style='list-style-type: none; padding-left: 0;'><li><input type='checkbox' disabled /> Item Tugas 1</li><li><input type='checkbox' checked disabled /> Item Tugas 2</li></ul><p><br></p>";

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Maksimal gambar 2MB.");

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingImage(true);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageHtml = `<p><br></p><p><img src="${res.data.url}" alt="Attachment" style="max-width: 100%; border-radius: 4px; border: 1px solid #e2e8f0;" /></p><p><br></p>`;
      setContent((prev) => prev + imageHtml);
      toast.success("Media disisipkan.");
    } catch (error) {
      toast.error("Gagal mengunggah media.");
    } finally {
      setUploadingImage(false);
      e.target.value = null;
    }
  };

  const insertTemplate = (template) => setContent((prev) => prev + template);

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await api.post(`/content/chapters/${chapterId}/materials`, {
        title: matTitle,
        type: matType,
        content: matType === "CHALLENGE" ? "" : content,
        order_index: parseInt(matOrder),
      });
      toast.success("Materi dipublikasikan.");
      navigate(`/courses/${courseId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto pb-20 font-sans px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* HEADER NAV (Strict & Professional)                                        */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between mb-6 p-4 border-b border-slate-200/80 bg-white/70 backdrop-blur-2xl sticky top-0 z-50 mt-4 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <Link
            to={`/courses/${courseId}`}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            <ChevronLeft size={16} strokeWidth={2.5} /> Kembali
          </Link>
          <div className="h-5 w-px bg-slate-300 hidden sm:block"></div>
          <h1 className="font-bold text-slate-900 hidden sm:flex items-center gap-2 text-sm uppercase tracking-wider">
            <Layers size={16} /> Mode Editor
          </h1>
        </div>
        <button
          onClick={handleSaveMaterial}
          disabled={submitLoading || !matTitle}
          className="bg-slate-900 hover:bg-slate-800 text-white border-none rounded-lg px-6 py-2.5 shadow-sm transition-all disabled:bg-slate-200 disabled:text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
        >
          {submitLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Save size={14} strokeWidth={2.5} /> Simpan Materi
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ========================================================================= */}
        {/* KOLOM KIRI: KONFIGURASI (Tegas & Clean)                                   */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
              <Settings2 size={16} className="text-slate-900" />
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest">
                Atribut Materi
              </h3>
            </div>

            {/* Opsi Format Tegas */}
            <div className="space-y-2.5 mb-6">
              <label
                className={`flex flex-col p-3.5 rounded-lg border cursor-pointer transition-all ${matType === "LESSON" ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900 shadow-sm" : "bg-white border-slate-200 hover:border-slate-400"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                    checked={matType === "LESSON"}
                    onChange={() => setMatType("LESSON")}
                  />
                  <span
                    className={`font-bold text-xs uppercase tracking-wider ${matType === "LESSON" ? "text-slate-900" : "text-slate-600"}`}
                  >
                    Teks / Teori
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 pl-6 leading-relaxed">
                  Editor konten penuh untuk materi bacaan.
                </span>
              </label>

              <label
                className={`flex flex-col p-3.5 rounded-lg border cursor-pointer transition-all ${matType === "CHALLENGE" ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900 shadow-sm" : "bg-white border-slate-200 hover:border-slate-400"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                    checked={matType === "CHALLENGE"}
                    onChange={() => setMatType("CHALLENGE")}
                  />
                  <span
                    className={`font-bold text-xs uppercase tracking-wider ${matType === "CHALLENGE" ? "text-slate-900" : "text-slate-600"}`}
                  >
                    Tugas Praktik
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 pl-6 leading-relaxed">
                  Wajib kumpul link repository / dokumen.
                </span>
              </label>

              <label
                className={`flex flex-col p-3.5 rounded-lg border cursor-pointer transition-all ${matType === "QUIZ" ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900 shadow-sm" : "bg-white border-slate-200 hover:border-slate-400"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                    checked={matType === "QUIZ"}
                    onChange={() => setMatType("QUIZ")}
                  />
                  <span
                    className={`font-bold text-xs uppercase tracking-wider ${matType === "QUIZ" ? "text-slate-900" : "text-slate-600"}`}
                  >
                    Kuis / Instruksi
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 pl-6 leading-relaxed">
                  Format bacaan untuk ujian tanpa form upload.
                </span>
              </label>
            </div>

            <div className="pt-5 border-t border-slate-100">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Posisi Tampil (Urutan)
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-lg text-sm font-black text-slate-900 outline-none transition-colors"
                value={matOrder}
                onChange={(e) => setMatOrder(e.target.value)}
                required
              />
            </div>
          </div>

          {/* KOMPONEN SISIPAN (Professional Tools) */}
          {(matType === "LESSON" || matType === "QUIZ") && (
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Code size={16} className="text-slate-900" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest">
                  Komponen Sisipan
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => insertTemplate(templateCode)}
                  className="bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-lg py-2.5 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Code
                    size={16}
                    strokeWidth={2.5}
                    className="text-slate-600"
                  />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Blok Kode
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate(templateTable)}
                  className="bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-lg py-2.5 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Table
                    size={16}
                    strokeWidth={2.5}
                    className="text-slate-600"
                  />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Tabel
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate(templateInfo)}
                  className="bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-lg py-2.5 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Info
                    size={16}
                    strokeWidth={2.5}
                    className="text-slate-600"
                  />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Catatan
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate(templateChecklist)}
                  className="bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-lg py-2.5 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <CheckSquare
                    size={16}
                    strokeWidth={2.5}
                    className="text-slate-600"
                  />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Checklist
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* KOLOM KANAN: EDITOR UTAMA (Ruang Putih Tegas)                             */}
        {/* ========================================================================= */}
        <div className="flex-1 bg-white/90 backdrop-blur-2xl rounded-xl border border-slate-200/80 shadow-sm flex flex-col min-h-[750px]">
          <div className="p-6 sm:p-10 flex flex-col h-full">
            <input
              type="text"
              className="w-full bg-transparent border-0 border-b-2 border-slate-200 focus:border-slate-900 rounded-none px-0 py-2 text-2xl sm:text-3xl font-black text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-0 mb-8 transition-colors"
              placeholder="Tuliskan Judul Materi..."
              value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)}
              required
            />

            {(matType === "LESSON" || matType === "QUIZ") && (
              <div className="flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                  <label className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-widest">
                    <FileText size={16} strokeWidth={2.5} />
                    Ruang Editor
                  </label>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploadingImage}
                      className="bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-400 text-slate-800 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors w-full sm:w-auto flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {uploadingImage ? (
                        <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <ImageIcon size={14} />
                      )}
                      {uploadingImage ? "Memproses..." : "Sisipkan Media"}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                {/* INJEKSI CSS REACT QUILL Yg Sangat Clean & Tegas */}
                <style>{`
                  .quill-custom {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                  }
                  .quill-custom .ql-toolbar.ql-snow {
                    border: none !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    background-color: #f8fafc !important;
                    padding: 12px 16px !important;
                    font-family: inherit !important;
                  }
                  .quill-custom .ql-container.ql-snow {
                    border: none !important;
                    background-color: #ffffff !important;
                    font-family: inherit !important;
                    font-size: 0.95rem !important;
                  }
                  .quill-custom .ql-editor {
                    min-height: 500px;
                    padding: 2rem 2.5rem !important;
                    line-height: 1.8 !important;
                    color: #1e293b !important;
                  }
                  .quill-custom .ql-editor.ql-blank::before {
                    left: 2.5rem;
                    font-style: normal;
                    color: #94a3b8;
                  }
                  .quill-custom .ql-editor h1, 
                  .quill-custom .ql-editor h2, 
                  .quill-custom .ql-editor h3 {
                    color: #0f172a !important;
                    font-weight: 800 !important;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                  }
                  .quill-custom .ql-editor pre.ql-syntax {
                    background-color: #0f172a !important; 
                    color: #f8fafc !important;
                    padding: 1.5rem !important;
                    border-radius: 6px !important;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
                    font-size: 0.85rem !important;
                    overflow-x: auto;
                  }
                  .quill-custom .ql-editor blockquote {
                    border-left: 4px solid #0f172a !important;
                    padding-left: 1rem !important;
                    color: #334155 !important;
                    background-color: #f8fafc !important;
                    padding: 1.2rem !important;
                    margin: 1.5rem 0 !important;
                    border-radius: 0 4px 4px 0;
                  }
                  .quill-custom .ql-snow.ql-toolbar button:hover,
                  .quill-custom .ql-snow.ql-toolbar button.ql-active {
                    background-color: #e2e8f0 !important;
                    border-radius: 4px;
                    color: #0f172a !important;
                  }
                `}</style>

                <div className="flex-1 flex flex-col focus-within:ring-2 focus-within:ring-slate-900 transition-shadow rounded-lg">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    placeholder={
                      matType === "LESSON"
                        ? "Ketik narasi materi di sini..."
                        : "Ketik instruksi pengerjaan kuis..."
                    }
                    className="quill-custom"
                  />
                </div>
              </div>
            )}

            {matType === "CHALLENGE" && (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-slate-50 border border-slate-200 rounded-xl mt-4">
                <div className="w-16 h-16 bg-white text-slate-900 rounded-xl flex items-center justify-center mb-5 shadow-sm border border-slate-200">
                  <Code size={32} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-slate-900 text-xl mb-2 tracking-tight">
                  Mode Penugasan Kode
                </h3>
                <p className="text-slate-500 max-w-sm text-xs font-medium leading-relaxed">
                  Editor teks dinonaktifkan. Mahasiswa hanya melihat instruksi
                  judul dan kolom untuk mengunggah URL Repository
                  (Github/Gitlab).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMaterialLecturer;
