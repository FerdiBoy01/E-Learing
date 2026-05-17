import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  LogOut,
  ShieldAlert,
  Menu,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import useAuthStore from "../../store/authStore";

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // State untuk melipat Sidebar di Desktop
  const [isCollapsed, setIsCollapsed] = useState(false);

  // State untuk membuka Drawer di Mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Overview",
      path: "/admin",
      icon: <LayoutDashboard size={20} strokeWidth={2.5} />,
    },
    {
      name: "Pengguna",
      path: "/admin/users",
      icon: <Users size={20} strokeWidth={2.5} />,
    },
    {
      name: "Katalog Kelas",
      path: "/admin/courses",
      icon: <BookOpen size={20} strokeWidth={2.5} />,
    },
    {
      name: "Transaksi",
      path: "/admin/transactions",
      icon: <CreditCard size={20} strokeWidth={2.5} />,
    },
  ];

  return (
    // Background utama ala macOS terang dengan ambient light
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-slate-800 flex overflow-hidden relative">
      {/* Ambient Background Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] bg-slate-300/50 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* ===================================================================== */}
      {/* 1. SIDEBAR DESKTOP (Collapsible & Glassmorphism)                      */}
      {/* ===================================================================== */}
      <aside
        className={`hidden lg:flex flex-col bg-white/70 backdrop-blur-2xl border-r border-slate-200/60 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Tombol Toggle Pelipat Sidebar */}
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

        {/* Logo Header */}
        <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200/50 bg-white/30 shrink-0">
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-slate-900 w-full overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shrink-0 mx-auto lg:mx-0">
              <ShieldAlert className="text-white" size={16} strokeWidth={2.5} />
            </div>
            {/* Nama aplikasi disembunyikan saat dilipat */}
            <span
              className={`transition-all duration-300 whitespace-nowrap origin-left ${isCollapsed ? "opacity-0 scale-0 w-0" : "opacity-100 scale-100 w-auto"}`}
            >
              Nusa<span className="text-indigo-600">Admin</span>
            </span>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <p
            className={`px-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 transition-all duration-300 ${isCollapsed ? "opacity-0 h-0 text-center" : "opacity-100 h-auto"}`}
          >
            Menu Utama
          </p>

          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/admin" &&
                location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={isCollapsed ? item.name : ""} // Tooltip muncul saat dilipat
                className={`flex items-center rounded-xl font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-white border border-slate-200/50 shadow-sm"
                    : "hover:bg-slate-100/50 border border-transparent"
                } ${isCollapsed ? "justify-center p-3" : "justify-start px-3 py-2.5"}`}
              >
                <div
                  className={`${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"} transition-colors shrink-0`}
                >
                  {item.icon}
                </div>
                {/* Teks Menu */}
                <span
                  className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                    isActive
                      ? "text-indigo-700"
                      : "text-slate-600 group-hover:text-slate-900"
                  } ${isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3"}`}
                >
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Profil Bawah */}
        <div className="p-3 border-t border-slate-200/50 bg-white/30 shrink-0">
          <div
            className={`bg-white border border-slate-200 rounded-xl flex items-center mb-3 shadow-sm transition-all duration-300 ${isCollapsed ? "p-1.5 justify-center" : "p-3 gap-3"}`}
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 overflow-hidden shrink-0">
              <img
                src={
                  user?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${user?.name || "Admin"}&background=e0e7ff&color=4f46e5`
                }
                alt="Admin"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
            >
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.name}
              </p>
              <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">
                Administrator
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Keluar Sistem" : ""}
            className={`flex items-center text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-colors ${
              isCollapsed
                ? "justify-center p-3"
                : "justify-center gap-2 py-2.5 w-full"
            }`}
          >
            <LogOut size={16} strokeWidth={2.5} className="shrink-0" />
            <span
              className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
            >
              Keluar Sistem
            </span>
          </button>
        </div>
      </aside>

      {/* ===================================================================== */}
      {/* 2. DRAWER MOBILE (Hanya muncul di HP)                                 */}
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
                <ShieldAlert className="text-indigo-600" size={20} /> NusaAdmin
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/admin" &&
                    location.pathname.startsWith(item.path));
                return (
                  <NavLink
                    key={item.name}
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
                        isActive ? "text-indigo-600" : "text-slate-400"
                      }
                    >
                      {item.icon}
                    </div>
                    <span className="text-sm">{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200/50">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <LogOut size={18} /> Keluar Sistem
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ===================================================================== */}
      {/* 3. MAIN CONTENT AREA                                                  */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full">
        {/* TOPBAR MOBILE (Glassmorphism) */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 lg:hidden shrink-0 z-50">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <ShieldAlert className="text-indigo-600" size={20} /> NusaAdmin
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* OUTLET PAGE (Halaman di dalam Layout) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
