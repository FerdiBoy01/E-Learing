import { useState } from "react";
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
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] relative overflow-hidden font-sans py-12">
      {/* Subtle Background Orbs */}
      <div className="absolute top-[10%] right-[-5%] w-[30vw] h-[30vw] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-10%] w-[40vw] h-[40vw] bg-slate-300/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 p-6 relative z-10">
        {/* KIRI - FORM REGISTER (Glassmorphism) */}
        <div className="w-full flex items-center justify-center order-2 md:order-1">
          <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white/50 rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Registrasi
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Lengkapi data untuk bergabung.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* ROLE SELECTION (Tegas & Minimalis) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Pilih Peran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`cursor-pointer border flex flex-col items-center justify-center py-2.5 rounded-lg transition-all ${formData.role === "STUDENT" ? "bg-slate-900 border-slate-900 text-white" : "bg-white/50 border-slate-200 text-slate-500 hover:border-slate-300"}`}
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
                    <GraduationCap size={16} className="mb-1" />
                    <span className="text-[10px] font-semibold">Siswa</span>
                  </label>

                  <label
                    className={`cursor-pointer border flex flex-col items-center justify-center py-2.5 rounded-lg transition-all ${formData.role === "LECTURER" ? "bg-slate-900 border-slate-900 text-white" : "bg-white/50 border-slate-200 text-slate-500 hover:border-slate-300"}`}
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
                    <Briefcase size={16} className="mb-1" />
                    <span className="text-[10px] font-semibold">Dosen</span>
                  </label>

                  <label
                    className={`cursor-pointer border flex flex-col items-center justify-center py-2.5 rounded-lg transition-all ${formData.role === "CREATOR" ? "bg-slate-900 border-slate-900 text-white" : "bg-white/50 border-slate-200 text-slate-500 hover:border-slate-300"}`}
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
                    <CodeXml size={16} className="mb-1" />
                    <span className="text-[10px] font-semibold">Kreator</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 bg-white/50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm text-slate-900 outline-none transition-all"
                    placeholder="Nama sesuai identitas"
                  />
                </div>
              </div>

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
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 bg-white/50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm text-slate-900 outline-none transition-all"
                    placeholder="email@instansi.ac.id"
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
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 bg-white/50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm text-slate-900 outline-none transition-all"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-10 font-semibold text-sm transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={16} /> Daftarkan Akun
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs font-medium text-slate-500">
              Sudah memiliki akun?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Masuk di sini
              </Link>
            </div>
          </div>
        </div>

        {/* KANAN - BRANDING */}
        <div className="hidden md:flex flex-col justify-center p-8 order-1 md:order-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              NusaLearn
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight text-slate-900 tracking-tight">
            Mulai Perjalanan <br /> Akademik Anda.
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
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
