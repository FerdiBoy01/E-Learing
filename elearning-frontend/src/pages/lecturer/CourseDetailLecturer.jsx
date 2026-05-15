import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, FileText, HelpCircle, Code, Plus, ChevronLeft, LayoutList, X, Trash2, Edit, Power, PowerOff, AlertTriangle } from 'lucide-react';
import api from '../../config/axios';

const CourseDetailLecturer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Modal Bab (Chapter)
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterOrder, setChapterOrder] = useState(1);

  // State Modal Materi (Material)
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

  // --- KONTROL KELAS (COURSE) ---
  const handleToggleCourseStatus = async () => {
    try {
      const newStatus = course.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.put(`/courses/${courseId}`, { status: newStatus });
      fetchCourseDetail();
    } catch (err) { alert('Gagal merubah status kelas.'); }
  };

  const handleDeleteCourse = async () => {
    if (window.confirm('PERINGATAN KERAS! 🚨\nYakin ingin menghapus kelas ini? SEMUA bab, materi, dan nilai mahasiswa akan ikut terhapus permanen!')) {
      try {
        await api.delete(`/courses/${courseId}`);
        navigate('/courses');
      } catch (err) { alert('Gagal menghapus kelas.'); }
    }
  };

  // --- KONTROL BAB (CHAPTER) ---
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

  // --- KONTROL MATERI (MATERIAL) ---
  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/content/materials/${activeMaterialId}`, {
        title: materialTitle,
        type: materialType
      });
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

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'LESSON': return <FileText size={18} className="text-blue-600" />;
      case 'QUIZ': return <HelpCircle size={18} className="text-amber-500" />;
      case 'CHALLENGE': return <Code size={18} className="text-rose-600" />;
      default: return <FileText size={18} />;
    }
  };

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-blue-600"></span></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <Link to="/courses" className="btn btn-sm btn-ghost mb-6 -ml-2 text-slate-500 hover:bg-slate-100"><ChevronLeft size={20} /> Kembali ke Manajemen</Link>

      <div className="bg-white shadow-sm border border-slate-200 rounded-3xl p-8 mb-8 relative overflow-hidden">
        {course?.status === 'INACTIVE' && (
          <div className="absolute top-0 left-0 w-full bg-amber-500 text-white text-xs font-bold text-center py-1 flex justify-center items-center gap-2">
            <AlertTriangle size={14} /> Kelas ini sedang Dinonaktifkan (Disembunyikan dari Mahasiswa)
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mt-2">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="badge bg-blue-50 text-blue-700 border border-blue-200 px-3 py-3 rounded-lg font-medium flex gap-2">
                <LayoutList size={14} /> {course?.chapters?.length || 0} Bab
              </div>
              <div className={`badge px-3 py-3 rounded-lg font-bold ${course?.status === 'INACTIVE' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                {course?.status === 'INACTIVE' ? 'NONAKTIF' : 'AKTIF'}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{course?.title}</h1>
            <p className="text-slate-500 leading-relaxed max-w-2xl">{course?.description}</p>
          </div>
          
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button onClick={handleToggleCourseStatus} className={`btn btn-sm ${course?.status === 'INACTIVE' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
              {course?.status === 'INACTIVE' ? <><Power size={16} /> Aktifkan Kelas</> : <><PowerOff size={16} /> Nonaktifkan Kelas</>}
            </button>
            <button onClick={handleDeleteCourse} className="btn btn-sm bg-rose-50 text-rose-600 hover:bg-rose-100">
              <Trash2 size={16} /> Hapus Kelas Permanen
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mb-6 mt-12 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Struktur Silabus</h2>
          <p className="text-slate-500 mt-1">Susun dan kelola hierarki pembelajaran Anda.</p>
        </div>
        <button 
          className="btn bg-slate-800 hover:bg-slate-900 text-white border-none shadow-md" 
          onClick={() => {
            setIsEditingChapter(false); setChapterTitle(''); setChapterOrder(course?.chapters?.length + 1 || 1);
            document.getElementById('modal_chapter').showModal();
          }}
        >
          <Plus size={18} /> Tambah Bab Baru
        </button>
      </div>

      <div className="space-y-4">
        {course?.chapters?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <BookOpen size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">Silabus Masih Kosong</h3>
            <p className="text-slate-500 mt-1">Mulai dengan menambahkan Bab pertama Anda.</p>
          </div>
        ) : (
          course?.chapters?.map((chapter, idx) => (
            <div key={chapter.id} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden group/chapter">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center transition-colors hover:bg-slate-100">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-inner">{idx + 1}</div>
                  <h3 className="text-lg font-bold text-slate-800">{chapter.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="opacity-0 group-hover/chapter:opacity-100 transition-opacity flex gap-1 mr-2">
                    <button onClick={() => openEditChapterModal(chapter)} className="btn btn-xs btn-square btn-ghost text-slate-500 hover:text-blue-600" title="Edit Bab"><Edit size={14} /></button>
                    <button onClick={() => handleDeleteChapter(chapter.id)} className="btn btn-xs btn-square btn-ghost text-slate-500 hover:text-rose-600" title="Hapus Bab"><Trash2 size={14} /></button>
                  </div>
                  <Link to={`/courses/${courseId}/chapters/${chapter.id}/materials/new`} className="btn btn-sm bg-white border border-slate-300 text-slate-600 hover:text-blue-600 shadow-sm">
                    <Plus size={16} /> Materi
                  </Link>
                </div>
              </div>
              
              <div className="p-4">
                {chapter.materials?.length === 0 ? (
                  <div className="text-center py-6 text-sm text-slate-400 italic">Belum ada materi di bab ini.</div>
                ) : (
                  <ul className="space-y-2">
                    {chapter.materials?.map((mat) => (
                      <li key={mat.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all group/mat">
                        <div className="flex items-center gap-4">
                          <div className="bg-white p-2.5 rounded-lg shadow-sm border border-slate-100">{getMaterialIcon(mat.type)}</div>
                          <div>
                            <span className="font-semibold text-slate-700 block mb-0.5">{mat.title}</span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">{mat.type}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover/mat:opacity-100 transition-opacity">
                          {/* TOMBOL EDIT MATERI SEKARANG MEMANGGIL MODAL */}
                          <button onClick={() => openEditMaterialModal(mat)} className="btn btn-sm btn-ghost text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                            <Edit size={16} /> Edit
                          </button>
                          <button onClick={() => handleDeleteMaterial(mat.id)} className="btn btn-sm btn-ghost text-slate-500 hover:text-rose-600 hover:bg-rose-50">
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

      {/* MODAL BAB */}
      <dialog id="modal_chapter" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white rounded-2xl shadow-2xl p-0">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">{isEditingChapter ? 'Edit Bab' : 'Tambah Bab Baru'}</h3>
            <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost text-slate-500"><X size={18} /></button></form>
          </div>
          <form onSubmit={handleSaveChapter} className="p-6">
            <div className="form-control w-full mb-4">
              <label className="label"><span className="label-text font-semibold text-slate-700">Judul Bab</span></label>
              <input type="text" className="input input-bordered bg-slate-50 focus:bg-white focus:border-blue-500" value={chapterTitle} onChange={(e)=>setChapterTitle(e.target.value)} required />
            </div>
            <div className="form-control w-full mb-8">
              <label className="label"><span className="label-text font-semibold text-slate-700">Urutan Tampil</span></label>
              <input type="number" min="1" className="input input-bordered bg-slate-50 focus:bg-white focus:border-blue-500 w-1/3" value={chapterOrder} onChange={(e)=>setChapterOrder(e.target.value)} required />
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn flex-1 btn-ghost border border-slate-200" onClick={() => document.getElementById('modal_chapter').close()}>Batal</button>
              <button type="submit" className="btn flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md">Simpan Bab</button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* MODAL EDIT MATERI */}
      <dialog id="modal_edit_material" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white rounded-2xl shadow-2xl p-0">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Edit Info Materi</h3>
            <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost text-slate-500"><X size={18} /></button></form>
          </div>
          <form onSubmit={handleSaveMaterial} className="p-6">
            <div className="form-control w-full mb-4">
              <label className="label"><span className="label-text font-semibold text-slate-700">Judul Materi</span></label>
              <input type="text" className="input input-bordered bg-slate-50 focus:bg-white focus:border-blue-500" value={materialTitle} onChange={(e)=>setMaterialTitle(e.target.value)} required />
            </div>
            <div className="form-control w-full mb-8">
              <label className="label"><span className="label-text font-semibold text-slate-700">Tipe Materi</span></label>
              <select className="select select-bordered bg-slate-50 focus:bg-white focus:border-blue-500" value={materialType} onChange={(e)=>setMaterialType(e.target.value)}>
                <option value="LESSON">Lesson (Teks/Video)</option>
                <option value="QUIZ">Quiz (Pilihan Ganda)</option>
                <option value="CHALLENGE">Challenge (Tugas Upload)</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn flex-1 btn-ghost border border-slate-200" onClick={() => document.getElementById('modal_edit_material').close()}>Batal</button>
              <button type="submit" className="btn flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md">Simpan Perubahan</button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

    </div>
  );
};

export default CourseDetailLecturer;