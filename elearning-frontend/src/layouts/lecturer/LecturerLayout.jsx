import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, ClipboardCheck, LogOut, 
  Menu, User, Settings, ShieldCheck, X, ChevronRight, UserCircle 
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

// Data menu diletakkan di luar agar tidak membebani render
const menuItems = [
  { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} strokeWidth={2.5} /> },
  { title: 'Kelola Kelas', path: '/courses', icon: <BookOpen size={18} strokeWidth={2.5} /> },
  { title: 'Validasi & Penjualan', path: '/transactions', icon: <ShieldCheck size={18} strokeWidth={2.5} /> },
  { title: 'Penilaian', path: '/submissions', icon: <ClipboardCheck size={18} strokeWidth={2.5} /> },
];

const LecturerLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efek shadow halus di Navbar saat di-scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 selection:bg-blue-200 flex flex-col relative overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (DESKTOP & MOBILE)                                          */}
      {/* ========================================================================= */}
      <header 
        className={`fixed top-0 left-0 right-0 h-16 z-[100] bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}
      >
        
        {/* KIRI: Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={22} />
          </button>
          
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 hidden sm:block">
              NusaLearn <span className="text-blue-600 font-black text-sm uppercase tracking-widest ml-1 bg-blue-50 px-2 py-0.5 rounded-md">Studio</span>
            </span>
          </Link>
        </div>

        {/* TENGAH: Navigasi Desktop (Z-Pattern Center) */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={idx} 
                to={item.path} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-200' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
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
          <div className="hidden sm:block text-right mr-1">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">
              {user?.role === 'CREATOR' ? 'Kreator' : 'Pengajar'}
            </p>
            <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[150px]">{user?.name || 'Lecturer'}</p>
          </div>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden hover:border-slate-400 transition-colors shadow-sm cursor-pointer">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="m-auto mt-2 text-slate-400" />
              )}
            </div>
            
            <ul tabIndex={0} className="mt-3 p-2 shadow-xl menu menu-sm dropdown-content bg-white border border-slate-200 w-56 rounded-2xl animate-in fade-in zoom-in duration-200">
              <li className="sm:hidden px-3 py-3 border-b border-slate-100 mb-1 pointer-events-none">
                <span className="block font-bold text-slate-800 text-sm truncate">{user?.name}</span>
                <span className="block text-[10px] font-bold text-blue-600 uppercase mt-0.5">{user?.role}</span>
              </li>
              <li>
                <Link to="/profile" className="flex items-center gap-3 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <UserCircle size={18} /> Profil Studio
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="flex items-center gap-3 text-rose-600 hover:bg-rose-50 font-semibold py-2.5 rounded-lg transition-colors mt-1">
                  <LogOut size={18} /> Keluar Studio
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
          <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm lg:hidden animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="fixed inset-y-0 left-0 z-[120] w-72 bg-white flex flex-col lg:hidden animate-in slide-in-from-left duration-300 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                NusaLearn <span className="text-blue-600">Studio</span>
              </span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link key={idx} to={item.path} onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      isActive ? 'bg-slate-900 text-white font-bold shadow-md' : 'text-slate-600 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</div>
                    <span className="text-sm">{item.title}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto opacity-70" />}
                  </Link>
                );
              })}
              
              <div className="my-4 border-t border-slate-100"></div>

              {/* Tambahan Menu Profil di Mobile */}
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                  location.pathname.startsWith('/profile') ? 'bg-slate-900 text-white font-bold shadow-md' : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className={location.pathname.startsWith('/profile') ? 'text-white' : 'text-slate-400'}><Settings size={18} strokeWidth={2.5}/></div>
                <span className="text-sm">Pengaturan Profil</span>
              </Link>
            </nav>
          </aside>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT AREA (PULL WIDTH)                                         */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full pt-16 flex flex-col">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 flex-1">
          <Outlet /> 
        </div>
      </main>

    </div>
  );
};

export default LecturerLayout;