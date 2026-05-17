import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  LogOut,
  Menu,
  User,
  Sparkles,
  X,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import useAuthStore from "../../store/authStore";

const menuItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: <LayoutDashboard size={18} strokeWidth={2.5} />,
  },
  {
    title: "Katalog Kelas",
    path: "/courses",
    icon: <BookOpen size={18} strokeWidth={2.5} />,
  },
  {
    title: "Progres Saya",
    path: "/progress",
    icon: <ClipboardCheck size={18} strokeWidth={2.5} />,
  },
];

const StudentLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    // Background utama ala macOS terang dengan ambient light
    <div
      className="min-h-screen bg-[#f5f5f7] font-sans text-slate-800 selection:bg-indigo-200 flex flex-col relative overflow-x-hidden"
      style={{ scrollbarGutter: "stable" }}
    >
      {/* Ambient Background Orbs (Global untuk semua halaman student) */}
      <div className="fixed top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-slate-300/40 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (GLASSMORPHISM)                                             */}
      {/* ========================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 h-16 z-[100] transition-all duration-300 flex items-center justify-between px-4 sm:px-6 lg:px-8 ${
          scrolled
            ? "bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_30px_rgb(0,0,0,0.03)]"
            : "bg-transparent"
        }`}
      >
        {/* KIRI: Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              NusaLearn
            </span>
          </Link>
        </div>

        {/* TENGAH: Navigasi Desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-white/40 backdrop-blur-md border border-slate-200/50 p-1 rounded-xl shadow-sm">
          {menuItems.map((item, idx) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-white text-indigo-700 shadow-sm border border-slate-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent"
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* KANAN: User Profile Dropdown */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block text-right mr-1">
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">
              Siswa
            </p>
            <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
              {user?.name || "Pelajar"}
            </p>
          </div>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="w-9 h-9 rounded-lg border border-slate-200/80 bg-white/80 overflow-hidden hover:border-indigo-400 transition-colors shadow-sm cursor-pointer backdrop-blur-sm"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={18} className="m-auto mt-2.5 text-slate-500" />
              )}
            </div>

            <ul
              tabIndex={0}
              className="mt-3 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] menu menu-sm dropdown-content bg-white/90 backdrop-blur-2xl border border-white/50 w-56 rounded-xl animate-in fade-in zoom-in duration-200"
            >
              <li className="lg:hidden px-3 py-3 border-b border-slate-100/50 mb-1 pointer-events-none">
                <span className="block font-bold text-slate-900 text-sm truncate">
                  {user?.name}
                </span>
                <span className="block text-[10px] font-bold text-indigo-600 uppercase mt-0.5">
                  Siswa
                </span>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 py-2.5 rounded-lg font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <UserCircle size={18} /> Profil Saya
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-rose-600 hover:bg-rose-50 font-semibold py-2.5 rounded-lg transition-colors mt-1"
                >
                  <LogOut size={18} /> Keluar Akun
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE MENU DRAWER (RESPONSIVE)                                        */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[110] bg-slate-900/20 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <aside className="fixed inset-y-0 left-0 z-[120] w-72 bg-white/90 backdrop-blur-2xl border-r border-white/50 flex flex-col md:hidden animate-in slide-in-from-left duration-300 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/50">
              <span className="font-bold text-xl tracking-tight text-slate-900">
                NusaLearn
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
              {menuItems.map((item, idx) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" &&
                    location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={idx}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50"
                        : "text-slate-600 hover:bg-slate-100/50 font-semibold border border-transparent"
                    }`}
                  >
                    <div
                      className={
                        isActive ? "text-indigo-600" : "text-slate-500"
                      }
                    >
                      {item.icon}
                    </div>
                    <span className="text-sm">{item.title}</span>
                    {isActive && (
                      <ChevronRight
                        size={16}
                        className="ml-auto text-indigo-500"
                      />
                    )}
                  </Link>
                );
              })}

              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                  location.pathname.startsWith("/profile")
                    ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50"
                    : "text-slate-600 hover:bg-slate-100/50 font-semibold border border-transparent"
                }`}
              >
                <div
                  className={
                    location.pathname.startsWith("/profile")
                      ? "text-indigo-600"
                      : "text-slate-500"
                  }
                >
                  <User size={18} strokeWidth={2.5} />
                </div>
                <span className="text-sm">Profil Saya</span>
              </Link>
            </nav>

            <div className="p-4 border-t border-slate-200/50">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className="bg-white p-1.5 rounded-lg shadow-sm text-indigo-600 shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 mb-0.5">
                    Tingkatkan Skillmu!
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium leading-tight">
                    Konsisten adalah kunci 🚀
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT AREA                                                      */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full pt-16 flex flex-col relative z-10">
        <div className="w-full mx-auto flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
