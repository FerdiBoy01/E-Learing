import { useEffect, useState, useRef } from "react";
import { Save, User, Briefcase, FileText, Camera } from "lucide-react";
import api from "../../config/axios";
import useAuthStore from "../../store/authStore";
import toast from "../../utils/toast";

const ProfileLecturer = () => {
  const { user, setUser } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    bio: "",
    avatar_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        const userData = res.data.data.user || res.data.data;

        setFormData({
          name: userData.name || "",
          profession: userData.profession || "",
          bio: userData.bio || "",
          avatar_url: userData.avatar_url || "",
        });
      } catch (error) {
        console.error("Gagal mengambil profil", error);
        toast.error("Gagal memuat data profil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 2MB");
      return;
    }

    // 🔥 FIX PAYLOAD: Pakai field 'image' sesuai konfigurasi Multer backend lu
    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      setUploadingImage(true);

      // 1. Tembak ke endpoint upload global murni milik lu
      const resUpload = await api.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = resUpload.data.url; // Ambil URL hasil generate server

      // 2. Siapkan data profile baru termasuk URL gambar yang baru dapet
      const updatedProfileData = {
        ...formData,
        avatar_url: uploadedUrl,
      };

      // 3. Tembak ke database user agar tersimpan permanen
      const resProfile = await api.put("/users/profile", updatedProfileData);

      if (resProfile.data?.data?.user) {
        const freshUserData = resProfile.data.data.user;
        setUser(freshUserData); // Update global state Zustand biar navbar ikut berubah
        setFormData(freshUserData); // Update local form state
      } else {
        // Fallback jika response structure backend lu langsung object user mentah
        setFormData((prev) => ({ ...prev, avatar_url: uploadedUrl }));
        setUser({ ...user, avatar_url: uploadedUrl });
      }

      toast.success("Foto profil berhasil diperbarui!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunggah foto profil.");
    } finally {
      setUploadingImage(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/users/profile", formData);

      // 🔥 FIX BUG: Ambil data user utuh hasil gabungan avatar_url baru dari DB
      if (res.data?.data?.user) {
        const freshUserData = res.data.data.user;
        setUser(freshUserData);
        setFormData({
          name: freshUserData.name || "",
          profession: freshUserData.profession || "",
          bio: freshUserData.bio || "",
          avatar_url: freshUserData.avatar_url || "",
        });
      }

      toast.success("Profil berhasil disimpan!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center">
        <span className="w-8 h-8 border-4 border-slate-200 border-t-slate-950 rounded-full animate-spin"></span>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-2 px-4 font-sans animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Profil Instruktur
        </h1>
        <p className="text-slate-500 text-xs font-medium mt-1">
          Lengkapi data profil studio Anda agar mahasiswa dapat mengenal Anda
          lebih dekat.
        </p>
      </div>

      {/* CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* AVATAR */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              onClick={() => !uploadingImage && fileInputRef.current.click()}
              className="w-32 h-32 rounded-full bg-slate-50 border border-slate-200 shadow-sm overflow-hidden relative group cursor-pointer"
            >
              {uploadingImage ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></span>
                </div>
              ) : (
                <>
                  <img
                    src={
                      formData.avatar_url ||
                      `https://ui-avatars.com/api/?name=${formData.name || "User"}&background=f1f5f9&color=334155&size=200`
                    }
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={18} className="text-white mb-0.5" />
                    <span className="text-white text-[8px] font-bold uppercase tracking-wider">
                      Ubah Foto
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Foto Instruktur
              </span>
            </div>

            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* FORM INPUT */}
          <form onSubmit={handleSubmit} className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1">
                <User size={12} /> Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-lg text-xs font-semibold outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1">
                <Briefcase size={12} /> Gelar / Keterangan Profesi
              </label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                placeholder="Contoh: Senior Fullstack Web Developer"
                className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-lg text-xs font-semibold outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1">
                <FileText size={12} /> Ringkasan Biografi (Bio)
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tuliskan pengalaman profesional Anda..."
                className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-lg text-xs font-medium outline-none h-28 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                {saving ? "Memproses..." : "Simpan Profil"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileLecturer;
