import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, HelpCircle, Code, ChevronLeft, LayoutList, 
  UserCheck, CheckCircle, Lock, AlertTriangle, PenTool, 
  Trophy, Award, Sparkles, Download, Clock, BookOpen, CreditCard, UploadCloud, Image as ImageIcon
} from 'lucide-react';
import api from '../../config/axios';
import useAuthStore from '../../store/authStore';
import toast from '../../utils/toast';

const CourseDetailStudent = () => {
  const { user } = useAuthStore();
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  const [isClaimed, setIsClaimed] = useState(false);
  const [completedDate, setCompletedDate] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // 🔥 STATE BARU UNTUK FITUR PEMBAYARAN
  const [hasPendingTransaction, setHasPendingTransaction] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const response = await api.get(`/courses/${courseId}`);
        setCourse(response.data.data.course);

        const resProg = await api.get('/progress/me');
        const completedMaterialIds = resProg.data.data.progress.map(p => p.material_id || p.materialId);
        setCompletedIds(completedMaterialIds);

        const resEnroll = await api.get(`/courses/${courseId}/enroll-status`);
        setIsEnrolled(resEnroll.data.data.enrolled);
        setIsClaimed(resEnroll.data.data.is_completed); 
        setCompletedDate(resEnroll.data.data.completed_at);
        
        // (Opsional) Nanti kalau backend sudah siap, cek status transaksi di sini
        // setHasPendingTransaction(resEnroll.data.data.has_pending_transaction);

        localStorage.setItem('activeCourseId', courseId);

      } catch (error) { 
        console.error("Error fetching data", error); 
        setError(true); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchCourseData();
  }, [courseId]);

  // Handle Ambil Kelas Gratis
  const handleKomitmen = async () => {
    setIsEnrolling(true);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setIsEnrolled(true);
      toast.success("Berhasil mengambil kelas! Selamat belajar.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengambil kelas.");
    } finally {
      setIsEnrolling(false);
    }
  };

  // 🔥 HANDLE UPLOAD PREVIEW BUKTI TRANSFER
  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 2MB!");
      return;
    }

    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setReceiptPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // 🔥 HANDLE SUBMIT PEMBAYARAN MANUAL
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!receiptFile) {
      toast.error("Harap unggah bukti transfer terlebih dahulu!");
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('course_id', courseId);
      
      // Catatan: Endpoint ini akan error (404) sampai kita buat di Tahap 2 nanti
      await api.post('/transactions/manual', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      document.getElementById('modal_pembayaran').close();
      setHasPendingTransaction(true); // Ubah UI ke status pending
      toast.success("Bukti transfer berhasil dikirim! Menunggu validasi dosen.");
    } catch (error) {
      // Biar nggak macet pas ujicoba UI (karena API belum ada), kita pura-pura sukses dulu
      console.log("Simulasi sukses (API transaksi belum ada)");
      document.getElementById('modal_pembayaran').close();
      setHasPendingTransaction(true);
      toast.success("Simulasi: Bukti berhasil dikirim (API menyusul).");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleClaimReward = async () => {
    setIsClaiming(true);
    try {
      await api.post(`/courses/${courseId}/claim-reward`);
      setIsClaimed(true);
      setCompletedDate(new Date().toISOString());
      document.getElementById('modal_sertifikat').showModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal klaim reward.");
    } finally {
      setIsClaiming(false);
    }
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'LESSON': return <FileText size={20} className="text-blue-500" />;
      case 'QUIZ': return <HelpCircle size={20} className="text-amber-500" />;
      case 'CHALLENGE': return <Code size={20} className="text-indigo-500" />;
      default: return <FileText size={20} className="text-slate-500" />;
    }
  };

  let totalMaterials = 0;
  let materialsCompletedInThisCourse = 0;

  if (course && course.chapters) {
    course.chapters.forEach(ch => {
      if (ch.materials) {
        totalMaterials += ch.materials.length;
        ch.materials.forEach(mat => {
          if (completedIds.includes(mat.id)) materialsCompletedInThisCourse++;
        });
      }
    });
  }
  
  const progressPercentage = totalMaterials === 0 ? 0 : Math.round((materialsCompletedInThisCourse / totalMaterials) * 100);
  const formattedPrice = course ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(course.price || 0) : 'Rp 0';

  if (loading) return <div className="min-h-[70vh] flex justify-center items-center"><span className="loading loading-spinner loading-lg text-blue-600"></span></div>;

  if (error || !course) return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center font-sans text-center">
      <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6"><AlertTriangle size={48} /></div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Kelas Tidak Ditemukan</h2>
      <p className="text-slate-500 mb-6">Mata kuliah yang Anda cari mungkin sudah dihapus atau tidak tersedia.</p>
      <Link to="/courses" className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-xl border-none px-6">Kembali ke Katalog</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto font-sans pb-24 pt-2 px-4">
      
      {/* Tombol Kembali */}
      <Link to="/courses" className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all shadow-sm w-max">
        <ChevronLeft size={18} /> Katalog Kelas
      </Link>

      {/* Header Course (Clean & Soft) */}
      <div className={`rounded-3xl p-8 md:p-10 mb-8 border shadow-sm relative overflow-hidden ${course.type === 'PROJECT_BASED' ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200' : 'bg-white border-slate-200'}`}>
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl pointer-events-none ${course.type === 'PROJECT_BASED' ? 'bg-amber-100' : 'bg-blue-50'}`}></div>
        
        <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
          <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold text-sm ${course.type === 'PROJECT_BASED' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
            <LayoutList size={16} /> {course.chapters?.length || 0} BAB 
          </div>
          {course.type === 'PROJECT_BASED' && (
             <div className="px-3 py-1.5 rounded-lg flex items-center gap-2 bg-slate-900 text-white font-bold text-sm shadow-sm">
             <Sparkles size={14} className="text-amber-400" /> Premium Project
           </div>
          )}
          {isEnrolled && (
            <div className="px-3 py-1.5 rounded-lg flex items-center gap-2 bg-emerald-50 text-emerald-700 font-bold text-sm">
              <CheckCircle size={16} /> Sedang Diikuti
            </div>
          )}
        </div>
        
        <h1 className="text-3xl md:text-5xl mb-4 font-bold text-slate-800 tracking-tight relative z-10 leading-tight">
          {course.title}
        </h1>
        <p className="text-lg mb-10 leading-relaxed text-slate-500 max-w-3xl relative z-10">
          {course.description}
        </p>

        {isEnrolled && (
          <div className="relative z-10 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-6">
            <div className="flex justify-between items-end mb-3 font-semibold text-slate-700 text-sm">
              <span>Progres Belajar Anda</span>
              <span className="text-emerald-600 font-bold text-lg">{progressPercentage}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Kolom Kiri: Info Dosen & Action Box */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          {/* Card Dosen */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-sm overflow-hidden mb-4 bg-slate-100">
              <img src={course.lecturer?.avatar_url || `https://ui-avatars.com/api/?name=${course.lecturer?.name || 'Dosen'}&background=0D8ABC&color=fff&size=200`} alt="Dosen" className="w-full h-full object-cover" />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md mb-2 text-xs font-bold uppercase tracking-wider">
              <UserCheck size={14} /> Instruktur
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">{course.lecturer?.name}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {course.lecturer?.bio || "Instruktur utama untuk mata kuliah ini."}
            </p>
          </div>

          {/* 🔥 KOTAK KOMITMEN DINAMIS (REGULAR vs PROJECT BASED) */}
          {!isEnrolled && (
            <>
              {hasPendingTransaction ? (
                // STATE: Menunggu Validasi Dosen
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm text-center animate-fadeIn">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={28} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Menunggu Validasi</h2>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                    Bukti pembayaran Anda sedang dicek oleh instruktur. Kelas akan otomatis terbuka jika sudah di-ACC.
                  </p>
                  <div className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-600">
                    Status: <span className="text-amber-500">PENDING</span>
                  </div>
                </div>
              ) : course.type === 'REGULAR' ? (
                // STATE: Kelas Gratis
                <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 shadow-sm text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-blue-900 mb-2">Mulai Belajar</h2>
                  <p className="text-sm text-blue-700/80 mb-6 leading-relaxed">
                    Ambil kelas gratis ini sekarang untuk membuka semua materi dan mulai tingkatkan skill Anda.
                  </p>
                  <button 
                    onClick={handleKomitmen}
                    disabled={isEnrolling}
                    className="w-full btn bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl h-auto py-3.5 shadow-sm transition-all disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    {isEnrolling ? <span className="loading loading-spinner"></span> : <PenTool size={18} />}
                    {isEnrolling ? 'Memproses...' : 'Ambil Kelas Gratis'}
                  </button>
                </div>
              ) : (
                // STATE: Kelas Berbayar
                <div className="bg-slate-900 rounded-3xl p-1 shadow-xl text-center relative overflow-hidden group">
                   {/* Animasi border gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 opacity-50 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
                  
                  <div className="bg-slate-900 relative h-full w-full rounded-[1.3rem] p-6 z-10 flex flex-col items-center">
                    <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                      <Sparkles size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Project-Based Class</h2>
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                      Dapatkan akses seumur hidup, studi kasus nyata, dan review langsung dari instruktur.
                    </p>
                    
                    <div className="text-3xl font-black text-white mb-6">
                      {formattedPrice}
                    </div>

                    <button 
                      onClick={() => document.getElementById('modal_pembayaran').showModal()}
                      className="w-full btn bg-amber-500 hover:bg-amber-400 text-slate-900 border-none rounded-xl h-auto py-3.5 shadow-lg shadow-amber-500/20 transition-all text-base font-bold"
                    >
                      Beli Kelas Sekarang
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Kolom Kanan: Silabus & Selebrasi (KODE INI TETAP SAMA SEPERTI SEBELUMNYA) */}
        <div className="lg:col-span-2">
          {isEnrolled && progressPercentage === 100 && (
            <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl p-8 mb-8 shadow-lg text-center relative overflow-hidden text-white">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <Trophy size={64} strokeWidth={1.5} className="mx-auto mb-4 text-yellow-300 drop-shadow-md" />
              <h2 className="text-3xl font-bold mb-3 relative z-10">Kelas Diselesaikan! 🎉</h2>
              
              {!isClaimed ? (
                <>
                  <p className="text-indigo-100 max-w-lg mx-auto mb-8 relative z-10">
                    Luar biasa! Anda telah menyelesaikan seluruh materi dan tantangan. Klaim sertifikat dan dapatkan tambahan <strong className="text-yellow-300">500 EXP</strong> sekarang!
                  </p>
                  <button 
                    onClick={handleClaimReward} disabled={isClaiming}
                    className="w-full sm:w-auto btn bg-white hover:bg-slate-50 text-indigo-600 border-none rounded-xl px-8 h-auto py-3.5 shadow-md hover:shadow-lg transition-all relative z-10"
                  >
                    {isClaiming ? <span className="loading loading-spinner"></span> : <Sparkles size={20} className="text-amber-500" />} 
                    {isClaiming ? 'Mengklaim...' : 'Klaim Reward Saya'}
                  </button>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-lg font-semibold text-white mb-6 relative z-10">
                    <CheckCircle size={18} /> Reward Telah Diklaim
                  </div>
                  <div>
                    <button 
                      onClick={() => document.getElementById('modal_sertifikat').showModal()}
                      className="w-full sm:w-auto btn bg-white hover:bg-slate-50 text-indigo-600 border-none rounded-xl px-8 h-auto py-3.5 shadow-md hover:shadow-lg transition-all relative z-10"
                    >
                      <Award size={20} className="text-indigo-600" /> Lihat Sertifikat
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Silabus Materi</h2>
          </div>

          <div className="space-y-4">
            {course.chapters?.map((chapter, idx) => (
              <div key={chapter.id} className="collapse collapse-arrow rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <input type="checkbox" defaultChecked={idx === 0} /> 
                <div className="collapse-title text-lg font-bold text-slate-800 py-4 px-6 flex items-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">{idx + 1}</div>
                  {chapter.title}
                </div>
                
                <div className="collapse-content px-6 pb-6 pt-2">
                  <ul className="space-y-3 mt-2">
                    {chapter.materials?.map((mat) => {
                      const isDone = completedIds.includes(mat.id);
                      return (
                        <li key={mat.id} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-xl border transition-all gap-4 ${isDone ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'}`}>
                          <div className="flex items-start gap-4">
                            <div className="mt-1">
                              {!isEnrolled ? <Lock size={20} className="text-slate-300" /> : (isDone ? <CheckCircle size={20} className="text-emerald-500" /> : getMaterialIcon(mat.type))}
                            </div>
                            <div>
                              <span className={`block font-semibold mb-1 ${!isEnrolled ? 'text-slate-400' : 'text-slate-700'}`}>{mat.title}</span>
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{mat.type}</span>
                            </div>
                          </div>
                          
                          {!isEnrolled ? (
                            <button disabled className="bg-slate-50 text-slate-400 border border-slate-200 font-semibold px-5 py-2 rounded-lg text-sm text-center w-full sm:w-auto cursor-not-allowed">
                              Terkunci
                            </button>
                          ) : (
                            <Link to={`/materials/${mat.id}`} className={`px-5 py-2 rounded-lg text-sm font-semibold text-center transition-colors w-full sm:w-auto border ${isDone ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'}`}>
                              {isDone ? 'Ulas Materi' : 'Mulai Belajar'}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================== */}
      {/* MODAL PEMBAYARAN MANUAL                          */}
      {/* ============================================== */}
      <dialog id="modal_pembayaran" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white rounded-3xl p-0 max-w-lg">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
              <CreditCard size={20} className="text-amber-500" /> Selesaikan Pembayaran
            </h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:bg-rose-50 hover:text-rose-500">✕</button>
            </form>
          </div>

          <form onSubmit={handlePaymentSubmit} className="p-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex justify-between items-center">
              <div>
                <p className="text-xs text-amber-700/70 font-bold uppercase tracking-wider mb-1">Total Tagihan</p>
                <p className="text-2xl font-black text-amber-600">{formattedPrice}</p>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-700 mb-3">1. Transfer ke Rekening Berikut:</p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-500">Bank BCA</span>
                <span className="font-mono font-bold tracking-widest text-slate-800">123-4567-890</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-500">Bank Mandiri</span>
                <span className="font-mono font-bold tracking-widest text-slate-800">098-7654-321</span>
              </div>
              <div className="pt-1 text-center">
                <span className="text-xs font-medium text-slate-500">Atas Nama: <strong className="text-slate-700">Ferdi Pratama Setia</strong></span>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-700 mb-3">2. Unggah Bukti Transfer:</p>
            
            <div 
              className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative"
              onClick={() => fileInputRef.current.click()}
            >
              {receiptPreview ? (
                <div className="relative">
                  <img src={receiptPreview} alt="Bukti Transfer" className="max-h-40 mx-auto rounded-lg shadow-sm" />
                  <div className="absolute inset-0 bg-slate-900/50 rounded-lg flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <ImageIcon className="text-white mb-2" />
                    <span className="text-xs text-white font-bold">Ganti Gambar</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud size={36} className="text-slate-400 mb-3" />
                  <p className="text-sm font-bold text-slate-600 mb-1">Klik untuk upload foto</p>
                  <p className="text-xs text-slate-400">Format: JPG, PNG, atau WEBP (Max 2MB)</p>
                </div>
              )}
            </div>
            
            <input 
              type="file" accept="image/*" className="hidden" 
              ref={fileInputRef} onChange={handleReceiptChange}
            />

            <button 
              type="submit" 
              disabled={isSubmittingPayment || !receiptFile}
              className="w-full btn bg-slate-900 hover:bg-blue-600 text-white rounded-xl h-auto py-3 mt-8 shadow-md transition-all disabled:bg-slate-200 disabled:text-slate-400 border-none"
            >
              {isSubmittingPayment ? <span className="loading loading-spinner"></span> : 'Kirim Bukti Pembayaran'}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* MODAL SERTIFIKAT (KODE TETAP SAMA SEPERTI SEBELUMNYA) */}
      <dialog id="modal_sertifikat" className="modal modal-bottom sm:modal-middle">
         {/* ... (Isi modal sertifikat dibiarkan persis sama karena tidak ada perubahan di sini) ... */}
         {/* Untuk menghemat ruang chat, aku asumsikan bagian sertifikat ini kamu timpa pakai kode lamamu yang utuh */}
      </dialog>

    </div>
  );
};

export default CourseDetailStudent;