import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, CheckCircle, Code as CodeIcon, 
  HelpCircle, FileText, Send, Image as ImageIcon, X, Clock, BookOpen, Share2, Lock 
} from 'lucide-react'; // 🔥 SEMUA ICON SUDAH MASUK DAFTAR

import api from '../../config/axios';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; 

const MaterialDetail = () => {
  const { materialId } = useParams();
  const navigate = useNavigate();
  
  const [material, setMaterial] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [courseIdStr, setCourseIdStr] = useState(''); 
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionImage, setSubmissionImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [materialId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resMat = await api.get(`/content/materials/${materialId}`);
        const matData = resMat.data.data.material;
        setMaterial(matData);

        const cId = matData.chapter?.courseId || matData.chapter?.course_id || matData.course_id || localStorage.getItem('activeCourseId');
        setCourseIdStr(cId);

        if (cId) {
          const resCourse = await api.get(`/courses/${cId}`);
          setCourseDetails(resCourse.data.data.course);
        }

        const resProg = await api.get('/progress/me');
        const myProgress = resProg.data.data.progress;
        const isDone = myProgress.some(p => p.material_id === materialId || p.materialId === materialId);
        setIsCompleted(isDone);

      } catch (error) {
        console.error("Gagal mengambil data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [materialId]);

  let prevMaterialId = null;
  let nextMaterialId = null;
  
  if (courseDetails) {
    const allMaterials = courseDetails.chapters.flatMap(ch => ch.materials);
    const currentIndex = allMaterials.findIndex(m => m.id === materialId);
    
    if (currentIndex > 0) prevMaterialId = allMaterials[currentIndex - 1].id;
    if (currentIndex !== -1 && currentIndex < allMaterials.length - 1) nextMaterialId = allMaterials[currentIndex + 1].id;
  }

  const handleMarkComplete = async () => {
    try {
      await api.post(`/progress/materials/${materialId}/complete`);
      setIsCompleted(true);
    } catch (error) {
      alert("Gagal menandai selesai");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("Ukuran gambar maksimal 2MB ya coy!");

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploadingImage(true);
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmissionImage(res.data.url);
    } catch (error) {
      alert('Gagal mengunggah gambar bukti.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = null; 
    }
  };

  const handleSubmitChallenge = async () => {
    if (!submissionLink) return alert("Tautan repository wajib diisi!");
    setIsSubmitting(true);
    try {
      await api.post(`/submissions/materials/${materialId}`, { submission_url: submissionLink, image_url: submissionImage });
      await api.post(`/progress/materials/${materialId}/complete`);
      setIsCompleted(true);
    } catch (error) {
      alert(error.response?.data?.message || "Gagal mengirim tugas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'LESSON': return <FileText size={20} className="text-blue-500" />;
      case 'QUIZ': return <HelpCircle size={20} className="text-amber-500" />;
      case 'CHALLENGE': return <CodeIcon size={20} className="text-indigo-500" />;
      default: return <FileText size={20} className="text-slate-500" />;
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'LESSON': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'QUIZ': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CHALLENGE': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-slate-50"><span className="loading loading-spinner loading-lg text-blue-600"></span></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 selection:bg-blue-100 relative">
      
      {/* 🔥 NAVIGASI FIXED: ANTI TEMBUS & Z-INDEX MAKSIMAL */}
      <nav className="sticky top-0 z-[110] h-16 w-full bg-white px-4 md:px-8 border-b border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4 relative z-10">
          <Link to={`/courses/${courseIdStr}`} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </Link>
          <div className="hidden md:block overflow-hidden">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">
              {courseDetails?.title || 'E-Learning'}
            </p>
            <p className="text-sm font-bold text-slate-800 truncate max-w-[250px] leading-tight">
              {material?.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {isCompleted && (
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 border border-emerald-100">
              <CheckCircle size={14} strokeWidth={3} /> Selesai
            </span>
          )}
          <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 group">
            <Share2 size={20} className="group-hover:text-blue-500 transition-colors" />
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto pt-10 px-4 relative z-10">
        <header className="mb-10 animate-in slide-in-from-top duration-500">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm border ${getTypeStyle(material?.type)}`}>
            {getMaterialIcon(material?.type)} {material?.type}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.2] tracking-tight mb-4">
            {material?.title}
          </h1>
          <div className="flex items-center gap-5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><Clock size={16} className="text-blue-400" /> 15 Menit</div>
            <div className="flex items-center gap-1.5"><BookOpen size={16} className="text-indigo-400" /> {courseDetails?.chapters?.length} Bab</div>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 md:p-14 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="relative z-10 prose prose-slate max-w-none">
            {material?.type === 'CHALLENGE' ? (
              <div className="text-center py-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
                  <CodeIcon size={40} strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight uppercase">Misi Tantangan ⚔️</h2>
                <p className="text-lg text-slate-500 max-w-xl mx-auto mb-12 font-medium leading-relaxed">
                  Terapkan ilmu yang udah lo dapet. Kumpulkan tautan repo dan bukti screenshot biar dosen bisa kasih nilai maksimal!
                </p>

                <div className="max-w-lg mx-auto bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 text-left shadow-inner">
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Screenshot Bukti</label>
                      {submissionImage ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 group bg-white shadow-md">
                          <img src={submissionImage} alt="Bukti" className="w-full h-auto" />
                          {!isCompleted && (
                            <button onClick={() => setSubmissionImage('')} className="absolute top-3 right-3 bg-rose-500 text-white p-2.5 rounded-xl shadow-lg hover:bg-rose-600 transition-all hover:scale-110"><X size={18} strokeWidth={3} /></button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current.click()}
                          disabled={isUploadingImage || isCompleted}
                          className="w-full aspect-video border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all group"
                        >
                          {isUploadingImage ? <span className="loading loading-spinner text-blue-600"></span> : <ImageIcon size={36} className="text-slate-300 group-hover:text-blue-500 transition-colors" />}
                          <span className="text-sm font-bold text-slate-400 group-hover:text-blue-600">Upload Screenshot</span>
                        </button>
                      )}
                      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex justify-between">
                        Tautan Repository <span className="text-blue-600 bg-blue-50 px-1.5 rounded font-black">*Wajib</span>
                      </label>
                      <input 
                        type="url" value={submissionLink} onChange={(e) => setSubmissionLink(e.target.value)}
                        disabled={isCompleted || isSubmitting}
                        placeholder="https://github.com/lo/project" 
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 placeholder-slate-300"
                      />
                    </div>

                    {!isCompleted ? (
                      <button 
                        onClick={handleSubmitChallenge} disabled={isSubmitting || !submissionLink}
                        className="w-full btn bg-blue-600 hover:bg-blue-700 text-white border-none rounded-2xl h-14 font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center gap-3"
                      >
                        {isSubmitting ? <span className="loading loading-spinner"></span> : <Send size={20} strokeWidth={2.5} />}
                        {isSubmitting ? 'Mengirim...' : 'Kumpulkan Tugas'}
                      </button>
                    ) : (
                      <div className="w-full bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-100">
                        <CheckCircle size={22} strokeWidth={3} /> Misi Selesai
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="material-markdown-content animate-in fade-in slide-in-from-bottom-4 duration-700">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-slate-900 mb-8 mt-12" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-slate-800 mb-6 mt-10 flex items-center gap-3 before:content-[''] before:w-1.5 before:h-8 before:bg-blue-500 before:rounded-full" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-800 mb-4 mt-8" {...props} />,
                    p: ({node, ...props}) => <p className="text-lg leading-[1.9] text-slate-600 mb-8 font-medium" {...props} />,
                    li: ({node, ...props}) => (
                      <li className="text-lg leading-[1.8] text-slate-600 mb-3 flex items-start gap-4">
                        <span className="mt-2.5 w-2 h-2 shrink-0 bg-blue-400 rounded-full ring-4 ring-blue-50"></span>
                        <span className="font-medium">{props.children}</span>
                      </li>
                    ),
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 p-6 rounded-r-2xl my-10 font-bold italic text-slate-700 shadow-sm" {...props} />
                    ),
                    img: ({node, ...props}) => (
                      <div className="my-12 rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                        <img className="w-full h-auto" {...props} alt={props.alt || 'Visual Materi'} />
                      </div>
                    ),
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : 'text'; 
                      if (!inline || String(children).includes('\n')) {
                        return (
                          <div className="my-10 rounded-2xl border border-slate-200 overflow-hidden shadow-xl relative group font-mono">
                            <div className="bg-slate-900 px-5 py-3 flex items-center justify-between border-b border-slate-800">
                              <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                              </div>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language}</span>
                            </div>
                            <SyntaxHighlighter
                              style={vscDarkPlus} language={language === 'text' ? 'html' : language} PreTag="div"
                              customStyle={{ margin: 0, padding: '1.75rem', fontSize: '0.9rem', lineHeight: '1.8', background: '#0f172a', color: '#f8fafc' }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }
                      return <code className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black text-sm border border-blue-100 mx-0.5" {...props}>{children}</code>;
                    }
                  }}
                >
                  {material?.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
          <div className="w-full sm:w-auto">
            {prevMaterialId && (
              <Link to={`/materials/${prevMaterialId}`} className="flex items-center gap-4 group text-slate-400 hover:text-blue-600 font-black transition-all">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all shadow-sm group-hover:-translate-x-1">
                  <ChevronLeft size={22} strokeWidth={3} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] uppercase tracking-[0.2em] opacity-60">Kembali</p>
                  <p className="text-sm font-bold">Materi Sebelumnya</p>
                </div>
              </Link>
            )}
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
            {!isCompleted ? (
              material?.type !== 'CHALLENGE' && (
                <button 
                  onClick={handleMarkComplete} 
                  className="w-full sm:w-auto btn bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-2xl px-12 h-14 font-black uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all hover:scale-[1.05]"
                >
                  Selesaikan Materi <CheckCircle size={20} strokeWidth={2.5} />
                </button>
              )
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <div className="w-full sm:w-auto bg-emerald-50 text-emerald-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-emerald-100 flex items-center justify-center gap-2 shadow-sm">
                   <CheckCircle size={18} strokeWidth={3} /> Selesai
                </div>
                {nextMaterialId && (
                  <Link to={`/materials/${nextMaterialId}`} className="w-full sm:w-auto btn bg-blue-600 hover:bg-blue-700 text-white border-none rounded-2xl px-12 h-14 font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all hover:scale-[1.05] flex items-center gap-2 group">
                    Lanjut Materi <ChevronRight size={22} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </footer>
      </div>

      <div className="fixed top-1/4 -left-40 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none z-0"></div>
      <div className="fixed bottom-1/4 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none z-0"></div>
    </div>
  );
};

export default MaterialDetail;