import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, FileText, HelpCircle, Code, Plus, ChevronLeft, 
  LayoutList, X, Trash2, Edit, AlertTriangle, Globe, Lock, 
  Tag, Sparkles, CheckCircle2, FileEdit, Copy, KeyRound, Trophy, Coins, Zap 
} from 'lucide-react'; // 🔥 TAMBAHAN ICON GAMIFIKASI
import api from '../../config/axios';

const CourseDetailLecturer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Modal Bab
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterOrder, setChapterOrder] = useState(1);

  // State Modal Materi
  const [activeMaterialId, setActiveMaterialId] = useState(null);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState('LESSON');

  const fetchCourseDetail = async () => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data.data.course);
    } catch (error) {
      console.error("Gagal mengambil detail course", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourseDetail(); }, [courseId]);

  const handleTogglePublish = async () => {
    try {
      const newPublishStatus = !course.is_published;
      await api.put(`/courses/${courseId}`, { is_published: newPublishStatus });
      fetchCourseDetail();
    } catch (err) { alert('Gagal merubah status rilis kelas.'); }
  };

  const handleDeleteCourse = async () => {
    if (window.confirm('PERINGATAN KERAS! 🚨\nYakin ingin menghapus kelas ini? SEMUA bab, materi, dan data akan terhapus permanen!')) {
      try {
        await api.delete(`/courses/${courseId}`);
        navigate('/courses');
      } catch (err) { alert('Gagal menghapus kelas.'); }
    }
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    try {
      if (isEditingChapter) {
        await api.put(`/content/chapters/${activeChapterId}`, { title: chapterTitle, order_index: parseInt(chapterOrder) });
      } else {
        await api.post(`/content/courses/${courseId}/chapters`, { title: chapterTitle, order_index: parseInt(chapterOrder) });
      }
      document.getElementById('modal_chapter').close();
      fetchCourseDetail();
    } catch (err) { alert('Gagal menyimpan bab'); }
  };

  const openEditChapterModal = (chapter) => {
    setIsEditingChapter(true);
    setActiveChapterId(chapter.id);
    setChapterTitle(chapter.title);
    setChapterOrder(chapter.order_index || 1);
    document.getElementById('modal_chapter').showModal();
  };

  const handleDeleteChapter = async (chapterId) => {
    if (window.confirm('Yakin ingin menghapus Bab ini beserta isinya?')) {
      try {
        await api.delete(`/content/chapters/${chapterId}`);
        fetchCourseDetail();
      } catch (err) { alert('Gagal menghapus bab.'); }
    }
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/content/materials/${activeMaterialId}`, { title: materialTitle, type: materialType });
      document.getElementById('modal_edit_material').close();
      fetchCourseDetail();
    } catch (err) { alert('Gagal mengupdate materi'); }
  };

  const openEditMaterialModal = (mat) => {
    setActiveMaterialId(mat.id);
    setMaterialTitle(mat.title);
    setMaterialType(mat.type);
    document.getElementById('modal_edit_material').showModal();
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm('Yakin ingin menghapus materi ini?')) {
      try {
        await api.delete(`/content/materials/${materialId}`);
        fetchCourseDetail();
      } catch (err) { alert('Gagal menghapus materi.'); }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Kode akses ${text} berhasil disalin!`); 
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'LESSON': return <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={18} strokeWidth={2.5} /></div>;
      case 'QUIZ': return <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><HelpCircle size={18} strokeWidth={2.5} /></div>;
      case 'CHALLENGE': return <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Code size={18} strokeWidth={2.5} /></div>;
      default: return <div className="p-2 bg-slate-50 text-slate-500 rounded-lg"><FileText size={18} strokeWidth={2.5} /></div>;
    }
  };

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number || 0);

  if (loading) return <div className="min-h-screen flex justify-center items-center"><span className="loading loading-spinner loading-lg text-slate-800"></span></div>;

  return (
    <div className="min-h-screen bg-slate-50/50 pt-4 pb-24 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Navigasi Kembali */}
        <Link to="/courses" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors mb-6 -ml-3">
          <ChevronLeft size={18} /> Kembali ke Katalog
        </Link>

        {/* ========================================= */}
        {/* HEADER KELAS (Premium Dark Mode Studio)     */}
        {/* ========================================= */}
        <div className="bg-slate-900 rounded-[2rem] p-8 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden mb-10">
          
          {/* Badge Draft Warning */}
          {!course?.is_published && (
            <div className="absolute top-0 left-0 w-full bg-amber-500 text-slate-900 text-xs font-black uppercase tracking-widest text-center py-2 flex justify-center items-center gap-2 shadow-sm z-10">
              <FileEdit size={16} /> Mode Draft Aktif — Kelas ini disembunyikan dari katalog mahasiswa
            </div>
          )}

          <div className={`flex flex-col lg:flex-row gap-8 justify-between items-start ${!course?.is_published ? 'pt-6' : ''}`}>
            <div className="flex-1">
              
              {/* Badges System */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {course?.visibility === 'PUBLIC' ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                    <Globe size={14} /> Publik
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                    <Lock size={14} /> Privat
                  </div>
                )}

                {course?.type === 'PROJECT_BASED' ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                    <Sparkles size={14} /> Premium ({formatRupiah(course?.price)})
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-600">
                    <Tag size={14} /> Gratis
                  </div>
                )}

                {/* 🔥 BADGE INFO GAMIFIKASI */}
                <div className="flex items-center gap-2 text-xs font-bold text-yellow-300 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                  <Trophy size={14} /> Hadiah: {course?.reward_points} Pts & {course?.reward_exp} EXP
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight leading-tight">{course?.title}</h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-2xl font-medium">{course?.description || "Belum ada deskripsi."}</p>

              {/* Tampilkan Kode Akses Khusus jika Privat */}
              {course?.visibility === 'PRIVATE' && course?.access_code && (
                <div className="mt-6 flex items-center gap-3 bg-slate-800 border border-slate-700 w-fit p-1.5 pr-4 rounded-xl">
                  <div className="bg-rose-500/20 text-rose-400 p-2 rounded-lg">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kode Akses Mahasiswa</p>
                    <p className="text-white font-black tracking-widest text-lg leading-none">{course?.access_code}</p>
                  </div>
                  <button onClick={() => copyToClipboard(course?.access_code)} className="ml-4 btn btn-sm btn-circle bg-slate-700 hover:bg-slate-600 border-none text-white">
                    <Copy size={14} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
              <button 
                onClick={handleTogglePublish} 
                className={`btn border-none shadow-lg h-12 rounded-xl px-6 ${
                  !course?.is_published 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {!course?.is_published ? <><CheckCircle2 size={18} /> Rilis ke Publik</> : <><FileEdit size={18} /> Kembalikan ke Draft</>}
              </button>
              
              <button onClick={handleDeleteCourse} className="btn bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 h-12 rounded-xl shadow-none">
                <Trash2 size={18} /> Hapus Kelas
              </button>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* BAGIAN SILABUS                            */}
        {/* ========================================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 border-b border-slate-200 pb-4 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <LayoutList size={24} className="text-slate-400" /> Struktur Silabus
            </h2>
            <p className="text-slate-500 mt-1 font-medium">Susun hierarki bab dan materi pembelajaran kelas ini.</p>
          </div>
          <button 
            className="btn bg-slate-900 hover:bg-slate-800 text-white border-none shadow-md rounded-xl px-6" 
            onClick={() => {
              setIsEditingChapter(false); setChapterTitle(''); setChapterOrder(course?.chapters?.length + 1 || 1);
              document.getElementById('modal_chapter').showModal();
            }}
          >
            <Plus size={18} strokeWidth={2.5} /> Tambah Bab Baru
          </button>
        </div>

        <div className="space-y-6">
          {course?.chapters?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <BookOpen size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Silabus Masih Kosong</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium">Mulai susun struktur pembelajaran dengan menambahkan Bab pertama Anda.</p>
            </div>
          ) : (
            course?.chapters?.map((chapter, idx) => (
              <div key={chapter.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group/chapter">
                
                {/* Header Bab */}
                <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm">{idx + 1}</div>
                    <h3 className="text-lg font-bold text-slate-800">{chapter.title}</h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="opacity-0 group-hover/chapter:opacity-100 transition-opacity flex gap-1 mr-2">
                      <button onClick={() => openEditChapterModal(chapter)} className="btn btn-sm btn-square btn-ghost text-slate-400 hover:text-slate-900 hover:bg-slate-200" title="Edit Bab"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteChapter(chapter.id)} className="btn btn-sm btn-square btn-ghost text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="Hapus Bab"><Trash2 size={16} /></button>
                    </div>
                    {/* 👇 TOMBOL TAMBAH MATERI SUDAH DIUPDATE STYLE NYA */}
                    <Link to={`/courses/${courseId}/chapters/${chapter.id}/materials/new`} className="btn btn-sm bg-slate-900 hover:bg-slate-800 text-white border-none shadow-sm rounded-lg px-4 font-bold">
                      <Plus size={16} strokeWidth={2.5} /> Tambah Materi
                    </Link>
                  </div>
                </div>
                
                {/* Daftar Materi (Tree View Style) */}
                <div className="p-4 sm:p-6">
                  {chapter.materials?.length === 0 ? (
                    <div className="text-center py-6 text-sm text-slate-400 font-bold bg-slate-50/50 rounded-xl border border-dashed border-slate-200">Belum ada materi di bab ini.</div>
                  ) : (
                    <ul className="relative space-y-2 before:absolute before:inset-y-3 before:left-[1.35rem] before:w-px before:bg-slate-200">
                      {chapter.materials?.map((mat) => (
                        <li key={mat.id} className="relative flex justify-between items-center p-3 pl-12 hover:bg-slate-50 rounded-xl transition-colors group/mat border border-transparent hover:border-slate-200/60">
                          {/* Garis konektor tree */}
                          <div className="absolute left-[1.35rem] top-1/2 -mt-px w-5 h-px bg-slate-200"></div>

                          <div className="flex items-center gap-4">
                            {getMaterialIcon(mat.type)}
                            <div>
                              <span className="font-bold text-slate-800 block mb-0.5">{mat.title}</span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-200/50 text-slate-500 tracking-wider uppercase">{mat.type}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover/mat:opacity-100 transition-opacity bg-white p-1 rounded-lg shadow-sm border border-slate-200">
                           {/* 🔥 TOMBOL BARU: BUKA EDITOR KONTEN */}
  <Link 
    to={`/courses/${courseId}/chapters/${chapter.id}/materials/${mat.id}/edit`} 
    className="btn btn-sm btn-ghost text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 rounded-md font-bold"
  >
    <FileEdit size={14} className="mr-1" /> Tulis Konten
  </Link>

  <div className="w-px h-4 bg-slate-200 mx-1"></div>
  
  {/* Tombol Info (Ubah Judul/Tipe) */}
  <button onClick={() => openEditMaterialModal(mat)} className="btn btn-sm btn-ghost text-slate-500 hover:text-slate-900 px-3 rounded-md">
    <Edit size={14} className="mr-1" /> Info
  </button>
  
  <div className="w-px h-4 bg-slate-200 mx-1"></div>
  
  <button onClick={() => handleDeleteMaterial(mat.id)} className="btn btn-sm btn-square btn-ghost text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md">
    <Trash2 size={16} />
  </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ========================================= */}
        {/* MODAL EDIT BAB & MATERI (Tetap di bawah sini) */}
        {/* ========================================= */}
        <dialog id="modal_chapter" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
          <div className="modal-box bg-white rounded-[2rem] shadow-2xl p-0 border border-slate-100 max-w-md">
            <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-xl text-slate-900 tracking-tight">{isEditingChapter ? 'Edit Info Bab' : 'Tambah Bab Baru'}</h3>
              <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-900 bg-white shadow-sm border border-slate-200"><X size={16} /></button></form>
            </div>
            <form onSubmit={handleSaveChapter} className="p-8">
              <div className="form-control w-full mb-5">
                <label className="label px-0 mb-1"><span className="label-text font-bold text-slate-700">Judul Bab</span></label>
                <input type="text" className="input input-bordered bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-medium" value={chapterTitle} onChange={(e)=>setChapterTitle(e.target.value)} placeholder="Contoh: Pengenalan Dasar" required />
              </div>
              <div className="form-control w-full mb-8">
                <label className="label px-0 mb-1"><span className="label-text font-bold text-slate-700">Urutan Tampil</span></label>
                <input type="number" min="1" className="input input-bordered bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl w-1/3 text-lg font-black text-center" value={chapterOrder} onChange={(e)=>setChapterOrder(e.target.value)} required />
              </div>
              <div className="flex gap-3">
                <button type="button" className="btn flex-1 btn-ghost border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-slate-600" onClick={() => document.getElementById('modal_chapter').close()}>Batal</button>
                <button type="submit" className="btn flex-1 bg-slate-900 hover:bg-slate-800 text-white border-none shadow-md rounded-xl font-bold">Simpan Bab</button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop"><button>close</button></form>
        </dialog>

        <dialog id="modal_edit_material" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
          <div className="modal-box bg-white rounded-[2rem] shadow-2xl p-0 border border-slate-100 max-w-md">
            <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-xl text-slate-900 tracking-tight">Edit Info Materi</h3>
              <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-900 bg-white shadow-sm border border-slate-200"><X size={16} /></button></form>
            </div>
            <form onSubmit={handleSaveMaterial} className="p-8">
              <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm font-medium mb-6 flex gap-3 items-start border border-blue-100/50">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <p>Modal ini hanya untuk mengubah <strong>Judul</strong> dan <strong>Tipe</strong> materi.</p>
              </div>
              <div className="form-control w-full mb-5">
                <label className="label px-0 mb-1"><span className="label-text font-bold text-slate-700">Judul Materi</span></label>
                <input type="text" className="input input-bordered bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-medium" value={materialTitle} onChange={(e)=>setMaterialTitle(e.target.value)} required />
              </div>
              <div className="form-control w-full mb-8">
                <label className="label px-0 mb-1"><span className="label-text font-bold text-slate-700">Tipe Materi</span></label>
                <select className="select select-bordered bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-bold text-slate-800" value={materialType} onChange={(e)=>setMaterialType(e.target.value)}>
                  <option value="LESSON">Lesson (Teori & Teks)</option>
                  <option value="QUIZ">Quiz (Ujian Tertulis)</option>
                  <option value="CHALLENGE">Challenge (Tugas Praktik/Kode)</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" className="btn flex-1 btn-ghost border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-slate-600" onClick={() => document.getElementById('modal_edit_material').close()}>Batal</button>
                <button type="submit" className="btn flex-1 bg-slate-900 hover:bg-slate-800 text-white border-none shadow-md rounded-xl font-bold">Simpan Perubahan</button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop"><button>close</button></form>
        </dialog>

      </div>
    </div>
  );
};

export default CourseDetailLecturer;