import { useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Save, BookOpen, Code, HelpCircle, FileText, 
  Image as ImageIcon, Table, Info, CheckSquare, Sparkles 
} from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import api from '../../config/axios';

const CreateMaterialLecturer = () => {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();

  // State Form
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState('LESSON');
  const [matOrder, setMatOrder] = useState(1);
  const [content, setContent] = useState('');
  
  // State Loading
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // 🔥 TEMPLATE MAGIC TOOLS (Dipisah ke variabel biar Vite/Oxc gak error)
  const templateCode = "\n```javascript\n// Ketik kodinganmu di sini...\n```\n";
  const templateTable = "\n| Judul Kolom 1 | Judul Kolom 2 |\n| ----------- | ----------- |\n| Isi Baris 1 | Isi Data    |\n| Isi Baris 2 | Isi Data    |\n";
  const templateInfo = "\n> **💡 CATATAN PENTING:**\n> Tulis pesan atau peringatan untuk mahasiswa di sini...\n\n";
  const templateChecklist = "\n- [ ] Tugas 1 (Belum)\n- [x] Tugas 2 (Selesai)\n";

  // 🔥 1. FUNGSI SAKTI UPLOAD GAMBAR DARI LAPTOP DOSEN
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2MB ya dok!");
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
      const imageMarkdown = `\n![Gambar Materi](${imageUrl})\n`;
      setContent((prev) => prev + imageMarkdown);
      
    } catch (error) {
      alert('Gagal mengunggah gambar. Pastikan server API menyala.');
      console.error(error);
    } finally {
      setUploadingImage(false);
      e.target.value = null; 
    }
  };

  // 🔥 2. FUNGSI SUNTIK TEMPLATE KE EDITOR
  const insertTemplate = (template) => {
    setContent((prev) => prev + template);
  };

  // 🔥 3. FUNGSI SIMPAN MATERI KE DATABASE
  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      await api.post(`/content/chapters/${chapterId}/materials`, {
        title: matTitle,
        type: matType,
        content: matType === 'CHALLENGE' ? '' : content,
        order_index: parseInt(matOrder)
      });
      
      navigate(`/courses/${courseId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan materi');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-20 font-sans px-4">
      
      {/* ========================================= */}
      {/* NAVBAR ATAS                               */}
      {/* ========================================= */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-6 z-50 mt-6">
        <div className="flex items-center gap-4">
          <Link to={`/courses/${courseId}`} className="btn btn-sm btn-ghost text-slate-500 hover:bg-slate-100">
            <ChevronLeft size={20} /> Batal
          </Link>
          <div className="h-6 w-px bg-slate-200"></div>
          <h1 className="font-bold text-slate-800 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-600" /> Creator Studio
          </h1>
        </div>
        <button 
          onClick={handleSaveMaterial} 
          disabled={submitLoading || !matTitle}
          className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none px-6 shadow-md transition-all hover:shadow-lg disabled:bg-slate-300"
        >
          {submitLoading ? <span className="loading loading-spinner"></span> : <><Save size={16} /> Terbitkan Materi</>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* ========================================= */}
        {/* KOLOM KIRI: KONFIGURASI & MAGIC TOOLS     */}
        {/* ========================================= */}
        <div className="w-full lg:w-[350px] flex-shrink-0 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
              Format Konten
            </h3>
            
            <div className="space-y-4">
              <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${matType === 'LESSON' ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                <input type="radio" name="mat_type" className="radio radio-primary radio-sm mt-1" checked={matType === 'LESSON'} onChange={() => setMatType('LESSON')} />
                <div>
                  <span className={`block font-bold mb-0.5 ${matType === 'LESSON' ? 'text-blue-800' : 'text-slate-700'}`}>Materi Teori</span>
                  <span className="text-xs text-slate-500 leading-relaxed block">Materi bacaan lengkap. Bisa disisipi teks, gambar, tabel, dan kodingan.</span>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${matType === 'CHALLENGE' ? 'bg-rose-50 border-rose-500 shadow-sm' : 'bg-white border-slate-100 hover:border-rose-200'}`}>
                <input type="radio" name="mat_type" className="radio radio-error radio-sm mt-1" checked={matType === 'CHALLENGE'} onChange={() => setMatType('CHALLENGE')} />
                <div>
                  <span className={`block font-bold mb-0.5 ${matType === 'CHALLENGE' ? 'text-rose-800' : 'text-slate-700'}`}>Tugas Praktik</span>
                  <span className="text-xs text-slate-500 leading-relaxed block">Wajibkan mahasiswa mengumpulkan link repository GitHub.</span>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${matType === 'QUIZ' ? 'bg-amber-50 border-amber-500 shadow-sm' : 'bg-white border-slate-100 hover:border-amber-200'}`}>
                <input type="radio" name="mat_type" className="radio radio-warning radio-sm mt-1" checked={matType === 'QUIZ'} onChange={() => setMatType('QUIZ')} />
                <div>
                  <span className={`block font-bold mb-0.5 ${matType === 'QUIZ' ? 'text-amber-800' : 'text-slate-700'}`}>Kuis / Instruksi</span>
                  <span className="text-xs text-slate-500 leading-relaxed block">Instruksi tugas tertulis ringan tanpa wajib upload file.</span>
                </div>
              </label>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <label className="label px-0"><span className="label-text font-bold text-slate-700 flex items-center gap-2">Urutan Tampil (BAB)</span></label>
              <input type="number" min="1" className="input input-bordered bg-slate-50 focus:bg-white focus:border-blue-500 w-full font-bold text-lg" value={matOrder} onChange={(e)=>setMatOrder(e.target.value)} required />
            </div>
          </div>

          {(matType === 'LESSON' || matType === 'QUIZ') && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-fadeIn">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" /> Magic Tools
              </h3>
              <p className="text-xs font-medium text-slate-500 mb-5">Suntikkan elemen ke editor dengan satu klik:</p>

              {/* 🔥 TOMBOL MENGGUNAKAN VARIABEL TEMPLATE AMAN */}
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => insertTemplate(templateCode)} className="btn btn-sm h-auto py-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200 text-slate-600 font-bold text-xs flex flex-col gap-1 transition-colors">
                  <Code size={18} /> Blok Kode
                </button>

                <button type="button" onClick={() => insertTemplate(templateTable)} className="btn btn-sm h-auto py-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200 text-slate-600 font-bold text-xs flex flex-col gap-1 transition-colors">
                  <Table size={18} /> Tabel Data
                </button>

                <button type="button" onClick={() => insertTemplate(templateInfo)} className="btn btn-sm h-auto py-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200 text-slate-600 font-bold text-xs flex flex-col gap-1 transition-colors">
                  <Info size={18} /> Kotak Info
                </button>

                <button type="button" onClick={() => insertTemplate(templateChecklist)} className="btn btn-sm h-auto py-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200 text-slate-600 font-bold text-xs flex flex-col gap-1 transition-colors">
                  <CheckSquare size={18} /> Checklist
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================= */}
        {/* KOLOM KANAN: KANVAS EDITOR ALA WORD       */}
        {/* ========================================= */}
        <div className="flex-1">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[700px] flex flex-col">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> 
              Isi Materi Pembelajaran
            </h3>

            <input 
              type="text" 
              className="w-full bg-transparent border-0 border-b-2 border-slate-100 focus:border-blue-600 rounded-none px-0 py-2 text-4xl font-black text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-0 mb-8 transition-colors" 
              placeholder="Ketik Judul Materi Di Sini..." 
              value={matTitle} onChange={(e)=>setMatTitle(e.target.value)} required 
            />

            {(matType === 'LESSON' || matType === 'QUIZ') && (
              <div className="flex-1 flex flex-col animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                  <label className="flex items-center gap-2 font-bold text-slate-700">
                    <FileText size={18} className="text-blue-500" /> 
                    {matType === 'LESSON' ? 'Tuliskan Teori & Kode' : 'Tuliskan Instruksi Kuis'}
                  </label>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploadingImage}
                      className="btn btn-sm bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-none rounded-lg font-bold transition-colors w-full sm:w-auto"
                    >
                      {uploadingImage ? <span className="loading loading-spinner loading-xs"></span> : <ImageIcon size={16} />}
                      {uploadingImage ? 'Mengunggah...' : 'Sisipkan Gambar'}
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
                
                <div data-color-mode="light" className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex-1 flex flex-col">
                  <MDEditor
                    value={content}
                    onChange={setContent}
                    height={600}
                    className="flex-1"
                    previewOptions={{
                      style: { padding: '24px', fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '1.8' }
                    }}
                    textareaProps={{
                      placeholder: matType === 'LESSON' 
                        ? "Mulai mengetik materi di sini layaknya menggunakan MS Word...\n\n💡 TIPS:\n1. Gunakan 'Magic Tools' di sebelah kiri untuk memasukkan Tabel/Kodingan dengan cepat.\n2. Klik tombol 'Sisipkan Gambar' di atas untuk upload foto dari laptop."
                        : "Ketikkan daftar soal atau instruksi tugas di sini..."
                    }}
                  />
                </div>
              </div>
            )}

            {matType === 'CHALLENGE' && (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-12 bg-rose-50 border-2 border-dashed border-rose-200 rounded-3xl animate-fadeIn mt-4">
                <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Code size={48} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-rose-800 text-3xl mb-3">Mode Tugas Praktik</h3>
                <p className="text-rose-600 max-w-lg text-lg leading-relaxed">
                  Pada mode ini, Anda cukup mengetikkan Judul Tugas Praktik di atas. Mahasiswa akan otomatis disajikan dengan form khusus untuk mengumpulkan Tautan Repository GitHub tugas mereka.
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