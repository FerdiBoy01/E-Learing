import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, BookOpen, Sun, Moon } from "lucide-react";
import api from "../../config/axios";
import useAuthStore from "../../store/authStore";
import toast from "../../utils/toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🌓 THEME CONTROL ENGINE (Murni & Ringan)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim())
      return toast.error("Email dan kata sandi wajib diisi.");
    if (password.length < 6)
      return toast.error("Kata sandi minimal 6 karakter.");

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data.data;

      setToken(token);
      setUser(user);
      toast.success(`Selamat datang, ${user.name}.`);

      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "STUDENT") navigate("/");
      else navigate("/courses");
    } catch (error) {
      toast.error(error.response?.data?.message || "Kredensial tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] dark:bg-[#0B0F19] relative overflow-hidden font-sans transition-colors duration-500 ease-out">
      {/* 🔮 OPTIMIZED LIGHTWEIGHT BACKDROP GRAPHICS (Gunakan Opacity Rendah Agar Beban GPU Ringan) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none will-change-transform" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-slate-400/10 dark:bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none will-change-transform" />

      {/* FLOATING FLOATING THEME SWITCHER */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 p-2.5 bg-white/60 dark:bg-[#131B2E]/60 border border-white/40 dark:border-white/[0.06] backdrop-blur-md text-slate-800 dark:text-slate-200 rounded-xl shadow-xs transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {isDarkMode ? (
          <Sun size={16} strokeWidth={2.5} />
        ) : (
          <Moon size={16} strokeWidth={2.5} />
        )}
      </button>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 p-6 relative z-10 items-center">
        {/* KIRI - BRANDING (Clean & Premium Typography Hierarchy) */}
        <div className="hidden md:flex flex-col justify-center p-8 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center shadow-xs">
              <BookOpen size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              NusaLearn
            </span>
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight text-slate-900 dark:text-slate-50 tracking-tight">
            Portal Edukasi <br /> Profesional.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
            Akses ribuan materi pembelajaran berstandar industri. Tingkatkan
            kompetensi dan bangun portofolio karir Anda hari ini.
          </p>
        </div>

        {/* KANAN - FORM LOGIN (Tactile Glassmorphism Card Style) */}
        <div className="w-full flex items-center justify-center">
          <div className="w-full max-w-sm bg-white/60 dark:bg-[#131B2E]/60 backdrop-blur-md border border-white/40 dark:border-white/[0.06] rounded-xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-all duration-500">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Masuk
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Masukkan kredensial akun terdaftar Anda.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail
                      size={14}
                      className="text-slate-400 dark:text-slate-500"
                    />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition-all duration-200"
                    placeholder="nama@instansi.ac.id"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock
                      size={14}
                      className="text-slate-400 dark:text-slate-500"
                    />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded-sm border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-500 focus:ring-0 cursor-pointer bg-white/50 dark:bg-slate-900/50"
                  />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors group-hover:text-slate-800 dark:group-hover:text-slate-200">
                    Ingat saya
                  </span>
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Lupa sandi?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 rounded-lg h-10 font-bold text-xs uppercase tracking-wider shadow-sm transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={14} strokeWidth={2.5} /> Lanjutkan
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
              Belum terdaftar?{" "}
              <Link
                to="/register"
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Buat Akun
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
