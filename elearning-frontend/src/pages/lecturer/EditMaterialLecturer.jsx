import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Save, BookOpen, Code, HelpCircle, FileText, 
  Image as ImageIcon, Table, Info, CheckSquare, Sparkles 
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 
import api from '../../config/axios';
import toast from '../../utils/toast';

const EditMaterialLecturer = () => {
  // Asumsi rute frontend lu: /courses/:courseId/chapters/:chapterId/materials/:materialId/edit
  const { courseId, chapterId, materialId } = useParams();
  const navigate = useNavigate();

  // State Form
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState('LESSON');
  const [matOrder, setMatOrder] = useState(1);
  const [content, setContent] = useState('');
  
  // State Loading
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // NARIK DATA LAMA
  useEffect(() => {
    const fetchMaterialDetail = async () => {
      try {
        const response = await api.get(`/content/materials/${materialId}`);
        const data = response.data.data.material;
        
        setMatTitle(data.title);
        setMatType(data.type);
        setMatOrder(data.order_index || 1);
        setContent(data.content || '');
      } catch (error) {
        toast.error('Gagal mengambil data materi. Pastikan materi masih ada.');
        navigate(`/courses/${courseId}`);
      } finally {
        setInitialLoading(false);
      }
    };

    if (materialId) fetchMaterialDetail();
  }, [materialId, courseId, navigate]);

  // KONFIGURASI TOOLBAR QUILL
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block', 'link'],
      ['clean'] 
    ],
  };

  // TEMPLATE MAGIC TOOLS
  const templateCode = "<pre class='ql-syntax' spellcheck='false'>// Ketik kodinganmu di sini...</pre><p><br></p>";
  const templateTable = "<table border='1' style='width: 100%; border-collapse: collapse;'><tbody><tr><td style='padding: 8px;'><strong>Judul Kolom 1</strong></td><td style='padding: 8px;'><strong>Judul Kolom 2</strong></td></tr><tr><td style='padding: 8px;'>Isi Baris 1</td><td style='padding: 8px;'>Isi Data</td></tr></tbody></table><p><br></p>";
  const templateInfo = "<blockquote><strong>💡 CATATAN PENTING:</strong><br/>Tulis pesan atau peringatan untuk mahasiswa di sini...</blockquote><p><br></p>";
  const templateChecklist = "<ul><li>[ ] Tugas 1 (Belum)</li><li>[x] Tugas 2 (Selesai)</li></ul><p><br></p>";

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 2MB ya!");
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = res.data.url;
      const imageHtml = `<p><br></p><p><img src="${imageUrl}" alt="Gambar Materi" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" /></p><p><br></p>`;
      setContent((prev) => prev + imageHtml);
      toast.success('Gambar disisipkan!');
      
    } catch (error) {
      toast.error('Gagal mengunggah gambar. Pastikan server API menyala.');
    } finally {
      setUploadingImage(false);
      e.target.value = null; 
    }
  };

  const insertTemplate = (template) => {
    setContent((prev) => prev + template);
  };

  // UPDATE KE BACKEND
  const handleUpdateMaterial = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      await api.put(`/content/materials/${materialId}`, {
        title: matTitle,
        type: matType,
        content: matType === 'CHALLENGE' ? '' : content,
        order_index: parseInt(matOrder)
      });
      
      toast.success('Perubahan materi berhasil disimpan!');
      navigate(`/courses/${courseId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan perubahan');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="min-h-screen flex flex-col gap-3 justify-center items-center"><span className="loading loading-spinner loading-lg text-slate-900"></span><p className="font-bold text-slate-500">Membaca materi...</p></div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-20 font-sans px-4 animate-in fade-in duration-500">
      
      {/* NAVBAR ATAS */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-6 z-50 mt-6 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-4">
          <Link to={`/courses/${courseId}`} className="btn btn-sm btn-ghost text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-xl">
            <ChevronLeft size={20} /> Batal Edit
          </Link>
          <div className="h-6 w-px bg-slate-200"></div>
          <h1 className="font-extrabold text-slate-900 flex items-center gap-2">
            <FileText size={18} className="text-slate-900" /> Mode Edit Materi
          </h1>
        </div>
        <button 
          onClick={handleUpdateMaterial} 
          disabled={submitLoading || !matTitle}
          className="btn btn-sm bg-slate-900 hover:bg-slate-800 text-white border-none rounded-xl px-6 shadow-md transition-all disabled:bg-slate-300 disabled:text-slate-500 font-bold"
        >
          {submitLoading ? <span className="loading loading-spinner"></span> : <><Save size={16} /> Update Materi</>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* KOLOM KIRI: KONFIGURASI */}
        <div className="w-full lg:w-[350px] flex-shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-900 mb-5 flex items-center gap-2">
              <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm">1</span> 
              Format Konten
            </h3>
            
            <div className="space-y-4">
              <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${matType === 'LESSON' ? 'bg-slate-50 border-slate-800 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                <input type="radio" name="mat_type" className="radio radio-neutral radio-sm mt-1" checked={matType === 'LESSON'} onChange={() => setMatType('LESSON')} />
                <div>
                  <span className={`block font-bold mb-0.5 ${matType === 'LESSON' ? 'text-slate-900' : 'text-slate-700'}`}>Materi Teori</span>
                  <span className="text-xs text-slate-500 font-medium leading-relaxed block">Materi bacaan lengkap. Bisa disisipi teks, gambar, tabel, dan kode.</span>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${matType === 'CHALLENGE' ? 'bg-rose-50 border-rose-500 shadow-sm' : 'bg-white border-slate-100 hover:border-rose-200'}`}>
                <input type="radio" name="mat_type" className="radio radio-error radio-sm mt-1" checked={matType === 'CHALLENGE'} onChange={() => setMatType('CHALLENGE')} />
                <div>
                  <span className={`block font-bold mb-0.5 ${matType === 'CHALLENGE' ? 'text-rose-800' : 'text-slate-700'}`}>Tugas Praktik</span>
                  <span className="text-xs text-slate-500 font-medium leading-relaxed block">Mahasiswa wajib mengumpulkan link repository GitHub.</span>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${matType === 'QUIZ' ? 'bg-amber-50 border-amber-500 shadow-sm' : 'bg-white border-slate-100 hover:border-amber-200'}`}>
                <input type="radio" name="mat_type" className="radio radio-warning radio-sm mt-1" checked={matType === 'QUIZ'} onChange={() => setMatType('QUIZ')} />
                <div>
                  <span className={`block font-bold mb-0.5 ${matType === 'QUIZ' ? 'text-amber-800' : 'text-slate-700'}`}>Kuis / Instruksi Tertulis</span>
                  <span className="text-xs text-slate-500 font-medium leading-relaxed block">Instruksi ringan tanpa wajib form upload file.</span>
                </div>
              </label>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <label className="label px-0"><span className="label-text font-bold text-slate-700 flex items-center gap-2">Urutan Tampil dalam Bab</span></label>
              <input type="number" min="1" className="input input-bordered bg-slate-50 focus:bg-white focus:border-slate-800 w-full font-black text-lg text-slate-800 rounded-xl text-center" value={matOrder} onChange={(e)=>setMatOrder(e.target.value)} required />
            </div>
          </div>

          {/* MAGIC TOOLS */}
          {(matType === 'LESSON' || matType === 'QUIZ') && (
            <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Sparkles size={100} className="text-white transform rotate-12"/></div>
              
              <h3 className="font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                <Sparkles size={18} className="text-amber-400" /> Magic Tools
              </h3>
              <p className="text-xs font-medium text-slate-400 mb-5 relative z-10">Suntikkan elemen ke dalam editor (Klik satu kali):</p>

              <div className="grid grid-cols-2 gap-3 relative z-10">
                <button type="button" onClick={() => insertTemplate(templateCode)} className="btn btn-sm h-auto py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border-none font-bold text-xs flex flex-col gap-1.5 transition-colors rounded-xl shadow-md">
                  <Code size={18} className="text-emerald-400" /> Blok Kode
                </button>
                <button type="button" onClick={() => insertTemplate(templateTable)} className="btn btn-sm h-auto py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border-none font-bold text-xs flex flex-col gap-1.5 transition-colors rounded-xl shadow-md">
                  <Table size={18} className="text-blue-400" /> Tabel Data
                </button>
                <button type="button" onClick={() => insertTemplate(templateInfo)} className="btn btn-sm h-auto py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border-none font-bold text-xs flex flex-col gap-1.5 transition-colors rounded-xl shadow-md">
                  <Info size={18} className="text-amber-400" /> Peringatan
                </button>
                <button type="button" onClick={() => insertTemplate(templateChecklist)} className="btn btn-sm h-auto py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border-none font-bold text-xs flex flex-col gap-1.5 transition-colors rounded-xl shadow-md">
                  <CheckSquare size={18} className="text-purple-400" /> Checklist
                </button>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: EDITOR UTAMA */}
        <div className="flex-1">
          <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-200 shadow-sm min-h-[700px] flex flex-col relative">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm">2</span> 
              Editor Konten
            </h3>

            <input 
              type="text" 
              className="w-full bg-transparent border-0 border-b-2 border-slate-100 focus:border-slate-800 rounded-none px-0 py-2 text-3xl sm:text-4xl font-black text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-0 mb-8 transition-colors" 
              placeholder="Judul Materi Pembelajaran..." 
              value={matTitle} onChange={(e)=>setMatTitle(e.target.value)} required 
            />

            {(matType === 'LESSON' || matType === 'QUIZ') && (
              <div className="flex-1 flex flex-col animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                  <label className="flex items-center gap-2 font-bold text-slate-600 text-sm">
                    <FileText size={16} /> 
                    {matType === 'LESSON' ? 'Edit Teori, Langkah, & Kode' : 'Edit Instruksi Kuis'}
                  </label>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploadingImage}
                      className="btn btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200 border-none rounded-lg font-bold transition-colors w-full sm:w-auto px-4 shadow-sm"
                    >
                      {uploadingImage ? <span className="loading loading-spinner loading-xs"></span> : <ImageIcon size={16} />}
                      {uploadingImage ? 'Mengunggah...' : 'Sisipkan Gambar'}
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                  </div>
                </div>
                
                {/* INJEKSI CSS REACT QUILL */}
                <style>{`
                  .quill-custom {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
                    border-radius: 1rem;
                  }
                  .quill-custom .ql-toolbar.ql-snow {
                    border: 1px solid #e2e8f0 !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    border-radius: 1rem 1rem 0 0 !important;
                    background-color: #f8fafc !important;
                    padding: 1rem 1.5rem !important;
                    font-family: 'Inter', sans-serif !important;
                  }
                  .quill-custom .ql-container.ql-snow {
                    border: 1px solid #e2e8f0 !important;
                    border-top: none !important;
                    border-radius: 0 0 1rem 1rem !important;
                    background-color: #ffffff !important;
                    font-family: 'Inter', sans-serif !important;
                    font-size: 1.05rem !important;
                  }
                  .quill-custom .ql-editor {
                    min-height: 500px;
                    padding: 2.5rem 3rem !important;
                    line-height: 1.8 !important;
                    color: #334155 !important;
                  }
                  .quill-custom .ql-editor.ql-blank::before {
                    left: 3rem;
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
                    border-radius: 1rem !important;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
                    font-size: 0.9rem !important;
                    border: 1px solid #334155 !important;
                    overflow-x: auto;
                  }
                  .quill-custom .ql-editor blockquote {
                    border-left: 4px solid #f59e0b !important;
                    padding-left: 1rem !important;
                    color: #475569 !important;
                    font-style: italic !important;
                    background-color: #fffbeb !important;
                    padding: 1.2rem !important;
                    border-radius: 0 1rem 1rem 0 !important;
                    margin: 1.5rem 0 !important;
                  }
                  .quill-custom .ql-snow.ql-toolbar button:hover {
                    background-color: #e2e8f0 !important;
                  }
                `}</style>

                <div className="flex-1 flex flex-col focus-within:ring-4 focus-within:ring-slate-100 transition-all rounded-2xl">
                  <ReactQuill 
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    placeholder={matType === 'LESSON' ? "Mulai ngetik materi di sini..." : "Ketikkan instruksi kuis di sini..."}
                    className="quill-custom" 
                  />
                </div>
              </div>
            )}

            {matType === 'CHALLENGE' && (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-8 sm:p-12 bg-rose-50 border-2 border-dashed border-rose-200 rounded-[2rem] animate-in zoom-in-95 mt-4">
                <div className="w-24 h-24 bg-white text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                  <Code size={48} strokeWidth={1.5} />
                </div>
                <h3 className="font-black text-rose-900 text-3xl mb-3">Tugas Praktik Code</h3>
                <p className="text-rose-700 max-w-lg text-lg font-medium leading-relaxed">
                  Pada mode ini, mahasiswa wajib mengumpulkan tautan repository GitHub mereka. Cukup ketikkan judul tugas di form atas dan klik simpan.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default EditMaterialLecturer;