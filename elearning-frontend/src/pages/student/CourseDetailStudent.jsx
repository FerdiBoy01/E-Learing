import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, HelpCircle, Code, ChevronLeft, LayoutList, 
  UserCheck, CheckCircle, Lock, AlertTriangle, 
  Trophy, Award, Sparkles, Download, BookOpen, CreditCard, 
  UploadCloud, Image as ImageIcon, ChevronRight, DollarSign, KeyRound, Coins 
} from 'lucide-react'; 
import confetti from 'canvas-confetti'; // 🔥 IMPORT ANIMASI CONFETTI
import api from '../../config/axios';
import useAuthStore from '../../store/authStore';
import toast from '../../utils/toast';

const CourseDetailStudent = () => {
  // 🔥 TAMBAH setUser UNTUK UPDATE STATE GLOBAL
  const { user, setUser } = useAuthStore();
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [course, setCourse] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [completedDate, setCompletedDate] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const [hasPendingTransaction, setHasPendingTransaction] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isRedeemingPoints, setIsRedeemingPoints] = useState(false);
  const fileInputRef = useRef(null);

  const [inputAccessCode, setInputAccessCode] = useState('');

  // ==========================================
  // FETCH DATA INITIAL
  // ==========================================
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
      setHasPendingTransaction(resEnroll.data.data.has_pending_transaction || false);

      localStorage.setItem('activeCourseId', courseId);
    } catch (error) { 
      console.error("Error fetching data", error); 
      setError(true); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleKomitmen = async (e) => {
    if (e) e.preventDefault();
    
    if (course.visibility === 'PRIVATE') {
      if (!inputAccessCode || inputAccessCode.trim() !== course.access_code) {
        return toast.error("Kode akses kelas yang kamu masukkan salah coy!");
      }
    }

    if (course.type === 'PROJECT_BASED') {
      document.getElementById('modal_pembayaran').showModal();
      return; 
    }

    setIsEnrolling(true);
    try {
      await api.post(`/enrollments/${courseId}`, {
        accessCode: inputAccessCode.trim()
      });
      
      setIsEnrolled(true);
      toast.success("Berhasil bergabung ke kelas! Selamat belajar.");
      fetchCourseData(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mendaftar ke kelas ini.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Ukuran gambar maksimal 2MB ya!");

    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setReceiptPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!receiptFile) return toast.error("Harap unggah bukti transfer terlebih dahulu!");

    setIsSubmittingPayment(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('course_id', courseId);
      
      await api.post('/transactions/manual', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      document.getElementById('modal_pembayaran').close();
      setHasPendingTransaction(true);
      toast.success("Bukti transfer berhasil dikirim! Menunggu validasi instruktur.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengirim bukti pembayaran.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handlePayWithPoints = async () => {
    if ((user?.points || 0) < (course?.price || 0)) {
      return toast.error(`Poin kamu nggak cukup coy! Butuh ${course?.price} Poin.`);
    }

    if (!window.confirm(`Yakin ingin menukarkan ${course?.price} Poin kamu untuk kelas ini?`)) return;

    setIsRedeemingPoints(true);
    try {
      await api.post('/transactions/pay-with-points', { course_id: courseId });
      
      // Update global state biar saldo langsung berkurang di UI
      if (user) {
        setUser({ ...user, points: user.points - course.price });
      }

      toast.success("💥 BOOM! Berhasil menukarkan Poin. Selamat belajar!");
      document.getElementById('modal_pembayaran').close();
      
      fetchCourseData(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menukarkan poin.");
    } finally {
      setIsRedeemingPoints(false);
    }
  };

  // 🔥 UPDATE BESAR: LOGIKA KLAIM REWARD (ANIMASI & UPDATE STATE)
  const handleClaimReward = async () => {
    setIsClaiming(true);
    try {
      const response = await api.post(`/courses/${courseId}/claim-reward`);
      const { expGained, pointsGained, newLevel, isLevelUp } = response.data.data;

      setIsClaimed(true);
      setCompletedDate(new Date().toISOString());

      // 1. Tembak Animasi Confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444']
      });

      // 2. Update Global State (EXP, Point, Level langsung nambah)
      if (user) {
        setUser({
          ...user,
          exp: user.exp + expGained,
          points: user.points + pointsGained,
          level: newLevel || user.level
        });
      }

      // 3. Tampilkan Notifikasi Spesial
      toast.success(`🎉 Lulus! Dapet +${pointsGained} Poin & +${expGained} EXP!`);
      
      // Jika dia naik level, kasih notif susulan
      if (isLevelUp) {
        setTimeout(() => {
          toast.success(`🌟 LEVEL UP! Kamu sekarang Level ${newLevel}!`);
        }, 1500);
      }

      document.getElementById('modal_sertifikat').showModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal klaim sertifikat.");
    } finally {
      setIsClaiming(false);
    }
  };

  const getMaterialUI = (type, isDone, isLocked) => {
    if (isLocked) return {
      wrapperClass: 'bg-slate-50/50 border-slate-200 opacity-60 select-none',
      iconBox: 'bg-slate-200 text-slate-400',
      icon: <Lock size={18} />,
      badge: 'bg-slate-200 text-slate-500',
      label: 'TERKUNCI'
    };

    if (isDone) return {
      wrapperClass: 'bg-emerald-50/30 border-emerald-200 shadow-sm',
      iconBox: 'bg-emerald-100 text-emerald-600',
      icon: <CheckCircle size={18} />,
      badge: 'bg-emerald-100 text-emerald-700',
      label: 'SELESAI'
    };

    switch (type) {
      case 'LESSON': return {
        wrapperClass: 'bg-white border-slate-200 hover:border-slate-800 hover:shadow-md transition-all',
        iconBox: 'bg-blue-50 text-blue-600',
        icon: <FileText size={18} />,
        badge: 'bg-blue-50 text-blue-600 border border-blue-100',
        label: 'MATERI'
      };
      case 'QUIZ': return {
        wrapperClass: 'bg-white border-slate-200 hover:border-slate-800 hover:shadow-md transition-all',
        iconBox: 'bg-amber-50 text-amber-600',
        icon: <HelpCircle size={18} />,
        badge: 'bg-amber-50 text-amber-600 border border-amber-100',
        label: 'KUIS'
      };
      case 'CHALLENGE': return {
        wrapperClass: 'bg-white border-slate-200 hover:border-slate-800 hover:shadow-md transition-all',
        iconBox: 'bg-indigo-50 text-indigo-600',
        icon: <Code size={18} />,
        badge: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
        label: 'TUGAS'
      };
      default: return {
        wrapperClass: 'bg-white border-slate-200',
        iconBox: 'bg-slate-100 text-slate-500',
        icon: <FileText size={18} />,
        badge: 'bg-slate-100 text-slate-600',
        label: type
      };
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

  if (loading) return <div className="min-h-[70vh] flex justify-center items-center"><span className="loading loading-spinner loading-lg text-slate-800"></span></div>;

  if (error || !course) return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center text-center">
      <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6"><AlertTriangle size={40} /></div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Kelas Tidak Tersedia</h2>
      <p className="text-slate-500 mb-6 text-sm">Mata kuliah yang kamu cari mungkin belum dirilis atau ditarik oleh instruktur.</p>
      <Link to="/courses" className="btn bg-slate-900 text-white rounded-xl border-none px-6">Kembali ke Katalog</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto font-sans pb-24 pt-4 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      
      <Link to="/courses" className="inline-flex items-center gap-2 mb-6 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} strokeWidth={2.5} /> Kembali ke Katalog
      </Link>

      <div className={`rounded-3xl p-6 sm:p-10 mb-8 border shadow-sm relative overflow-hidden bg-white border-slate-200`}>
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 opacity-20 blur-3xl pointer-events-none ${course.type === 'PROJECT_BASED' ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
        
        <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
          <div className="px-2.5 py-1 rounded-md flex items-center gap-1.5 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-widest border border-slate-200">
            <LayoutList size={12} /> {course.chapters?.length || 0} BAB 
          </div>
          {course.type === 'PROJECT_BASED' ? (
             <div className="px-2.5 py-1 rounded-md flex items-center gap-1.5 bg-amber-50 text-amber-700 font-bold text-[10px] uppercase tracking-widest border border-amber-200">
             <Sparkles size={12} className="text-amber-500" /> Premium Project
           </div>
          ) : (
            <div className="px-2.5 py-1 rounded-md flex items-center gap-1.5 bg-blue-50 text-blue-700 font-bold text-[10px] uppercase tracking-widest border border-blue-200">
             Free Access
           </div>
          )}
          {course.visibility === 'PRIVATE' && (
            <div className="px-2.5 py-1 rounded-md flex items-center gap-1.5 bg-rose-50 text-rose-700 font-bold text-[10px] uppercase tracking-widest border border-rose-200">
              <Lock size={12} /> Kelas Privat
            </div>
          )}
          {isEnrolled && (
            <div className="px-2.5 py-1 rounded-md flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-widest border border-emerald-200">
              <CheckCircle size={12} /> Diikuti
            </div>
          )}
        </div>
        
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight relative z-10 leading-tight mb-4">
          {course.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-3xl relative z-10 leading-relaxed font-medium">
          {course.description}
        </p>

        {isEnrolled && (
          <div className="relative z-10 mt-6 pt-5 border-t border-slate-100">
            <div className="flex justify-between items-end mb-2 font-bold text-slate-600 text-xs uppercase tracking-wider">
              <span>Progres Pembelajaran Kamu</span>
              <span className="text-slate-900 font-black">{progressPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div className="h-full bg-slate-900 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center md:text-left flex flex-col items-center md:items-start group">
            <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-4">
              <UserCheck size={12} /> Instruktur Utama
            </div>
            <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-200 shadow-sm">
              <img src={course.lecturer?.avatar_url || `https://ui-avatars.com/api/?name=${course.lecturer?.name || 'Dosen'}&background=0f172a&color=fff&size=200`} alt="Dosen" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-base font-extrabold mb-1 text-slate-900">{course.lecturer?.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {course.lecturer?.bio || "Pengajar bersertifikasi di bidangnya."}
            </p>
          </div>

          {!isEnrolled && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              {hasPendingTransaction ? (
                <div className="text-center animate-in fade-in">
                  <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-200">
                    <BookOpen size={20} />
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 mb-1">Menunggu Validasi</h2>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
                    Bukti pembayaran sedang diperiksa. Kelas akan terbuka setelah disetujui instruktur.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl py-2 px-4 text-xs font-black text-amber-700 uppercase tracking-widest text-center">
                    Status: Pending Verification
                  </div>
                </div>
              ) : course.visibility === 'PRIVATE' ? (
                <form onSubmit={handleKomitmen} className="space-y-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Masukkan Kode Akses</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Kelas ini bersifat privat. Silakan minta kode akses ke instruktur.</p>
                  </div>
                  <input 
                    type="text" required
                    placeholder="Contoh: X7B9A2"
                    value={inputAccessCode}
                    onChange={(e) => setInputAccessCode(e.target.value)}
                    className="input input-bordered w-full bg-slate-50 focus:bg-white focus:border-slate-900 rounded-xl font-black text-center tracking-widest uppercase text-slate-800"
                  />
                  <button 
                    type="submit" disabled={isEnrolling}
                    className="w-full btn bg-slate-900 hover:bg-slate-800 text-white border-none rounded-xl font-bold text-xs uppercase tracking-wider"
                  >
                    {isEnrolling ? <span className="loading loading-spinner"></span> : 'Validasi & Ikuti Kelas'}
                  </button>
                </form>
              ) : course.type === 'REGULAR' ? (
                <div className="text-center">
                  <h2 className="text-lg font-black text-slate-900 mb-1">Mulai Belajar</h2>
                  <p className="text-xs text-slate-400 mb-5 font-medium leading-relaxed">
                    Akses seluruh materi kurikulum fundamental kelas ini secara gratis.
                  </p>
                  <button 
                    onClick={handleKomitmen} disabled={isEnrolling}
                    className="w-full btn bg-slate-900 hover:bg-slate-800 text-white border-none rounded-xl font-bold text-xs uppercase tracking-wider"
                  >
                    {isEnrolling ? <span className="loading loading-spinner"></span> : 'Gabung Kelas Sekarang'}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3 border border-amber-100">
                    <Sparkles size={18} />
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 mb-1">Premium Workspace</h2>
                  <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">
                    Ujian berbasis koding, sertifikat kompetensi, dan evaluasi langsung.
                  </p>
                  <div className="text-2xl font-black text-slate-900 mb-5 tracking-tight">
                    {formattedPrice}
                  </div>
                  <button 
                    onClick={() => document.getElementById('modal_pembayaran').showModal()}
                    className="w-full btn bg-amber-500 hover:bg-amber-400 text-slate-900 border-none rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/10"
                  >
                    Beli Kelas Premium
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          
          {isEnrolled && progressPercentage === 100 && (
            <div className="bg-slate-900 rounded-3xl p-8 mb-8 text-center relative overflow-hidden text-white border border-slate-800 shadow-xl shadow-slate-200">
              <Trophy size={48} className="mx-auto mb-3 text-amber-400" />
              <h2 className="text-xl font-black mb-1">Selamat, Kamu Lulus! 🎉</h2>
              
              {!isClaimed ? (
                <>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto mb-5 font-medium leading-relaxed">
                    Kamu telah menyelesaikan seluruh materi. Klaim sertifikat kompetensi kelulusan kamu sekarang!
                  </p>
                  <button 
                    onClick={handleClaimReward} disabled={isClaiming}
                    className="btn bg-white hover:bg-slate-100 text-slate-900 border-none rounded-xl px-6 font-bold text-xs uppercase tracking-wider"
                  >
                    {isClaiming ? <span className="loading loading-spinner"></span> : <Sparkles size={14} className="text-amber-500 mr-1.5" />} 
                    Klaim Sertifikat
                  </button>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-5 mt-1">
                    <CheckCircle size={14} /> Terverifikasi
                  </div>
                  <div>
                    <button 
                      onClick={() => document.getElementById('modal_sertifikat').showModal()}
                      className="btn bg-white hover:bg-slate-100 text-slate-900 border-none rounded-xl px-6 font-bold text-xs uppercase tracking-wider"
                    >
                      <Award size={14} className="mr-1.5 text-amber-500" /> Buka Sertifikat
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-lg font-black text-slate-900">Kurikulum Silabus</h2>
          </div>

          <div className="space-y-4">
            {course.chapters?.map((chapter, idx) => (
              <div key={chapter.id} className="collapse collapse-arrow rounded-2xl border border-slate-200 bg-white shadow-sm">
                <input type="checkbox" defaultChecked={idx === 0} /> 
                <div className="collapse-title text-sm font-extrabold text-slate-800 py-4 px-5 flex items-center gap-3.5 hover:bg-slate-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black shrink-0 border border-slate-200">{idx + 1}</div>
                  {chapter.title}
                </div>
                
                <div className="collapse-content px-5 pb-5 pt-0">
                  <div className="space-y-2.5 mt-2">
                    {chapter.materials?.map((mat) => {
                      const isDone = completedIds.includes(mat.id);
                      const isLocked = !isEnrolled;
                      const ui = getMaterialUI(mat.type, isDone, isLocked);

                      return (
                        <div key={mat.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border gap-4 ${ui.wrapperClass}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-white/50 ${ui.iconBox}`}>
                              {ui.icon}
                            </div>
                            <div>
                              <span className={`block font-bold text-xs sm:text-sm mb-0.5 ${isLocked ? 'text-slate-400' : 'text-slate-700'}`}>
                                {mat.title}
                              </span>
                              <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${ui.badge}`}>
                                {ui.label}
                              </span>
                            </div>
                          </div>
                          
                          {!isLocked && (
                            <Link to={`/materials/${mat.id}`} className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-center border flex items-center justify-center gap-1.5 ${isDone ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800 shadow-sm'}`}>
                              {isDone ? 'Ulas Kembali' : 'Pelajari'} {!isDone && <ChevronRight size={12}/>}
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================== */}
      {/* MODAL PEMBAYARAN                               */}
      {/* ============================================== */}
      <dialog id="modal_pembayaran" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white rounded-3xl p-0 max-w-md">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <CreditCard size={16} className="text-slate-700" /> Formulir Pembayaran
            </h3>
            <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost text-slate-400">✕</button></form>
          </div>
          <form onSubmit={handlePaymentSubmit} className="p-6">
            <div className="bg-slate-900 rounded-xl p-4 mb-5 flex justify-between items-center">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Tagihan</p>
                <p className="text-lg font-black text-white">{formattedPrice}</p>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-amber-400">
                <DollarSign size={18} />
              </div>
            </div>

            {/* 🔥 SEKTOR GAMIFIKASI: TOMBOL TUKAR POIN INSTAN */}
            <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl mb-6 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Saldo Poin Kamu</p>
                  <p className="text-base font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Coins size={16} className="text-amber-500" /> {new Intl.NumberFormat('id-ID').format(user?.points || 0)} Pts
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handlePayWithPoints}
                  disabled={isRedeemingPoints || (user?.points || 0) < (course?.price || 0)}
                  className="btn btn-sm bg-amber-500 hover:bg-amber-400 text-slate-900 border-none rounded-xl font-bold text-xs px-4 shadow-sm disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
                >
                  {isRedeemingPoints ? <span className="loading loading-spinner loading-xs"></span> : 'Tukar Poin'}
                </button>
              </div>
              
              {(user?.points || 0) < (course?.price || 0) ? (
                <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                  ⚠️ Poin belum cukup. Selesaikan kelas gratis/privat dulu buat nambah saldo!
                </p>
              ) : (
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  ✨ Saldo poin mencukupi! Klik tombol Tukar Poin untuk akses instan tanpa transfer uang.
                </p>
              )}
            </div>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">Atau Metode Manual</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">1. Pilihan Rekening Transfer</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                <span className="text-xs font-bold text-slate-600">Bank BCA</span>
                <span className="font-mono text-xs font-black text-slate-800">123-4567-890</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                <span className="text-xs font-bold text-slate-600">Bank Mandiri</span>
                <span className="font-mono text-xs font-black text-slate-800">098-7654-321</span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 pt-0.5">Atas Nama: <strong className="text-slate-700">Ferdi Pratama Setia</strong></p>
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">2. Unggah Bukti Pembayaran</p>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:bg-slate-50 cursor-pointer relative" onClick={() => fileInputRef.current.click()}>
              {receiptPreview ? (
                <div className="relative">
                  <img src={receiptPreview} alt="Bukti Transfer" className="max-h-28 mx-auto rounded-lg" />
                  <div className="absolute inset-0 bg-slate-900/40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-bold uppercase">Ganti Gambar</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud size={24} className="text-slate-400 mb-1.5" />
                  <p className="text-xs font-bold text-slate-700">Pilih berkas bukti transfer</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Maksimal resolusi berkas 2MB</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleReceiptChange}/>
            
            <button type="submit" disabled={isSubmittingPayment || !receiptFile} className="w-full btn bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 mt-6 border-none font-bold text-xs uppercase tracking-wider">
              {isSubmittingPayment ? <span className="loading loading-spinner"></span> : 'Kirim Konfirmasi Transfer'}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* ============================================== */}
      {/* MODAL SERTIFIKAT                               */}
      {/* ============================================== */}
      <dialog id="modal_sertifikat" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box w-full max-w-4xl bg-white rounded-2xl p-0 shadow-2xl relative overflow-hidden">
          <form method="dialog">
            <button className="btn btn-sm btn-circle bg-white text-slate-500 border-slate-200 hover:bg-slate-100 absolute right-4 top-4 z-50">✕</button>
          </form>

          <div className="p-6 md:p-12 text-center relative bg-slate-50 overflow-hidden">
            <div className="absolute inset-4 border-2 border-slate-200 rounded-xl pointer-events-none"></div>
            <div className="absolute inset-6 border border-slate-100 rounded-lg pointer-events-none"></div>
            
            <div className="relative z-10 pt-2">
              <div className="w-12 h-12 mx-auto bg-slate-900 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <BookOpen size={24} className="text-white" />
              </div>

              <p className="font-black text-slate-800 tracking-[0.2em] uppercase text-[9px] mb-6">
                Certificate of Completion
              </p>
              
              <p className="text-slate-400 mb-1 text-xs font-medium">Sertifikat ini diberikan dengan bangga kepada:</p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-5 tracking-tight">
                {user?.name || "Nama Lengkap Mahasiswa"}
              </h1>

              <div className="w-16 h-0.5 bg-slate-200 mx-auto mb-5"></div>

              <p className="text-slate-400 mb-1 text-xs font-medium">Atas keberhasilannya menyelesaikan kurikulum kelas:</p>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-10 leading-tight">
                {course?.title}
              </h2>

              <div className="flex flex-col md:flex-row justify-between items-center md:items-end mt-12 px-6 gap-6">
                <div className="text-center order-2 md:order-1">
                  <div className="border-b border-slate-300 pb-1.5 mb-1.5 min-w-[150px]">
                    <p className="font-serif text-xl italic text-slate-700 select-none">Ferdi Pratama S.</p>
                  </div>
                  <p className="font-bold text-slate-800 text-[9px] uppercase tracking-widest">Ferdi Pratama Setia</p>
                  <p className="text-slate-400 text-[8px] font-bold uppercase mt-0.5">CEO NusaLearn Platform</p>
                </div>
                
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-yellow-400 flex items-center justify-center shadow-md order-1 md:order-2 border-4 border-white">
                  <Award size={36} className="text-amber-800" strokeWidth={1.5} />
                </div>

                <div className="text-center order-3">
                  <div className="border-b border-slate-300 pb-1.5 mb-1.5 min-w-[150px]">
                    <p className="font-bold text-slate-800 text-sm">
                      {completedDate ? new Date(completedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '16 Mei 2026'}
                    </p>
                  </div>
                  <p className="font-bold text-slate-400 text-[9px] uppercase tracking-widest">Diterbitkan Pada</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-t border-slate-100 p-4 flex justify-center print:hidden">
            <button 
              onClick={() => window.print()} 
              className="btn bg-slate-900 hover:bg-slate-800 text-white border-none font-bold px-6 rounded-xl flex items-center gap-2 text-xs uppercase tracking-widest"
            >
              <Download size={14} /> Unduh File PDF
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

    </div>
  );
};

export default CourseDetailStudent;