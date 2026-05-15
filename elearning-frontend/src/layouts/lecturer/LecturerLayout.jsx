import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ClipboardCheck, LogOut, Menu, User, Settings } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const LecturerLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  // 🔥 1. TAMBAH MENU PROFIL DI SIDEBAR
  const menuItems = [
    { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { title: 'Mata Kuliah', path: '/courses', icon: <BookOpen size={20} /> },
    { title: 'Penilaian', path: '/submissions', icon: <ClipboardCheck size={20} /> },
    { title: 'Profil Saya', path: '/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="drawer lg:drawer-open bg-slate-50 min-h-screen">
      <input id="lecturer-drawer" type="checkbox" className="drawer-toggle" />
      
      {/* KONTEN UTAMA (Kanan) */}
      <div className="drawer-content flex flex-col">
        
        {/* Navbar Clean */}
        <div className="w-full navbar bg-white border-b border-slate-200 px-4 lg:px-8 py-2 z-10 sticky top-0 shadow-sm">
          <div className="flex-none lg:hidden">
            <label htmlFor="lecturer-drawer" className="btn btn-square btn-ghost text-slate-600">
              <Menu size={24} />
            </label>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 ml-2 lg:hidden">NusantaraLearn</h1>
          </div>
          <div className="flex-none gap-2">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100">
                {/* Kalau user udah punya avatar, tampilkan. Kalau belum, pakai icon */}
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={20} className="text-blue-600" />
                )}
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-white border border-slate-100 rounded-xl w-56">
                <li className="menu-title px-4 py-3">
                  <span className="font-semibold text-slate-800 text-sm block">{user?.name}</span>
                  <span className="text-xs font-normal text-slate-500 mt-1">{user?.role}</span>
                </li>
                <div className="divider my-0 opacity-50"></div>
                
                {/* 🔥 2. TAMBAH TOMBOL EDIT PROFIL DI DROPDOWN */}
                <li className="p-1">
                  <Link to="/profile" className="text-slate-600 hover:bg-blue-50 hover:text-blue-600 py-2 rounded-lg transition-colors">
                    <Settings size={16} /> Pengaturan Profil
                  </Link>
                </li>
                
                <li className="p-1">
                  <a onClick={logout} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 py-2 rounded-lg transition-colors">
                    <LogOut size={16} /> Keluar Sistem
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Area Page Content */}
        <div className="p-6 sm:p-10">
          <Outlet /> 
        </div>
      </div> 

      {/* SIDEBAR PROFESSIONAL (Kiri) */}
      <div className="drawer-side z-40">
        <label htmlFor="lecturer-drawer" aria-label="close sidebar" className="drawer-overlay"></label> 
        <div className="menu p-4 w-72 min-h-full bg-white border-r border-slate-200 text-slate-700 flex flex-col shadow-sm">
          
          {/* Logo Brand */}
          <div className="mb-8 px-4 mt-4">
            <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <div className="bg-blue-50 p-2 rounded-lg">
                <BookOpen size={24} className="text-blue-600" />
              </div>
              NusantaraLearn
            </h1>
          </div>

          {/* List Menu */}
          <ul className="flex-1 space-y-1 px-2">
            {menuItems.map((item, idx) => {
              // Perbaikan logika isActive biar pas nge-klik sub-menu profil juga tetap nyala
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <li key={idx}>
                  <Link 
                    to={item.path} 
                    className={`rounded-lg py-3 px-4 transition-all ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 font-medium text-slate-600'}`}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* Footer Sidebar Dosen */}
          <div className="mt-auto px-4 pb-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 font-medium">Platform Akademik v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerLayout;