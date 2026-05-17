import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FileText,
  HelpCircle,
  Code,
  ChevronLeft,
  LayoutList,
  UserCheck,
  CheckCircle,
  Lock,
  AlertTriangle,
  Trophy,
  Award,
  Sparkles,
  Download,
  BookOpen,
  CreditCard,
  UploadCloud,
  Image as ImageIcon,
  ChevronRight,
  DollarSign,
  KeyRound,
  Coins,
  Share2,
  Clock,
  Send,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import api from "../../config/axios";
import useAuthStore from "../../store/authStore";
import toast from "../../utils/toast";

const getMaterialIcon = (type) => {
  if (type === "LESSON") return <FileText size={15} />;
  if (type === "QUIZ") return <HelpCircle size={15} />;
  if (type === "CHALLENGE") return <Code size={15} />;
  return <FileText size={15} />;
};

const CourseDetailStudent = () => {
  const { user, setUser } = useAuthStore();
  const { courseId } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [course, setCourse] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [unlockedMaterialIds, setUnlockedMaterialIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [completedDate, setCompletedDate] = useState(null);
  const [hasPendingTransaction, setHasPendingTransaction] = useState(false);

  const [activeMaterialId, setActiveMaterialId] = useState(null);
  const [activeMaterialData, setActiveMaterialData] = useState(null);
  const [isMaterialLoading, setIsMaterialLoading] = useState(false);

  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionImage, setSubmissionImage] = useState("");
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const challengeFileRef = useRef(null);

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isUnlockingMaterial, setIsUnlockingMaterial] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isRedeemingPoints, setIsRedeemingPoints] = useState(false);
  const fileInputRef = useRef(null);
  const [inputAccessCode, setInputAccessCode] = useState("");

  const readerRef = useRef(null);

  // ==========================================
  // FETCH DATA
  // ==========================================
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data.data.course);

      const resProg = await api.get("/progress/me");
      setCompletedIds(
        resProg.data.data.progress.map((p) => p.material_id || p.materialId),
      );

      const resEnroll = await api.get(`/courses/${courseId}/enroll-status`);
      setIsEnrolled(resEnroll.data.data.enrolled);
      setIsClaimed(resEnroll.data.data.is_completed);
      setCompletedDate(resEnroll.data.data.completed_at);
      setHasPendingTransaction(
        resEnroll.data.data.has_pending_transaction || false,
      );

      try {
        const resUnlocked = await api.get("/courses/unlocked-materials/me");
        setUnlockedMaterialIds(resUnlocked.data.data || []);
      } catch (err) {}
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
    window.scrollTo(0, 0);
  }, [courseId]);

  // ==========================================
  // MEMOIZATION COMPUTATION
  // ==========================================
  const { allMaterials, progressPercentage, prevMaterialId, nextMaterialId } =
    useMemo(() => {
      let materials = [];
      if (course?.chapters) {
        materials = course.chapters.flatMap((ch) => ch.materials || []);
      }
      const total = materials.length;
      const completedCount = materials.filter((m) =>
        completedIds.includes(m.id),
      ).length;
      const progress =
        total === 0 ? 0 : Math.round((completedCount / total) * 100);

      const currentIndex = materials.findIndex(
        (m) => m.id === activeMaterialId,
      );
      const prevId = currentIndex > 0 ? materials[currentIndex - 1].id : null;
      const nextId =
        currentIndex !== -1 && currentIndex < materials.length - 1
          ? materials[currentIndex + 1].id
          : null;

      return {
        allMaterials: materials,
        progressPercentage: progress,
        prevMaterialId: prevId,
        nextMaterialId: nextId,
      };
    }, [course, completedIds, activeMaterialId]);

  // ==========================================
  // TRANSACTIONS
  // ==========================================
  const handleKomitmen = async (e) => {
    if (e) e.preventDefault();
    if (
      course.visibility === "PRIVATE" &&
      (!inputAccessCode || inputAccessCode.trim() !== course.access_code)
    ) {
      return toast.error("Kode akses kelas salah.");
    }
    if (course.type === "PROJECT_BASED") {
      document.getElementById("modal_pembayaran").showModal();
      return;
    }
    setIsEnrolling(true);
    try {
      await api.post(`/enrollments/${courseId}`, {
        accessCode: inputAccessCode.trim(),
      });
      setIsEnrolled(true);
      toast.success("Berhasil masuk kelas.");
      fetchCourseData();
    } catch (error) {
      toast.error("Gagal bergabung.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handlePayWithPoints = async () => {
    const currentPoints = Number(user?.points) || 0;
    if (currentPoints < (course?.price || 0))
      return toast.error("Poin tidak cukup.");
    if (!window.confirm(`Tukar ${course?.price} Pts untuk akses kelas?`))
      return;

    setIsRedeemingPoints(true);
    try {
      await api.post("/transactions/pay-with-points", { course_id: courseId });
      if (user) setUser({ ...user, points: currentPoints - course.price });
      toast.success("Kelas berhasil dibeli!");
      document.getElementById("modal_pembayaran").close();
      fetchCourseData();
    } catch (error) {
      toast.error("Gagal memproses poin.");
    } finally {
      setIsRedeemingPoints(false);
    }
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setReceiptPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!receiptFile) return toast.error("Unggah slip transfer!");
    setIsSubmittingPayment(true);
    try {
      const formData = new FormData();
      formData.append("receipt", receiptFile);
      formData.append("course_id", courseId);
      await api.post("/transactions/manual", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      document.getElementById("modal_pembayaran").close();
      setHasPendingTransaction(true);
      toast.success("Bukti terkirim! Menunggu tinjauan.");
    } catch (error) {
      toast.error("Gagal mengirim data.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleUnlockEceran = async (
    materialId,
    materialTitle,
    unlockPrice = 3000,
  ) => {
    if ((Number(user?.points) || 0) < unlockPrice)
      return toast.error("Poin NusaPoints Anda kurang.");
    if (
      !window.confirm(
        `Buka materi "${materialTitle}" seharga ${unlockPrice} Pts?`,
      )
    )
      return;

    setIsUnlockingMaterial(true);
    try {
      const response = await api.post("/transactions/unlock-material", {
        materialId,
      });
      if (user) setUser({ ...user, points: response.data.data.pointsLeft });
      toast.success("Akses materi eceran terbuka!");
      await fetchCourseData();
      handleSelectMaterial(materialId);
    } catch (error) {
      toast.error("Gagal memproses eceran.");
    } finally {
      setIsUnlockingMaterial(false);
    }
  };

  // ==========================================
  // WORKSPACE ACTION HANDLERS
  // ==========================================
  const handleSelectMaterial = async (matId) => {
    setActiveMaterialId(matId);
    setSubmissionImage("");
    setSubmissionLink("");

    if (window.innerWidth < 1024 && readerRef.current) {
      readerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    try {
      setIsMaterialLoading(true);
      const resMat = await api.get(`/content/materials/${matId}`);
      setActiveMaterialData(resMat.data.data.material);
    } catch (error) {
      toast.error("Materi terkunci.");
      setActiveMaterialData(null);
    } finally {
      setIsMaterialLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await api.post(`/progress/materials/${activeMaterialId}/complete`);
      setCompletedIds((prev) => [...prev, activeMaterialId]);
      toast.success("Materi rampung!");
      if (nextMaterialId) handleSelectMaterial(nextMaterialId);
    } catch (error) {
      toast.error("Gagal update progres.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      setIsUploadingImage(true);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmissionImage(res.data.url);
      toast.success(" screenshot tersimpan!");
    } catch (error) {
      toast.error("Upload gagal.");
    } finally {
      setIsUploadingImage(false);
      e.target.value = null;
    }
  };

  const handleSubmitChallenge = async () => {
    if (!submissionLink) return toast.error("URL repositori wajib diisi.");
    setIsSubmittingChallenge(true);
    try {
      await api.post(`/submissions/materials/${activeMaterialId}`, {
        submission_url: submissionLink,
        image_url: submissionImage,
      });
      await api.post(`/progress/materials/${activeMaterialId}/complete`);
      setCompletedIds((prev) => [...prev, activeMaterialId]);
      toast.success("Tugas praktik terkirim!");
    } catch (error) {
      toast.error("Gagal mengirim.");
    } finally {
      setIsSubmittingChallenge(false);
    }
  };

  const handleClaimReward = async () => {
    setIsClaiming(true);
    try {
      const response = await api.get(`/courses/${courseId}/claim-reward`);
      const { expGained, pointsGained, newLevel } = response.data.data;
      setIsClaimed(true);
      setCompletedDate(new Date().toISOString());

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      if (user)
        setUser({
          ...user,
          exp: (Number(user.exp) || 0) + expGained,
          points: (Number(user.points) || 0) + pointsGained,
          level: newLevel || user.level,
        });

      toast.success("Sertifikat digital diterbitkan!");
      document.getElementById("modal_sertifikat").showModal();
    } catch (error) {
      toast.error("Gagal klaim sertifikat.");
    } finally {
      setIsClaiming(false);
    }
  };

  const formattedPrice = course
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(course.price || 0)
    : "Rp 0";

  if (loading)
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <span className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></span>
        <p className="text-slate-500 text-sm font-semibold animate-pulse">
          Menyiapkan workspace...
        </p>
      </div>
    );

  if (error || !course)
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-4">
        <AlertTriangle size={48} className="text-rose-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Kelas Tidak Tersedia
        </h2>
        <Link
          to="/courses"
          className="btn bg-slate-900 text-white rounded-lg text-xs"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );

  return (
    // Memaksa layar utama mengunci tinggi scroll global agar dual-scroll aktif di bawahnya
    <div className="max-w-[1500px] mx-auto font-sans pt-2 px-4 sm:px-6 lg:px-8 lg:h-[calc(100vh-6rem)] lg:overflow-hidden flex flex-col">
      <div className="shrink-0">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft size={16} strokeWidth={2.5} /> Kembali ke Katalog
        </Link>
      </div>

      {/* ================================================= */}
      {/* DOUBLE-SCROLL SPLIT INTERFACE                     */}
      {/* ================================================= */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-1 min-h-0 mb-6">
        {/* 🔥 KIRI: INDEPENDENT SCROLL SILABUS & ACCORDION (Efek Kaca Diperjelas) */}
        <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-4 lg:h-full lg:overflow-y-auto hide-scrollbar p-0.5">
          {/* Info Utama Kelas */}
          <div className="p-5 rounded-xl bg-slate-950 text-white shadow-md border border-slate-900 shrink-0">
            <h1 className="text-lg font-bold leading-tight mb-1.5 tracking-tight">
              {course.title}
            </h1>
            <div className="flex items-center gap-2 mb-3">
              {course.type === "PROJECT_BASED" ? (
                <span className="bg-amber-500/20 border border-amber-500/30 text-[9px] font-bold text-amber-400 px-2 py-0.5 rounded">
                  PREMIUM PROJECT
                </span>
              ) : (
                <span className="bg-white/10 border border-white/10 text-[9px] font-bold text-slate-300 px-2 py-0.5 rounded">
                  FREE PROGRAM
                </span>
              )}
            </div>
            {isEnrolled && (
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Capaian</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Card Instruktur */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl p-3.5 shadow-sm flex items-center gap-3 shrink-0">
            <img
              src={
                course.lecturer?.avatar_url ||
                `https://ui-avatars.com/api/?name=${course.lecturer?.name}&background=e0e7ff&color=4f46e5`
              }
              alt="Instruktur"
              className="w-9 h-9 rounded-lg object-cover shadow-inner border"
            />
            <div>
              <p className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest">
                Dosen Mentor
              </p>
              <h3 className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                {course.lecturer?.name}
              </h3>
            </div>
          </div>

          {/* Pembelian Card */}
          {!isEnrolled && (
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl shadow-sm p-4 shrink-0">
              {hasPendingTransaction ? (
                <div className="text-center py-1">
                  <Clock size={18} className="mx-auto text-amber-500 mb-1" />
                  <p className="text-[11px] font-bold text-slate-900">
                    Verifikasi Berjalan
                  </p>
                </div>
              ) : course.type === "REGULAR" ||
                course.visibility === "PRIVATE" ? (
                <form onSubmit={handleKomitmen} className="space-y-2">
                  {course.visibility === "PRIVATE" && (
                    <input
                      type="text"
                      required
                      placeholder="KODE AKSES"
                      value={inputAccessCode}
                      onChange={(e) => setInputAccessCode(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border rounded-lg text-xs font-bold text-center tracking-widest uppercase outline-none focus:border-indigo-500"
                    />
                  )}
                  <button
                    type="submit"
                    disabled={isEnrolling}
                    className="w-full bg-slate-950 hover:bg-slate-800 text-white py-2 rounded-lg text-xs font-semibold shadow-sm"
                  >
                    Mulai Belajar
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900 mb-3">
                    {formattedPrice}
                  </p>
                  <button
                    onClick={() =>
                      document.getElementById("modal_pembayaran").showModal()
                    }
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1"
                  >
                    <CreditCard size={13} /> Beli Akses Penuh
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Accordion List Silabus (Scroll Mandiri di Kiri) */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[250px]">
            <div className="p-3 border-b border-slate-200/50 bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-[11px] text-slate-800 uppercase tracking-wider">
                Silabus Program
              </h3>
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-1">
              {course.chapters?.map((chapter, idx) => (
                <div
                  key={chapter.id}
                  className="collapse collapse-arrow rounded-none"
                >
                  <input
                    type="checkbox"
                    defaultChecked={idx === 0}
                    className="min-h-0"
                  />
                  <div className="collapse-title min-h-0 p-2 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-white border text-slate-700 flex items-center justify-center text-[9px] font-bold shrink-0 shadow-xs">
                      {idx + 1}
                    </div>
                    <span className="truncate text-slate-900 font-semibold">
                      {chapter.title}
                    </span>
                  </div>
                  <div className="collapse-content px-1 pb-1 pt-0 space-y-0.5">
                    {chapter.materials?.map((mat) => {
                      const isDone = completedIds.includes(mat.id);
                      const isLocked =
                        !isEnrolled && !unlockedMaterialIds.includes(mat.id);
                      const isActive = activeMaterialId === mat.id;

                      return (
                        <button
                          key={mat.id}
                          onClick={() =>
                            isLocked
                              ? handleUnlockEceran(
                                  mat.id,
                                  mat.title,
                                  mat.unlock_points || 3000,
                                )
                              : handleSelectMaterial(mat.id)
                          }
                          className={`w-full text-left flex items-start gap-2 p-2 rounded-lg transition-all border ${
                            isActive
                              ? "bg-white border-slate-300 shadow-xs text-indigo-900"
                              : "border-transparent hover:bg-white/50 text-slate-700"
                          }`}
                        >
                          <div
                            className={`mt-0.5 shrink-0 ${isLocked ? "text-slate-400" : isDone ? "text-emerald-500" : isActive ? "text-indigo-600" : "text-slate-400"}`}
                          >
                            {isLocked ? (
                              <Lock size={12} />
                            ) : isDone ? (
                              <CheckCircle size={12} />
                            ) : (
                              getMaterialIcon(mat.type)
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p
                              className={`text-[11px] font-medium leading-tight truncate ${isActive ? "font-bold text-indigo-600" : isLocked ? "text-slate-400" : "text-slate-800"}`}
                            >
                              {mat.title}
                            </p>
                            {isLocked && (
                              <p className="text-[8px] font-bold text-amber-600 mt-0.5 flex items-center gap-0.5">
                                <Coins size={9} />{" "}
                                {(mat.unlock_points || 3000) / 1000}K Pts
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🔥 KANAN: INDEPENDENT SCROLL AREA MEMBACA (Scroll Mandiri di Kanan) */}
        <div
          ref={readerRef}
          className="flex-1 w-full bg-white border border-slate-200 rounded-xl shadow-sm lg:h-full lg:overflow-y-auto flex flex-col relative"
        >
          {isEnrolled && progressPercentage === 100 && (
            <div className="m-5 p-5 rounded-lg bg-slate-950 text-white text-center relative overflow-hidden shrink-0 shadow-sm border border-slate-900">
              <Trophy size={32} className="mx-auto mb-1.5 text-amber-400" />
              <h3 className="text-base font-bold mb-0.5">
                Seluruh Silabus Selesai! 🎉
              </h3>
              <p className="text-slate-400 text-[11px] mb-3">
                Selamat, Anda berhak mengklaim dokumen sertifikat digital
                kelulusan.
              </p>
              {!isClaimed ? (
                <button
                  onClick={handleClaimReward}
                  disabled={isClaiming}
                  className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-4 py-1.5 rounded-lg text-xs uppercase tracking-wide transition-colors"
                >
                  {isClaiming ? "Memproses..." : "Klaim Sertifikat Digital"}
                </button>
              ) : (
                <button
                  onClick={() =>
                    document.getElementById("modal_sertifikat").showModal()
                  }
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-4 py-1.5 rounded-lg text-xs uppercase tracking-wide transition-colors"
                >
                  <Award size={12} className="inline mr-1 text-amber-400" />{" "}
                  Tampilkan Ijazah Digital
                </button>
              )}
            </div>
          )}

          {!activeMaterialId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 bg-slate-50/40">
              <BookOpen size={36} className="mb-2 opacity-25 text-slate-500" />
              <p className="font-semibold text-xs text-slate-500 max-w-xs leading-relaxed">
                Ruang Baca Kosong. Pilih salah satu materi bacaan atau tantangan
                koding pada menu kurikulum kiri.
              </p>
            </div>
          ) : isMaterialLoading ? (
            <div className="flex-1 flex items-center justify-center bg-white">
              <span className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></span>
            </div>
          ) : activeMaterialData ? (
            <>
              {/* Sticky Top Reader Header */}
              <div className="px-6 md:px-8 py-4 border-b border-slate-100 bg-white sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.01)] shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 flex items-center gap-1">
                    {getMaterialIcon(activeMaterialData.type)}{" "}
                    {activeMaterialData.type}
                  </span>
                  {completedIds.includes(activeMaterialId) && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider">
                      ✓ Selesai
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                  {activeMaterialData.title}
                </h2>
              </div>

              {/* Isi Konten Bacaan / Challenge */}
              <div className="p-6 md:p-8 flex-1 bg-white">
                {activeMaterialData.type === "CHALLENGE" ? (
                  <div className="max-w-xl mx-auto text-center py-2">
                    <div className="w-12 h-12 bg-slate-950 text-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md">
                      <Code size={22} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      Misi Ujian Praktikal
                    </h3>
                    <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto leading-relaxed">
                      Selesaikan tugas praktik koding Anda, lampirkan URL
                      repositori pengerjaan dan screenshot hasil aplikasi.
                    </p>

                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-left space-y-4 shadow-inner">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          1. Screenshot Bukti Hasil (*Maks 2MB)
                        </label>
                        {submissionImage ? (
                          <div className="relative rounded-lg overflow-hidden border border-slate-200">
                            <img
                              src={submissionImage}
                              alt="Bukti"
                              className="w-full object-cover max-h-44"
                            />
                            {!completedIds.includes(activeMaterialId) && (
                              <button
                                onClick={() => setSubmissionImage("")}
                                className="absolute top-2 right-2 bg-slate-900/90 text-white p-1 rounded hover:bg-rose-500 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => challengeFileRef.current.click()}
                            disabled={
                              isUploadingImage ||
                              completedIds.includes(activeMaterialId)
                            }
                            className="w-full h-28 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 bg-white hover:bg-slate-100 transition-colors"
                          >
                            {isUploadingImage ? (
                              <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ImageIcon size={18} className="text-slate-400" />
                            )}
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                              Pilih Gambar
                            </span>
                          </button>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          ref={challengeFileRef}
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          2. Tautan URL Repositori
                        </label>
                        <input
                          type="url"
                          value={submissionLink}
                          onChange={(e) => setSubmissionLink(e.target.value)}
                          disabled={
                            completedIds.includes(activeMaterialId) ||
                            isSubmittingChallenge
                          }
                          placeholder="https://github.com/..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500 shadow-sm"
                        />
                      </div>

                      {!completedIds.includes(activeMaterialId) && (
                        <button
                          onClick={handleSubmitChallenge}
                          disabled={isSubmittingChallenge || !submissionLink}
                          className="w-full bg-slate-950 hover:bg-slate-800 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          {isSubmittingChallenge ? (
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Send size={12} /> Kirim Jawaban Praktik
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="material-html-content w-full text-slate-800">
                    <style>{`
                      /* === 0. FIX RESPONSIVE & RATA KANAN-KIRI GLOBAL === */
                      .material-html-content {
                        word-wrap: break-word !important;
                        overflow-wrap: break-word !important;
                        word-break: break-word !important;
                        white-space: normal !important;
                      }

                      /* === 1. Gaya Paragraf (Auto Justify & Anti-Scroll) === */
                      .material-html-content p { 
                        color: #334155; 
                        line-height: 1.8; 
                        margin-bottom: 1.25rem; 
                        font-size: 0.95rem;
                        text-align: justify; /* 🔥 Teks rata kanan-kiri biar rapi */
                        white-space: normal !important;
                        word-break: break-word !important;
                      }
                      
                      /* === 2. Gaya Judul / Headings === */
                      .material-html-content h1, 
                      .material-html-content h2, 
                      .material-html-content h3, 
                      .material-html-content h4 { 
                        color: #0f172a; 
                        font-weight: 700; 
                        margin-top: 2rem; 
                        margin-bottom: 0.75rem; 
                        tracking-tight;
                        word-break: break-word !important;
                      }
                      .material-html-content h1 { font-size: 1.5rem; }
                      .material-html-content h2 { font-size: 1.3rem; }
                      .material-html-content h3 { font-size: 1.15rem; }

                      /* === 3. List Nomor dan Bullet Poin === */
                      .material-html-content ul { 
                        list-style-type: disc !important; 
                        padding-left: 1.5rem !important; 
                        margin-bottom: 1.25rem !important; 
                      }
                      .material-html-content ol { 
                        list-style-type: decimal !important; 
                        padding-left: 1.5rem !important; 
                        margin-bottom: 1.25rem !important; 
                      }
                      .material-html-content li { 
                        margin-bottom: 0.5rem !important; 
                        color: #334155;
                        font-size: 0.95rem;
                        word-break: break-word !important;
                      }

                      /* === 4. Struktur & Garis Tabel (Responsive) === */
                      .material-html-content table {
                        width: 100% !important;
                        margin: 1.75rem 0 !important;
                        border-collapse: collapse !important;
                        font-size: 0.90rem !important;
                        border: 1px solid #e2e8f0 !important;
                        background-color: #ffffff;
                        display: block !important; /* 🔥 Bikin tabel bisa di-scroll tersendiri kalau kepanjangan */
                        overflow-x: auto !important;
                      }
                      .material-html-content th, .material-html-content td {
                        border: 1px solid #cbd5e1 !important;
                        padding: 10px 14px !important;
                        text-align: left;
                        min-width: 100px;
                      }
                      .material-html-content th {
                        background-color: #f8fafc !important;
                        font-weight: 700 !important;
                        color: #0f172a !important;
                      }

                      /* === 5. Blok Kode Kodingan Keren === */
                      .material-html-content code:not(pre code) {
                        background-color: #f1f5f9 !important;
                        color: #6366f1 !important;
                        padding: 2px 6px !important;
                        border-radius: 4px !important;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
                        font-size: 0.85em !important;
                        font-weight: 600 !important;
                        border: 1px solid #e2e8f0 !important;
                      }

                      .material-html-content .ql-syntax, 
                      .material-html-content pre {
                        background: #0f172a !important; 
                        color: #f8fafc !important;
                        padding: 2.5rem 1.25rem 1.25rem !important; 
                        border-radius: 0.75rem !important;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; 
                        font-size: 0.85rem !important;
                        line-height: 1.6 !important; 
                        overflow-x: auto !important; /* 🔥 Khusus codingan biarin bisa scroll kanan kalau panjang biar ga rusak baris kodenya */
                        position: relative !important; 
                        margin: 1.75rem 0 !important;
                        border: 1px solid #1e293b !important;
                      }

                      .material-html-content .ql-syntax::before,
                      .material-html-content pre::before {
                        content: ''; position: absolute; top: 0.9rem; left: 12px; width: 0.55rem; height: 0.55rem; border-radius: 50%; background: #ef4444; box-shadow: 0.9rem 0 0 #f59e0b, 1.8rem 0 0 #10b981;
                      }
                    `}</style>
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          activeMaterialData.content ||
                          "<p className='text-slate-400 text-xs italic'>Materi tidak memiliki komponen konten teks.</p>",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Bottom Navigation Reader Controls */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0 sticky bottom-0 z-30">
                <button
                  onClick={() =>
                    prevMaterialId && handleSelectMaterial(prevMaterialId)
                  }
                  disabled={!prevMaterialId}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-xs transition-colors"
                >
                  <ChevronLeft size={14} /> Kembali
                </button>

                <div className="flex-1 flex justify-center">
                  {!completedIds.includes(activeMaterialId) ? (
                    activeMaterialData.type !== "CHALLENGE" && (
                      <button
                        onClick={handleMarkComplete}
                        className="px-5 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 shadow-sm flex items-center gap-1 transition-transform active:scale-95"
                      >
                        <CheckCircle size={14} /> Selesai & Simpan
                      </button>
                    )
                  ) : nextMaterialId ? (
                    <button
                      onClick={() => handleSelectMaterial(nextMaterialId)}
                      className="px-5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1 transition-transform active:scale-95"
                    >
                      Lanjut Materi <ChevronRight size={14} />
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1 shadow-inner">
                      ✓ Rampung
                    </span>
                  )}
                </div>

                <button
                  onClick={() =>
                    nextMaterialId && handleSelectMaterial(nextMaterialId)
                  }
                  disabled={!nextMaterialId}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-xs transition-colors"
                >
                  Lanjut <ChevronRight size={14} />
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* ================================================= */}
      {/* MODAL CHECKOUT PEMBAYARAN MANUAL/POIN             */}
      {/* ================================================= */}
      <dialog
        id="modal_pembayaran"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box bg-white rounded-xl p-0 max-w-md border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <CreditCard size={14} className="text-slate-700" /> Checkout Akses
              Kelas
            </h3>
            <form method="dialog">
              <button className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500 hover:bg-slate-300 font-bold">
                ✕
              </button>
            </form>
          </div>
          <form onSubmit={handlePaymentSubmit} className="p-5 space-y-4">
            <div className="bg-slate-900 rounded-lg p-4 flex justify-between items-center text-white">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Total Investasi
                </p>
                <p className="text-lg font-black tracking-tight text-white">
                  {formattedPrice}
                </p>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-amber-400">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-col gap-2 shadow-inner">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Saldo Poin Anda
                  </p>
                  <p className="text-sm font-black text-slate-800 flex items-center gap-1 mt-0.5">
                    <Coins size={14} className="text-amber-500" />{" "}
                    {new Intl.NumberFormat("id-ID").format(user?.points || 0)}{" "}
                    Pts
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePayWithPoints}
                  disabled={
                    isRedeemingPoints ||
                    (user?.points || 0) < (course?.price || 0)
                  }
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                >
                  {isRedeemingPoints ? (
                    <span className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin inline-block" />
                  ) : (
                    "Gunakan Poin"
                  )}
                </button>
              </div>
              {(user?.points || 0) < (course?.price || 0) ? (
                <p className="text-[9px] text-rose-500 font-semibold">
                  ⚠️ Poin NusaPoints Anda tidak mencukupi untuk tebus otomatis.
                </p>
              ) : (
                <p className="text-[9px] text-emerald-600 font-semibold">
                  ✨ Saldo cukup! Anda bisa langsung membeli menggunakan koin.
                </p>
              )}
            </div>
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                Atau Transfer Manual
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                1. Rekening Tujuan Transfer
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-semibold space-y-1">
                <div className="flex justify-between border-b border-slate-200/50 pb-1 text-slate-700">
                  <span>BCA</span>
                  <span className="font-mono font-bold text-slate-900">
                    123-4567-890
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1 text-slate-700">
                  <span>Mandiri</span>
                  <span className="font-mono font-bold text-slate-900">
                    098-7654-321
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  A/N:{" "}
                  <span className="text-slate-800 font-bold">
                    Ferdi Pratama Setia
                  </span>
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                2. Unggah Slip Gambar Bukti
              </p>
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer bg-white"
                onClick={() => fileInputRef.current.click()}
              >
                {receiptPreview ? (
                  <img
                    src={receiptPreview}
                    alt="Bukti Transfer"
                    className="max-h-20 mx-auto rounded border"
                  />
                ) : (
                  <div className="flex flex-col items-center py-1">
                    <UploadCloud size={20} className="text-slate-400 mb-1" />
                    <p className="text-xs font-bold text-slate-700">
                      Pilih Berkas Slip Transfer
                    </p>
                    <p className="text-[9px] text-slate-400">
                      Format gambar maks 2MB
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleReceiptChange}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingPayment || !receiptFile}
              className="w-full bg-slate-950 hover:bg-slate-800 text-white rounded-lg py-2.5 font-bold text-xs uppercase tracking-wider shadow-md disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
            >
              {isSubmittingPayment ? "Mengirim..." : "Kirim Pembayaran"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* ================================================= */}
      {/* MODAL IJAZAH / SERTIFIKAT KELULUSAN               */}
      {/* ================================================= */}
      <dialog
        id="modal_sertifikat"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box w-full max-w-4xl bg-white rounded-xl p-0 border border-slate-200 shadow-2xl relative overflow-hidden">
          <div className="p-6 md:p-10 text-center relative bg-slate-50 overflow-hidden">
            <div className="absolute inset-4 border-2 border-slate-200 rounded-lg pointer-events-none opacity-60"></div>
            <div className="relative z-10 py-4">
              <div className="w-10 h-10 mx-auto bg-slate-950 rounded-lg flex items-center justify-center mb-4 shadow-sm">
                <BookOpen size={20} className="text-white" />
              </div>
              <p className="font-bold text-slate-800 tracking-[0.25em] uppercase text-[9px] mb-4">
                Certificate of Completion
              </p>
              <p className="text-slate-400 text-xs font-medium mb-1">
                Sertifikat kelulusan digital ini diberikan kepada:
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">
                {user?.name}
              </h2>
              <div className="w-12 h-0.5 bg-slate-300 mx-auto mb-4"></div>
              <p className="text-slate-400 text-xs font-medium mb-1">
                Atas keberhasilan menyelesaikan kurikulum program kompetensi:
              </p>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-10 max-w-xl mx-auto leading-snug">
                {course?.title}
              </h3>
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mt-12 px-6 gap-6">
                <div className="text-center sm:text-left">
                  <div className="border-b border-slate-300 pb-1 min-w-[140px]">
                    <p className="font-serif italic text-lg text-slate-700 select-none">
                      Ferdi Pratama S.
                    </p>
                  </div>
                  <p className="font-bold text-slate-800 text-[9px] uppercase tracking-wider mt-1">
                    Ferdi Pratama Setia
                  </p>
                  <p className="text-slate-400 text-[8px] font-bold uppercase">
                    CEO NusaLearn Platform
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-400 flex items-center justify-center shadow border-4 border-white shrink-0">
                  <Award
                    size={28}
                    className="text-amber-900"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="text-center sm:text-right">
                  <div className="border-b border-slate-300 pb-1 min-w-[140px]">
                    <p className="font-bold text-slate-800 text-xs">
                      {completedDate
                        ? new Date(completedDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "17 Mei 2026"}
                    </p>
                  </div>
                  <p className="font-bold text-slate-400 text-[9px] uppercase tracking-wider mt-1">
                    Tanggal Kelulusan
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border-t border-slate-100 p-3.5 flex justify-center gap-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-1.5 text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              <Download size={14} /> Cetak / Unduh PDF
            </button>
            <form method="dialog">
              <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs uppercase transition-colors border border-slate-200">
                Tutup
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default CourseDetailStudent;
