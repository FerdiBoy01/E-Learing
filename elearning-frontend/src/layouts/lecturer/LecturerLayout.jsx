import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  LogOut,
  ShieldCheck,
  Menu,
  ChevronRight,
  ChevronLeft,
  X,
  UserCircle,
  Video,
  Bell,
  AlertTriangle,
  Check,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import api from "../../config/axios";
import toast from "../../utils/toast";

const LecturerLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const mainContentRef = useRef(null);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State Manajemen Notifikasi
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/courses/notifications/me");
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error("Gagal memuat notifikasi", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling tiap 15 detik
    return () => clearInterval(interval);
  }, []);

  // Tutup dropdown notif kalau klik di luar area komponen
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // 🔥 FITUR BARU: Tandai Notif Sudah Dibaca Pas Di-klik Dosen
  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/courses/notifications/${id}/read`);
      // Update state local secara instan biar UI berasa responsif tanpa nunggu re-fetch
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (error) {
      console.error("Gagal memperbarui status baca", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Hanya hitung pesan yang belum dibaca (is_read === false)
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const navItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: <LayoutDashboard size={20} strokeWidth={2.5} />,
    },
    {
      title: "Kelola Kelas",
      path: "/courses",
      icon: <BookOpen size={20} strokeWidth={2.5} />,
    },
    {
      title: "Validasi & Sales",
      path: "/transactions",
      icon: <ShieldCheck size={20} strokeWidth={2.5} />,
    },
    {
      title: "Penilaian Tugas",
      path: "/submissions",
      icon: <ClipboardCheck size={20} strokeWidth={2.5} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-slate-800 flex overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] bg-slate-300/50 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* ===================================================================== */}
      {/* 1. SIDEBAR DESKTOP                                                    */}
      {/* ===================================================================== */}
      <aside
        className={`hidden lg:flex flex-col bg-white/70 backdrop-blur-2xl border-r border-slate-200/60 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"}`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-6 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors z-30"
        >
          {isCollapsed ? (
            <ChevronRight size={14} strokeWidth={3} />
          ) : (
            <ChevronLeft size={14} strokeWidth={3} />
          )}
        </button>

        <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200/50 bg-white/30 shrink-0">
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-slate-900 w-full overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm shrink-0">
              <Video className="text-white" size={16} strokeWidth={2.5} />
            </div>
            <span
              className={`transition-all duration-300 whitespace-nowrap origin-left flex items-center gap-1.5 ${isCollapsed ? "opacity-0 scale-0 w-0" : "opacity-100 scale-100 w-auto"}`}
            >
              NusaLearn{" "}
              <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-indigo-100">
                Studio
              </span>
            </span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <p
            className={`px-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 transition-all duration-300 ${isCollapsed ? "opacity-0 h-0 text-center" : "opacity-100 h-auto"}`}
          >
            Menu Studio
          </p>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.title}
                to={item.path}
                title={isCollapsed ? item.title : ""}
                className={`flex items-center rounded-xl font-semibold transition-all duration-200 group border ${isActive ? "bg-slate-900 border-slate-900 text-white shadow-md" : "border-transparent text-slate-600 hover:bg-slate-100/50 hover:text-slate-900"} ${isCollapsed ? "justify-center p-3" : "justify-start px-3 py-2.5"}`}
              >
                <div
                  className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500"} transition-colors shrink-0`}
                >
                  {item.icon}
                </div>
                <span
                  className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"} ${isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3"}`}
                >
                  {item.title}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200/50 bg-white/30 shrink-0">
          <NavLink
            to="/profile"
            title={isCollapsed ? "Profil Anda" : ""}
            className={`flex items-center rounded-xl font-semibold transition-all duration-200 group border mb-2 ${location.pathname.startsWith("/profile") ? "bg-slate-900 border-slate-900 text-white shadow-md" : "border-transparent text-slate-600 hover:bg-white/60 hover:border-slate-200/60"} ${isCollapsed ? "justify-center p-3" : "justify-start px-3 py-2.5"}`}
          >
            <UserCircle
              size={20}
              strokeWidth={2.5}
              className={`${location.pathname.startsWith("/profile") ? "text-white" : "text-slate-400 group-hover:text-indigo-500"} shrink-0 transition-colors`}
            />
            <span
              className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${location.pathname.startsWith("/profile") ? "text-white" : "text-slate-600 group-hover:text-slate-900"} ${isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3"}`}
            >
              Profil Anda
            </span>
          </NavLink>
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Keluar Studio" : ""}
            className={`flex items-center text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-colors ${isCollapsed ? "justify-center p-3" : "justify-center gap-2 py-2.5 w-full"}`}
          >
            <LogOut size={16} strokeWidth={2.5} className="shrink-0" />
            <span
              className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
            >
              Keluar Studio
            </span>
          </button>
        </div>
      </aside>

      {/* ===================================================================== */}
      {/* 2. DRAWER MOBILE                                                      */}
      {/* ===================================================================== */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[110] bg-slate-900/20 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <aside className="fixed inset-y-0 left-0 z-[120] w-72 bg-white/90 backdrop-blur-2xl border-r border-white/50 flex flex-col lg:hidden animate-in slide-in-from-left duration-300 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/50">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                NusaLearn{" "}
                <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-indigo-100">
                  Studio
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-200/50 rounded-lg transition-colors text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-6 px-4 space-y-1.5">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" &&
                    location.pathname.startsWith(item.path));
                return (
                  <NavLink
                    key={item.title}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all border ${isActive ? "bg-slate-900 border-slate-900 text-white font-bold shadow-md" : "border-transparent text-slate-600 hover:bg-slate-100/50 font-semibold"}`}
                  >
                    <div className={isActive ? "text-white" : "text-slate-400"}>
                      {item.icon}
                    </div>
                    <span className="text-sm">{item.title}</span>
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        </>
      )}

      {/* ===================================================================== */}
      {/* 3. MAIN CONTENT AREA (Dengan Lonceng Top Navbar Terpadu)             */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full">
        {/* TOP NAVBAR UNIVERSAL */}
        <header className="h-16 bg-white/60 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 shrink-0 z-40 relative">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900 lg:hidden">
            NusaLearn{" "}
            <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-indigo-100">
              Studio
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto relative">
            {/* 🔥 BUTTON LONCENG INTERAKTIF YANG SEKARANG BISA DIPENCET */}
            <div className="relative" ref={notifRef}>
              {/* 🔥 FIX TYPO: Ubah setIsNotOpen menjadi setIsNotifOpen */}
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2 bg-white border rounded-xl transition-all duration-200 flex items-center justify-center relative active:scale-95 cursor-pointer shadow-xs ${isNotifOpen ? "border-indigo-500 text-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/20" : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
                title="Buka Pemberitahuan"
              >
                <Bell
                  size={18}
                  strokeWidth={2.5}
                  className={
                    unreadCount > 0
                      ? "animate-[wiggle_1s_ease-in-out_infinite]"
                      : ""
                  }
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-600 rounded-full text-[9px] font-black text-white flex items-center justify-center border border-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Panel Dropdown Notifikasi */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Pemberitahuan
                    </span>
                    <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded shadow-2xs">
                      {unreadCount} Belum Dibaca
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-white">
                        Kotak Masuk Kosong
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-4 transition-all duration-200 flex gap-2.5 items-start cursor-pointer relative group ${!n.is_read ? "bg-slate-50/80 hover:bg-slate-100/70" : "bg-white hover:bg-slate-50/50"}`}
                        >
                          {/* Indikator Titik Biru Notif Belum Dibaca */}
                          {!n.is_read && (
                            <span className="absolute right-4 top-4 w-2 h-2 bg-indigo-600 rounded-full shadow-[0_0_8px_#4f46e5]"></span>
                          )}

                          <span
                            className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${!n.is_read ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}
                          >
                            <AlertTriangle size={12} strokeWidth={2.5} />
                          </span>

                          <div className="flex-1 pr-3">
                            <h4
                              className={`text-xs leading-snug transition-colors ${!n.is_read ? "font-black text-slate-900 group-hover:text-indigo-600" : "font-semibold text-slate-500"}`}
                            >
                              {n.title}
                            </h4>
                            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-normal">
                              {n.message}
                            </p>

                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                {new Date(n.created_at).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                              {!n.is_read && (
                                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Check size={8} strokeWidth={3} /> Baca
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        <main
          ref={mainContentRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 custom-scrollbar scroll-smooth"
          style={{ scrollbarGutter: "stable" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LecturerLayout;
