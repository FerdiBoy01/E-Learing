import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, BookOpen } from "lucide-react";
import api from "../../config/axios";
import useAuthStore from "../../store/authStore";
import toast from "../../utils/toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Email dan kata sandi wajib diisi.");
      return;
    }

    if (password.length < 6) {
      toast.error("Kata sandi minimal 6 karakter.");
      return;
    }

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
    // Background ala macOS (Abu-abu terang dengan subtle orbs di belakang kaca)
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] relative overflow-hidden font-sans">
      {/* Subtle Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-200/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-slate-300/50 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 p-6 relative z-10">
        {/* KIRI - BRANDING (Clean & Tegas) */}
        <div className="hidden md:flex flex-col justify-center p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              NusaLearn
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight text-slate-900 tracking-tight">
            Portal Edukasi <br /> Profesional.
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Akses ribuan materi pembelajaran berstandar industri. Tingkatkan
            kompetensi dan bangun portofolio karir Anda hari ini.
          </p>
        </div>

        {/* KANAN - FORM LOGIN (Glassmorphism Apple Style) */}
        <div className="w-full flex items-center justify-center">
          <div className="w-full max-w-sm bg-white/70 backdrop-blur-2xl border border-white/50 rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Masuk
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Masukkan kredensial akun Anda.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm text-slate-900 outline-none transition-all"
                    placeholder="nama@instansi.ac.id"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm text-slate-900 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-medium text-slate-600">
                    Ingat saya
                  </span>
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Lupa sandi?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-10 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={16} /> Lanjutkan
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs font-medium text-slate-500">
              Belum terdaftar?{" "}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
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
