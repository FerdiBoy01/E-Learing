import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  Wallet,
  Tag,
  Gamepad2,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Search,
  Bell,
  ChevronRight,
  Database,
  MessageSquareWarning,
  Activity,
  Settings,
} from "lucide-react";
import useAuthStore from "../../store/authStore";

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // State untuk Hover Expand Sidebar (Desktop)
  const [isHovered, setIsHovered] = useState(false);

  // State untuk Drawer Menu (Mobile)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🔥 ULTIMATE SUPERADMIN NAV ITEMS (Terbagi 3 Segmen)
  const navItems = [
    // --- Segmen 1: Operasional Harian ---
    {
      name: "Overview",
      path: "/admin",
      icon: <LayoutDashboard size={20} strokeWidth={2.5} />,
    },
    {
      name: "Manajemen Pengguna",
      path: "/admin/users",
      icon: <Users size={20} strokeWidth={2.5} />,
    },
    {
      name: "Katalog Kurikulum",
      path: "/admin/courses",
      icon: <BookOpen size={20} strokeWidth={2.5} />,
    },
    {
      name: "Arus Transaksi",
      path: "/admin/transactions",
      icon: <CreditCard size={20} strokeWidth={2.5} />,
    },
    {
      name: "Pencairan Dana",
      path: "/admin/payouts",
      icon: <Wallet size={20} strokeWidth={2.5} />,
    },

    // --- Segmen 2: Marketing & Growth ---
    {
      name: "Promo & Voucher",
      path: "/admin/marketing",
      icon: <Tag size={20} strokeWidth={2.5} />,
    },
    {
      name: "Engine Gamifikasi",
      path: "/admin/gamification",
      icon: <Gamepad2 size={20} strokeWidth={2.5} />,
    },

    // --- Segmen 3: Kendali Root Core ---
    {
      name: "Master Data",
      path: "/admin/master-data",
      icon: <Database size={20} strokeWidth={2.5} />,
    },
    {
      name: "Pusat Resolusi",
      path: "/admin/tickets",
      icon: <MessageSquareWarning size={20} strokeWidth={2.5} />,
    },
    {
      name: "System Logs",
      path: "/admin/logs",
      icon: <Activity size={20} strokeWidth={2.5} />,
    },
    {
      name: "Konfigurasi Global",
      path: "/admin/settings",
      icon: <Settings size={20} strokeWidth={2.5} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 flex overflow-hidden">
      {/* ===================================================================== */}
      {/* 1. SIDEBAR DESKTOP (Auto-Expand Mulus Tanpa Jitter)                   */}
      {/* ===================================================================== */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden lg:flex flex-col bg-white/70 backdrop-blur-2xl border-r border-slate-200/60 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-[width] duration-300 ease-out overflow-hidden shrink-0 ${
          isHovered ? "w-64" : "w-20"
        }`}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-200/50 bg-white/40 shrink-0">
          <div className="flex items-center w-full">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm shrink-0">
              <ShieldAlert className="text-white" size={18} strokeWidth={2.5} />
            </div>
            <span
              className={`ml-3 font-bold text-lg tracking-tight text-slate-900 whitespace-nowrap transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
            >
              Nusa<span className="text-slate-500">Admin</span>
            </span>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <p
            className={`px-6 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 transition-opacity duration-300 whitespace-nowrap ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            Panel Superadmin
          </p>

          {navItems.map((item, index) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/admin" &&
                location.pathname.startsWith(item.path));

            return (
              <div key={item.name}>
                {/* Garis Pembatas Halus untuk tiap Blok Segmen */}
                {(index === 5 || index === 7) && (
                  <div
                    className={`my-4 mx-6 border-t border-slate-200/80 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
                  ></div>
                )}

                <NavLink
                  to={item.path}
                  className={`flex items-center h-11 mx-3 px-2 rounded-xl font-semibold transition-all duration-200 group ${
                    isActive
                      ? "bg-white border border-slate-200/60 shadow-sm"
                      : "hover:bg-slate-100/50 border border-transparent"
                  }`}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center shrink-0 transition-colors ${isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-700"}`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`ml-3 text-[13px] whitespace-nowrap transition-opacity duration-300 ${isActive ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"} ${isHovered ? "opacity-100" : "opacity-0"}`}
                  >
                    {item.name}
                  </span>
                </NavLink>
              </div>
            );
          })}
        </nav>

        {/* Profil Bawah */}
        <div className="p-3 border-t border-slate-200/50 bg-white/40 shrink-0">
          <div className="flex items-center h-14 px-1.5 mb-2 rounded-xl bg-white border border-slate-200/60 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
              <img
                src={
                  user?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${user?.name || "Admin"}&background=f1f5f9&color=0f172a`
                }
                alt="Admin"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className={`ml-3 overflow-hidden whitespace-nowrap transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
            >
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.name}
              </p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                God Mode
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center h-11 px-2.5 rounded-xl w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <LogOut size={18} strokeWidth={2.5} />
            </div>
            <span
              className={`ml-3 text-xs font-bold whitespace-nowrap transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
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
            className="fixed inset-0 z-[110] bg-slate-900/30 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <aside className="fixed inset-y-0 left-0 z-[120] w-72 bg-white/95 backdrop-blur-2xl border-r border-white/50 flex flex-col lg:hidden animate-in slide-in-from-left duration-300 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/50">
              <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                <ShieldAlert className="text-slate-900" size={20} /> NusaAdmin
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item, index) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/admin" &&
                    location.pathname.startsWith(item.path));
                return (
                  <div key={item.name}>
                    {(index === 5 || index === 7) && (
                      <div className="my-3 mx-4 border-t border-slate-200"></div>
                    )}
                    <NavLink
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive ? "bg-slate-50 text-slate-900 font-bold border border-slate-200/60 shadow-sm" : "text-slate-500 hover:bg-slate-50/50 font-semibold border border-transparent"}`}
                    >
                      <div
                        className={
                          isActive ? "text-slate-900" : "text-slate-400"
                        }
                      >
                        {item.icon}
                      </div>
                      <span className="text-sm">{item.name}</span>
                    </NavLink>
                  </div>
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
      {/* 3. MAIN CONTENT AREA (Pendorong Otomatis & Glass Navbar Atas)         */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full transition-all duration-300">
        {/* TOP NAVBAR (Desktop & Mobile - Frosted Glass) */}
        <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-8 shrink-0 z-40 sticky top-0">
          {/* Sisi Kiri: Breadcrumb / Mobile Menu Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Dasbor</span> <ChevronRight size={10} />{" "}
              <span className="text-slate-900">Superadmin Panel</span>
            </div>
          </div>

          {/* Sisi Kanan: Search Bar & Notifikasi */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari menu cepat..."
                className="w-48 pl-9 pr-4 py-1.5 bg-slate-100/50 border border-slate-200/80 focus:bg-white focus:border-slate-900 rounded-lg text-xs font-semibold outline-none transition-colors"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <Bell size={18} strokeWidth={2.5} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
          </div>
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
