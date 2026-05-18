import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  BookOpen,
  GraduationCap,
  Briefcase,
  CodeXml,
  Sun,
  Moon,
} from "lucide-react";
import api from "../../config/axios";
import toast from "../../utils/toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [loading, setLoading] = useState(false);

  // 🌓 THEME CONTROL ENGINE
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      toast.error("Mohon lengkapi semua bidang formulir.");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", formData);
      toast.success("Pendaftaran berhasil. Silakan masuk.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registrasi gagal dilakukan.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] dark:bg-[#0B0F19] relative overflow-hidden font-sans py-12 transition-colors duration-500 ease-out">
      {/* 🔮 OPTIMIZED BACKDROP GRAPHICS */}
      <div className="absolute top-[10%] right-[-5%] w-[30vw] h-[30vw] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none will-change-transform" />
      <div className="absolute bottom-[-5%] left-[-10%] w-[40vw] h-[40vw] bg-slate-400/10 dark:bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none will-change-transform" />

      {/* FLOATING THEME SWITCHER */}
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
        {/* KIRI - FORM REGISTER (Glassmorphism Order Switch Responsive) */}
        <div className="w-full flex items-center justify-center order-2 md:order-1">
          <div className="w-full max-w-md bg-white/60 dark:bg-[#131B2E]/60 backdrop-blur-md border border-white/40 dark:border-white/[0.06] rounded-xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-all duration-500">
            <div className="mb-5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Registrasi
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Lengkapi data autentikasi untuk bergabung ke ekosistem.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* ROLE SELECTION (Flat Pro Apple Segmented Picker Layout) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Pilih Peran Akun
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-200/40 dark:bg-slate-900/40 p-1 rounded-xl border border-slate-200/30 dark:border-slate-800/50">
                  <label
                    className={`cursor-pointer flex flex-col items-center justify-center py-2 rounded-lg transition-all transform active:scale-95 ${formData.role === "STUDENT" ? "bg-white dark:bg-[#1C263E] text-slate-900 dark:text-white shadow-xs border border-white/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="STUDENT"
                      className="hidden"
                      checked={formData.role === "STUDENT"}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    />
                    <GraduationCap
                      size={15}
                      className="mb-0.5"
                      strokeWidth={2.5}
                    />
                    <span className="text-[10px] font-bold tracking-tight">
                      Siswa
                    </span>
                  </label>

                  <label
                    className={`cursor-pointer flex flex-col items-center justify-center py-2 rounded-lg transition-all transform active:scale-95 ${formData.role === "LECTURER" ? "bg-white dark:bg-[#1C263E] text-slate-900 dark:text-white shadow-xs border border-white/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="LECTURER"
                      className="hidden"
                      checked={formData.role === "LECTURER"}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    />
                    <Briefcase size={15} className="mb-0.5" strokeWidth={2.5} />
                    <span className="text-[10px] font-bold tracking-tight">
                      Dosen
                    </span>
                  </label>

                  <label
                    className={`cursor-pointer flex flex-col items-center justify-center py-2 rounded-lg transition-all transform active:scale-95 ${formData.role === "CREATOR" ? "bg-white dark:bg-[#1C263E] text-slate-900 dark:text-white shadow-xs border border-white/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="CREATOR"
                      className="hidden"
                      checked={formData.role === "CREATOR"}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    />
                    <CodeXml size={15} className="mb-0.5" strokeWidth={2.5} />
                    <span className="text-[10px] font-bold tracking-tight">
                      Kreator
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User
                      size={14}
                      className="text-slate-400 dark:text-slate-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition-all duration-200"
                    placeholder="Nama sesuai identitas"
                  />
                </div>
              </div>

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
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition-all duration-200"
                    placeholder="email@instansi.ac.id"
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
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none transition-all duration-200"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 rounded-lg h-10 font-bold text-xs uppercase tracking-wider shadow-sm transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={14} strokeWidth={2.5} /> Daftarkan Akun
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
              Sudah memiliki akun?{" "}
              <Link
                to="/login"
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Masuk di sini
              </Link>
            </div>
          </div>
        </div>

        {/* KANAN - BRANDING */}
        <div className="hidden md:flex flex-col justify-center p-8 order-1 md:order-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-indigo-600 dark:bg-indigo-50 rounded-lg flex items-center justify-center shadow-xs">
              <BookOpen size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              NusaLearn
            </span>
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight text-slate-900 dark:text-slate-50 tracking-tight">
            Mulai Perjalanan <br /> Akademik Anda.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
            Satu platform untuk berbagai kebutuhan edukasi. Mengajar,
            berkolaborasi, dan kembangkan keahlian dengan infrastruktur
            teknologi modern.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
