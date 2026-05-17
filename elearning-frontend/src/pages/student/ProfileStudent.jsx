import { useEffect, useState, useRef, useCallback } from "react";
import {
  User,
  Mail,
  IdCard,
  Zap,
  Camera,
  Edit3,
  Save,
  Sparkles,
  Briefcase,
  Shield,
  Crown,
  Medal,
  Hexagon,
  Coins,
  TrendingUp,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import api from "../../config/axios";
import toast from "../../utils/toast";

const ProfileStudent = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    nim_nip: "",
    profession: "",
    bio: "",
    avatar_url: "",
  });

  const [imagePreview, setImagePreview] = useState("");

  const fetchLatestProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/me");
      const userData = response.data.data.user;

      const mappedData = {
        name: userData.name || "",
        nim_nip: userData.nim_nip || "",
        profession: userData.profession || "",
        bio: userData.bio || "",
        avatar_url: userData.avatar_url || "",
      };

      setFormData(mappedData);
      if (userData.avatar_url) setImagePreview(userData.avatar_url);

      // 🔥 FIX: Paksa state global untuk memperbarui angka gamifikasi
      setUser({
        ...userData,
        exp: Number(userData.exp) || 0,
        level: Number(userData.level) || 1,
        points: Number(userData.points) || 0,
      });
    } catch (error) {
      console.error("Gagal ambil data profil", error);
      toast.error("Gagal memuat data profil. Pastikan koneksi aman.");
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    fetchLatestProfile();
  }, [fetchLatestProfile]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Nama wajib diisi";
    if (formData.bio && formData.bio.length > 500)
      newErrors.bio = "Bio maksimal 500 karakter";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024)
      return toast.error("Ukuran gambar maksimal 2MB");

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    const uploadData = new FormData();
    uploadData.append("avatar", file);

    try {
      setIsSubmitting(true);
      const response = await api.post("/users/upload-avatar", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedUser = response.data.data.user;
      setFormData((prev) => ({ ...prev, avatar_url: updatedUser.avatar_url }));

      setUser({
        ...user,
        avatar_url: updatedUser.avatar_url,
      });

      toast.success("Foto profil diperbarui");
    } catch (error) {
      toast.error("Gagal upload foto profil");
      setImagePreview(formData.avatar_url);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setIsSubmitting(true);
      const response = await api.put("/users/profile", formData);
      const updatedUser = response.data.data.user;

      setUser({
        ...user,
        ...updatedUser,
        exp: Number(updatedUser.exp) || user.exp,
        level: Number(updatedUser.level) || user.level,
        points: Number(updatedUser.points) || user.points,
      });

      setIsEditing(false);
      toast.success("Profil berhasil diperbarui!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setFormData({
      name: user?.name || "",
      nim_nip: user?.nim_nip || "",
      profession: user?.profession || "",
      bio: user?.bio || "",
      avatar_url: user?.avatar_url || "",
    });
    setImagePreview(user?.avatar_url || "");
  };

  const getRankData = (level) => {
    if (level >= 10)
      return {
        title: "Legendary Scholar",
        icon: <Crown size={24} className="text-amber-300 drop-shadow-md" />,
        color: "bg-gradient-to-br from-amber-400 to-yellow-600",
        textColor: "text-amber-500",
        shadow: "shadow-amber-500/30",
      };
    if (level >= 7)
      return {
        title: "Platinum Dev",
        icon: <Medal size={24} className="text-cyan-200 drop-shadow-md" />,
        color: "bg-gradient-to-br from-cyan-400 to-teal-500",
        textColor: "text-cyan-600",
        shadow: "shadow-cyan-500/30",
      };
    if (level >= 4)
      return {
        title: "Gold Hacker",
        icon: <Shield size={24} className="text-yellow-100 drop-shadow-md" />,
        color: "bg-gradient-to-br from-yellow-400 to-amber-500",
        textColor: "text-yellow-600",
        shadow: "shadow-yellow-500/30",
      };
    if (level >= 2)
      return {
        title: "Silver Coder",
        icon: <Hexagon size={24} className="text-slate-100 drop-shadow-md" />,
        color: "bg-gradient-to-br from-slate-300 to-slate-500",
        textColor: "text-slate-600",
        shadow: "shadow-slate-500/30",
      };
    return {
      title: "Iron Novice",
      icon: <Shield size={24} className="text-orange-100 drop-shadow-md" />,
      color: "bg-gradient-to-br from-orange-300 to-orange-500",
      textColor: "text-orange-600",
      shadow: "shadow-orange-500/30",
    };
  };

  // 🔥 FIX & UPGRADE: Auto-Calculate Level dari jumlah EXP!
  const currentExp = Number(user?.exp) || 0;

  // Kalau EXP 3200 -> 3200/1000 = 3.2 -> dibuletin ke bawah jadi 3 -> ditambah 1 = Level 4!
  const calculatedLevel = Math.floor(currentExp / 1000) + 1;

  // Ambil level terbesar antara database vs kalkulasi aslinya
  const currentLevel = Math.max(Number(user?.level) || 1, calculatedLevel);

  const currentPoints = Number(user?.points) || 0;
  const maxExpForCurrentLevel = currentLevel * 1000;
  const rank = getRankData(currentLevel);

  if (loading)
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <span className="loading loading-spinner loading-lg text-slate-800"></span>
        <p className="mt-4 text-slate-500 font-bold animate-pulse text-sm">
          Menyiapkan profilmu...
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pb-20 pt-4 text-slate-800 animate-in fade-in duration-500">
      <div className="relative mb-32">
        <div className="h-48 md:h-64 rounded-[2rem] overflow-hidden bg-slate-900 relative border border-slate-800 shadow-xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full" />
        </div>

        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[92%] md:w-auto md:left-10 md:translate-x-0">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl px-6 py-5 flex flex-col md:flex-row items-center gap-6 min-w-[320px]">
            <div className="relative group shrink-0">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl overflow-hidden border-[6px] border-white bg-slate-100 shadow-xl relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <User size={60} />
                  </div>
                )}
                <div
                  className={`absolute bottom-0 right-0 p-1.5 rounded-tl-xl rounded-br-2xl ${rank.color} border-2 border-white shadow-lg`}
                >
                  {rank.icon}
                </div>
              </div>

              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="absolute bottom-1 right-1 bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-2xl shadow-lg transition active:scale-95 border-4 border-white"
                >
                  <Camera size={16} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="text-center md:text-left flex-1 pr-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                  {formData.name || "Pelajar Hebat"}
                </h1>
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg border border-white/20 ${rank.color} ${rank.shadow}`}
                >
                  <Sparkles size={12} /> {rank.title}
                </div>
              </div>

              <p className="mt-2 text-slate-500 text-sm flex items-center justify-center md:justify-start gap-2 break-all font-medium">
                <Mail size={14} /> {user?.email}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                  Level {currentLevel}
                </div>
                {formData.profession && (
                  <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
                    {formData.profession}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="space-y-6 xl:sticky xl:top-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp size={100} className="text-slate-900" />
            </div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-0.5">
                  Progress Level
                </p>
                <h3 className="text-lg font-black text-slate-800">
                  Combat EXP
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
                <Zap size={20} className="text-amber-400" />
              </div>
            </div>

            <div className="mb-6 relative z-10">
              <div className="flex items-end justify-between mb-2">
                <div className="flex items-end gap-1">
                  <h2 className="text-4xl font-black text-slate-900 leading-none">
                    {currentExp}
                  </h2>
                  <span className="text-sm font-bold text-slate-400 mb-1">
                    / {maxExpForCurrentLevel}
                  </span>
                </div>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase">
                  EXP Pts
                </span>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-1000 relative"
                  style={{
                    width: `${Math.min((currentExp / maxExpForCurrentLevel) * 100, 100)}%`,
                  }}
                >
                  <div className="absolute inset-0 bg-white/20"></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative z-10">
              <p className="text-xs text-slate-600 font-medium">
                Selesaikan modul materi dan raih kelipatan{" "}
                <strong className="text-slate-900">1000 EXP</strong> untuk naik
                level ke rank selanjutnya!
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Coins size={100} className="text-amber-400" />
            </div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-0.5">
                  Saldo Reward
                </p>
                <h3 className="text-lg font-black text-white">Nusa Points</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Coins size={24} className="text-amber-900" />
              </div>
            </div>

            <div className="mb-2 relative z-10">
              {/* 🔥 TAMPILAN POIN SUDAH AMAN DARI NaN */}
              <h2 className="text-4xl font-black text-amber-400">
                {new Intl.NumberFormat("id-ID").format(currentPoints)}{" "}
                <span className="text-lg text-slate-500">Pts</span>
              </h2>
            </div>

            <p className="text-xs text-slate-400 font-medium relative z-10">
              Tukar poin ini untuk membeli kelas Premium secara gratis.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <IdCard size={16} className="text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                  Student ID
                </p>
                <h4 className="font-bold text-slate-800 text-sm">
                  {formData.nim_nip || "-"}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <Briefcase size={16} className="text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                  Profession
                </p>
                <h4 className="font-bold text-slate-800 text-sm">
                  {formData.profession || "-"}
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Pengaturan Profil
                </h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  Kelola informasi akun dan biodata profilmu
                </p>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-sm bg-white border border-slate-200 hover:border-slate-800 hover:bg-slate-50 rounded-xl text-slate-700 font-bold px-4"
                >
                  <Edit3 size={14} /> Edit Data
                </button>
              )}
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-[10px] uppercase tracking-widest font-black text-slate-500">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`input input-bordered w-full rounded-2xl bg-slate-50 border-slate-200 font-bold text-slate-800 focus:bg-white focus:border-slate-800 transition-colors ${errors.name ? "border-red-400" : ""}`}
                  />
                  {errors.name && (
                    <p className="mt-2 text-xs text-red-500 font-bold">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-[10px] uppercase tracking-widest font-black text-slate-500">
                    NIM / Student ID
                  </label>
                  <input
                    type="text"
                    value={formData.nim_nip}
                    onChange={(e) =>
                      setFormData({ ...formData, nim_nip: e.target.value })
                    }
                    disabled={!isEditing}
                    className="input input-bordered w-full rounded-2xl bg-slate-50 border-slate-200 font-bold text-slate-800 focus:bg-white focus:border-slate-800 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-[10px] uppercase tracking-widest font-black text-slate-500">
                    Bidang Fokus / Keahlian
                  </label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) =>
                      setFormData({ ...formData, profession: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder="Frontend Engineer, Backend Developer..."
                    className="input input-bordered w-full rounded-2xl bg-slate-50 border-slate-200 font-bold text-slate-800 focus:bg-white focus:border-slate-800 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-[10px] uppercase tracking-widest font-black text-slate-500">
                    Bio Singkat
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    disabled={!isEditing}
                    rows="4"
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    className="textarea textarea-bordered w-full rounded-2xl bg-slate-50 border-slate-200 font-medium text-slate-800 focus:bg-white focus:border-slate-800 transition-colors resize-none text-base"
                  />
                  <div className="flex justify-end mt-2">
                    <span className="text-xs font-bold text-slate-400">
                      {formData.bio.length}/500
                    </span>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                  <button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="btn btn-ghost rounded-xl font-bold hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="btn bg-slate-900 hover:bg-slate-800 border-none rounded-xl text-white font-bold px-8 shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <>
                        <Save size={16} /> Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStudent;
