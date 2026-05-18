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
      const userData = response.data.data.user || response.data.data;

      const mappedData = {
        name: userData.name || "",
        nim_nip: userData.nim_nip || "",
        profession: userData.profession || "",
        bio: userData.bio || "",
        avatar_url: userData.avatar_url || "",
      };

      setFormData(mappedData);
      if (userData.avatar_url) setImagePreview(userData.avatar_url);

      setUser({
        ...userData,
        exp: Number(userData.exp) || 0,
        level: Number(userData.level) || 1,
        points: Number(userData.points) || 0,
      });
    } catch (error) {
      console.error("Gagal ambil data profil", error);
      toast.error("Gagal memuat data profil.");
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

  // 🔥 FIX BUG UPLOAD SAKTI: Samakan alur dengan milik dosen (Pakai API Upload Global)
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024)
      return toast.error("Ukuran gambar maksimal 2MB");

    // Tampilkan preview lokal instan
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // Pakai field 'image' sesuai konfigurasi router global /api/upload
    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      setIsSubmitting(true);

      // 1. Ambil URL gambar dari endpoint upload global
      const resUpload = await api.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedUrl = resUpload.data.url;

      // 2. Siapkan data profile baru
      const updatedProfileData = {
        ...formData,
        avatar_url: uploadedUrl,
      };

      // 3. Simpan permanen ke DB user profile
      const resProfile = await api.put("/users/profile", updatedProfileData);

      if (resProfile.data?.data?.user) {
        const freshUserData = resProfile.data.data.user;
        setUser(freshUserData);
        setFormData(freshUserData);
      } else {
        setFormData((prev) => ({ ...prev, avatar_url: uploadedUrl }));
        setUser({ ...user, avatar_url: uploadedUrl });
      }

      toast.success("Foto profil diperbarui");
    } catch (error) {
      toast.error("Gagal memperbarui foto profil");
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
        icon: <Crown size={14} />,
        color: "bg-slate-900 border-slate-950",
      };
    if (level >= 7)
      return {
        title: "Platinum Dev",
        icon: <Medal size={14} />,
        color: "bg-slate-800 border-slate-900",
      };
    if (level >= 4)
      return {
        title: "Gold Hacker",
        icon: <Shield size={14} />,
        color: "bg-slate-700 border-slate-800",
      };
    if (level >= 2)
      return {
        title: "Silver Coder",
        icon: <Hexagon size={14} />,
        color: "bg-slate-600 border-slate-700",
      };
    return {
      title: "Iron Novice",
      icon: <Shield size={14} />,
      color: "bg-slate-500 border-slate-600",
    };
  };

  const currentExp = Number(user?.exp) || 0;
  const calculatedLevel = Math.floor(currentExp / 1000) + 1;
  const currentLevel = Math.max(Number(user?.level) || 1, calculatedLevel);
  const currentPoints = Number(user?.points) || 0;
  const maxExpForCurrentLevel = currentLevel * 1000;
  const rank = getRankData(currentLevel);

  if (loading)
    return (
      <div className="h-[70vh] flex flex-col justify-center items-center">
        <span className="w-8 h-8 border-4 border-slate-200 border-t-slate-950 rounded-full animate-spin"></span>
      </div>
    );

  return (
    <div className="max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8 font-sans text-slate-900 animate-in fade-in duration-300 space-y-6">
      {/* ========================================================================= */}
      {/* HEADER BANNER AREA (Apple Minimalist Glass)                               */}
      {/* ========================================================================= */}
      <div className="relative rounded-xl border border-slate-200 shadow-sm bg-white p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
        {/* AVATAR DENGAN BADGE RANK */}
        <div className="relative shrink-0 group">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative shadow-sm">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                <User size={48} />
              </div>
            )}

            {/* Overlay Klik untuk Upload pas Mode Edit */}
            {isEditing && (
              <div
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-950/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
              >
                <Camera size={20} className="text-white mb-0.5" />
                <span className="text-white text-[8px] font-black uppercase tracking-wider">
                  Ganti
                </span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* INFO UTAMA USER */}
        <div className="text-center md:text-left flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 justify-center md:justify-start">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formData.name || "Nusa Student"}
            </h1>
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-white border w-fit mx-auto md:mx-0 ${rank.color}`}
            >
              {rank.icon} {rank.title}
            </div>
          </div>

          <p className="text-slate-500 text-xs flex items-center justify-center md:justify-start gap-1.5 font-medium">
            <Mail size={12} /> {user?.email}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-wider">
              Level {currentLevel}
            </span>
            {formData.profession && (
              <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold">
                {formData.profession}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GRID KONTEN UTAMA                                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* GRID KIRI: STATS & ATRIBUT GAMIFIKASI */}
        <div className="space-y-6">
          {/* CARD EXP */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[9px] font-black tracking-widest uppercase text-slate-400 mb-0.5">
                  Progress Level
                </p>
                <h3 className="text-sm font-bold text-slate-900">
                  Combat EXP Pts
                </h3>
              </div>
              <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900">
                <Zap size={16} strokeWidth={2.5} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-end gap-1">
                <h2 className="text-2xl font-black text-slate-900 leading-none">
                  {currentExp}
                </h2>
                <span className="text-xs font-bold text-slate-400">
                  / {maxExpForCurrentLevel}
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-500"
                  style={{
                    width: `${Math.min((currentExp / maxExpForCurrentLevel) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* CARD NUSA POINTS */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[9px] font-black tracking-widest uppercase text-slate-400 mb-0.5">
                  Saldo Belanja
                </p>
                <h3 className="text-sm font-bold text-slate-900">
                  Nusa Points
                </h3>
              </div>
              <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900">
                <Coins size={16} strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {new Intl.NumberFormat("id-ID").format(currentPoints)}{" "}
              <span className="text-xs font-bold text-slate-400 uppercase">
                Pts
              </span>
            </h2>
          </div>

          {/* CARD TRACKING ID (Anti Jitter Layout) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-sm">
                <IdCard size={14} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 leading-none">
                  Nomor Induk Mahasiswa
                </p>
                <h4 className="font-bold text-slate-800 text-xs mt-1">
                  {formData.nim_nip || "-"}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-sm">
                <Briefcase size={14} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 leading-none">
                  Fokus Keahlian
                </p>
                <h4 className="font-bold text-slate-800 text-xs mt-1">
                  {formData.profession || "-"}
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* GRID KANAN: PENGATURAN BIODATA PROFILE */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Pengaturan Biodata
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Kelola informasi otentik akun belajar Anda.
                </p>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white border border-slate-200 hover:border-slate-900 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <Edit3 size={12} className="inline mr-1" /> Edit Data
                </button>
              )}
            </div>

            {/* FORM FIELD AREA */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg text-xs font-semibold outline-none transition-colors ${errors.name ? "border-rose-400 focus:border-rose-500" : ""}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-[10px] text-rose-500 font-bold">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    NIM / Student ID
                  </label>
                  <input
                    type="text"
                    value={formData.nim_nip}
                    onChange={(e) =>
                      setFormData({ ...formData, nim_nip: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg text-xs font-semibold outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block mb-2 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    Bidang Fokus / Keahlian
                  </label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) =>
                      setFormData({ ...formData, profession: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder="Contoh: Frontend Engineer, Android Developer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg text-xs font-semibold outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block mb-2 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    Bio Singkat
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    disabled={!isEditing}
                    rows="4"
                    placeholder="Ceritakan deskripsi pendek mengenai dirimu..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-lg text-xs font-medium outline-none transition-colors h-24 resize-none leading-relaxed"
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {formData.bio.length}/500
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION TRIGGER BUTTONS PASS MODE EDIT AKTIF (ANTI JITTER) */}
              {isEditing && (
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
                  <button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-50 text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Save size={14} /> Simpan Perubahan
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
