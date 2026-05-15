import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'; // 🔥 Tambah useNavigate
import { 
  LayoutDashboard, BookOpen, ClipboardCheck, LogOut, 
  Menu, User, Sparkles, X, ChevronRight, UserCircle // 🔥 Tambah icon UserCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const StudentLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate(); // 🔥 Inisialisasi navigate
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🔥 Tambahkan menu Profil di sini biar muncul di Sidebar
  const menuItems = [
    { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={22} /> },
    { title: 'Jelajah Course', path: '/courses', icon: <BookOpen size={22} /> },
    { title: 'Progress Saya', path: '/progress', icon: <ClipboardCheck size={22} /> },
    { title: 'Profil Saya', path: '/profile', icon: <User size={22} /> }, // 👈 Menu baru
  ];

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect ke login setelah logout
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden selection:bg-blue-200 relative">
      
      {/* BACKGROUND GRID TIPIS */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <>
          {/* BACKDROP */}
          <div 
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* DRAWER */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl flex flex-col md:hidden">
            {/* HEADER */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <BookOpen size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="ml-4 font-bold text-xl tracking-tight text-slate-800">
                  NusaLearn
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* NAV MENU */}
            <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={idx}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-medium'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                      {item.icon}
                    </div>
                    <span>{item.title}</span>
                    {isActive && <ChevronRight size={18} className="ml-auto" />}
                  </Link>
                );
              })}
            </nav>

            {/* FOOTER */}
            <div className="p-4 border-t border-slate-100 shrink-0 space-y-3">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Sparkles size={18} />
                </div>
                <p className="text-xs font-bold text-indigo-900">Keep Grinding! 🔥</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 font-semibold rounded-xl transition-colors"
              >
                <LogOut size={18} />
                Keluar
              </button>
            </div>
          </aside>
        </>
      )}

      {/* SIDEBAR (DESKTOP) */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 w-20 hover:w-72 transition-all duration-300 ease-in-out group shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="h-16 flex items-center px-5 border-b border-slate-100 shrink-0">
          <div className="min-w-[2.5rem] h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <BookOpen size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="ml-4 font-bold text-xl tracking-tight text-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            NusaLearn
          </span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={idx} to={item.path} 
                className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
                  isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                }`}
              >
                <div className={`min-w-[1.5rem] flex justify-center ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{item.icon}</div>
                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center overflow-hidden">
            <div className="min-w-[2rem] h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600"><Sparkles size={18} /></div>
            <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              <p className="text-xs font-bold text-indigo-900">Keep Grinding! 🔥</p>
            </div>
          </div>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col md:pl-20 transition-all duration-300 relative z-10 h-screen">
        <header className="h-16 shrink-0 bg-white/70 backdrop-blur-lg border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:bg-white rounded-xl shadow-sm border border-slate-200 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-500">Gaspol terus, <span className="text-slate-800 font-bold">{user?.name}</span>! 🚀</p>
          </div>

          {/* Profile Dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="flex items-center gap-3 p-1.5 hover:bg-slate-100 rounded-full transition-colors border border-transparent hover:border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {user?.avatar_url ? <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : <User size={18} className="text-slate-500" />}
              </div>
            </div>
            
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-white border border-slate-100 w-60 rounded-2xl animate-in fade-in zoom-in duration-200">
              <li className="px-3 py-4 border-b border-slate-100 mb-2 cursor-default pointer-events-none">
                <span className="block font-bold text-slate-800 text-sm leading-tight">{user?.name}</span>
                <span className="block text-[10px] font-black text-blue-600 uppercase mt-1 tracking-widest">{user?.role}</span>
              </li>
              
              {/* 🔥 Link Baru ke Halaman Profile */}
              <li>
                <Link to="/profile" className="flex items-center gap-3 py-3 rounded-xl font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <UserCircle size={18} /> Profil Saya
                </Link>
              </li>

              <li>
                <button onClick={handleLogout} className="flex items-center gap-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold py-3 rounded-xl transition-colors mt-1">
                  <LogOut size={18} /> Keluar Akun
                </button>
              </li>
            </ul>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet /> 
          </div>
        </main>
      </div> 
    </div>
  );
};

export default StudentLayout;