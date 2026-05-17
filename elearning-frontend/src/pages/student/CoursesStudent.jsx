import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  ChevronRight,
  LayoutList,
  Search,
  Sparkles,
  Tag,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../config/axios";
import useAuthStore from "../../store/authStore";

const CoursesStudent = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);

  // State baru untuk menyimpan ID kelas yang dimiliki user
  const [myCourseIds, setMyCourseIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL | MY_COURSES | REGULAR | PROJECT_BASED
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Ambil semua katalog kelas
        const responseCourses = await api.get("/courses");
        const dataCourses = responseCourses.data.data;
        setCourses(dataCourses.courses || dataCourses || []);

        // 2. Ambil data enrollment (Kelas milik user)
        // Pastikan endpoint `/enrollments/me` ada di backend lu. Jika beda, sesuaikan path-nya.
        const responseEnrollments = await api.get("/enrollments/me");
        const enrollments = responseEnrollments.data.data || [];

        // Simpan array berisi course_id milik user
        const ownedIds = enrollments.map(
          (enroll) => enroll.course_id || enroll.courseId,
        );
        setMyCourseIds(ownedIds);
      } catch (error) {
        console.error("Gagal mengambil data katalog atau kepemilikan", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = courses.filter((course) => {
    // Logika Filter Tab
    let matchFilter = false;
    if (filter === "ALL") matchFilter = true;
    else if (filter === "MY_COURSES")
      matchFilter = myCourseIds.includes(course.id);
    else matchFilter = course.type === filter;

    // Logika Pencarian
    const matchSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description &&
        course.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchFilter && matchSearch;
  });

  if (loading)
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center font-sans">
        <span className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></span>
        <p className="text-slate-500 font-semibold text-sm animate-pulse">
          Memuat data akademi...
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto font-sans pb-24 pt-4 px-4 sm:px-6 text-slate-800 overflow-x-hidden">
      {/* ================================================= */}
      {/* 1. HERO BANNER                                     */}
      {/* ================================================= */}
      <div className="relative mb-8 md:mb-10 p-6 sm:p-8 md:p-12 rounded-xl bg-slate-900 overflow-hidden shadow-md border border-slate-800">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] md:w-[30vw] md:h-[30vw] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/4 -translate-y-1/4"></div>

        <div className="relative z-10 max-w-2xl mx-auto md:mx-0 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-4">
            <BookOpen size={14} className="text-indigo-400" /> Silabus
            Pembelajaran
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 tracking-tight leading-tight md:leading-none">
            Kembangkan Keahlian Tanpa Batas.
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base font-medium max-w-xl leading-relaxed">
            Akses materi reguler untuk pendalaman teori, pilih kelas berbayar
            untuk praktik, atau lanjutkan pembelajaran di kelas yang Anda
            miliki.
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* 2. CONTROLS (Horizontal Scroll for Mobile)         */}
      {/* ================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-8 gap-4">
        {/* Tab Filter Swipeable */}
        <div className="w-full md:w-auto overflow-x-auto hide-scrollbar pb-2 md:pb-0 -mb-2 md:mb-0">
          <div className="inline-flex bg-slate-200/60 backdrop-blur-md p-1 rounded-xl border border-slate-300/40 w-max md:w-auto gap-1">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2.5 md:py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap border ${
                filter === "ALL"
                  ? "bg-white text-slate-900 shadow-sm border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900 border-transparent"
              }`}
            >
              Semua
            </button>

            {/* 🔥 TAB BARU: KELAS SAYA */}
            <button
              onClick={() => setFilter("MY_COURSES")}
              className={`px-4 py-2.5 md:py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap border ${
                filter === "MY_COURSES"
                  ? "bg-white text-emerald-700 shadow-sm border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900 border-transparent"
              }`}
            >
              <CheckCircle
                size={13}
                className={filter === "MY_COURSES" ? "text-emerald-500" : ""}
              />{" "}
              Kelas Saya
            </button>

            <button
              onClick={() => setFilter("REGULAR")}
              className={`px-4 py-2.5 md:py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap border ${
                filter === "REGULAR"
                  ? "bg-white text-indigo-700 shadow-sm border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900 border-transparent"
              }`}
            >
              <Tag
                size={12}
                className={filter === "REGULAR" ? "text-indigo-500" : ""}
              />{" "}
              Reguler
            </button>

            <button
              onClick={() => setFilter("PROJECT_BASED")}
              className={`px-4 py-2.5 md:py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap border ${
                filter === "PROJECT_BASED"
                  ? "bg-white text-amber-700 shadow-sm border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900 border-transparent"
              }`}
            >
              <Sparkles
                size={12}
                className={filter === "PROJECT_BASED" ? "text-amber-500" : ""}
              />{" "}
              Premium
            </button>
          </div>
        </div>

        {/* Search Bar Minimalis */}
        <div className="w-full md:w-auto shrink-0">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 md:py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 text-xs font-medium w-full md:w-64 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* 3. EMPTY STATE                                    */}
      {/* ================================================= */}
      {filteredCourses.length === 0 && (
        <div className="bg-white/50 backdrop-blur-sm border border-dashed border-slate-300/80 py-16 px-6 rounded-xl text-center mx-1">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
            <Search size={20} className="text-slate-400" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">
            {filter === "MY_COURSES"
              ? "Anda Belum Memiliki Kelas"
              : "Materi Tidak Ditemukan"}
          </h2>
          <p className="text-slate-500 text-xs font-medium">
            {filter === "MY_COURSES"
              ? "Ayo eksplorasi katalog dan mulai perjalanan belajar Anda hari ini!"
              : "Kriteria pencarian Anda tidak cocok dengan kelas mana pun."}
          </p>
        </div>
      )}

      {/* ================================================= */}
      {/* 4. PROGRAM CARDS (Mobile Optimized Grid)          */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {filteredCourses.map((course) => {
          const totalBab =
            course._count?.chapters || course.chapters?.length || 0;
          const totalMhs = course._count?.enrollments || 0;
          const formattedPrice = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(course.price || 0);

          const isOwned = myCourseIds.includes(course.id);

          return (
            <div
              key={course.id}
              className={`group bg-white/80 backdrop-blur-xl rounded-xl border ${isOwned ? "border-emerald-200/80" : "border-slate-200/60"} overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]`}
            >
              {/* Thumbnail Area */}
              <div className="h-36 sm:h-40 relative overflow-hidden flex items-center justify-center bg-slate-50 border-b border-slate-100 shrink-0">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center">
                    <BookOpen
                      size={20}
                      className={
                        course.type === "PROJECT_BASED"
                          ? "text-amber-500"
                          : "text-indigo-600"
                      }
                    />
                  </div>
                )}

                {/* Info Overlay Badges */}
                <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
                  {isOwned && (
                    <span className="bg-emerald-500/90 backdrop-blur-md border border-emerald-400 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
                      <CheckCircle size={10} /> DIIKUTI
                    </span>
                  )}

                  {course.type === "PROJECT_BASED" ? (
                    <span className="bg-white/90 backdrop-blur-md border border-amber-200 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider text-amber-700 shadow-sm flex items-center gap-1">
                      <Sparkles size={10} className="text-amber-500" /> PREMIUM
                    </span>
                  ) : (
                    <span className="bg-white/90 backdrop-blur-md border border-indigo-200 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider text-indigo-700 shadow-sm flex items-center gap-1">
                      <Tag size={10} className="text-indigo-500" /> GRATIS
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 md:p-5 flex-1 flex flex-col bg-white">
                <h2 className="text-sm md:text-base font-bold text-slate-900 leading-snug mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h2>

                <p className="text-[11px] md:text-xs font-medium text-slate-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                  {course.description ||
                    "Silabus komprehensif terstruktur. Klik untuk meninjau rincian bab dan kompetensi kelulusan."}
                </p>

                {/* Monetization Info */}
                <div className="mb-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] md:text-xs font-semibold text-slate-400">
                    Investasi
                  </span>
                  <span
                    className={`text-xs md:text-sm font-black ${course.type === "PROJECT_BASED" ? "text-amber-600" : "text-slate-800"}`}
                  >
                    {course.type === "PROJECT_BASED"
                      ? formattedPrice
                      : "Free Access"}
                  </span>
                </div>

                {/* Meta Indicator Footer */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 shrink-0">
                  <div className="flex items-center gap-1 text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-wider">
                    <LayoutList size={12} className="text-slate-400" />{" "}
                    {totalBab} Bab
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-wider">
                    <Users size={12} className="text-slate-400" /> {totalMhs}{" "}
                    Terdaftar
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="px-4 md:px-5 pb-4 md:pb-5 bg-white">
                <Link
                  to={`/courses/${course.id}`}
                  className={`w-full py-2.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                    isOwned
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-950 hover:bg-slate-800 text-white"
                  }`}
                >
                  {isOwned ? "Lanjutkan Belajar" : "Buka Kurikulum"}{" "}
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoursesStudent;
