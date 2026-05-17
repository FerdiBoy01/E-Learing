import { useState, useRef } from "react";
import {
  Plus,
  X,
  Tag,
  Sparkles,
  DollarSign,
  UploadCloud,
  Image as ImageIcon,
  Globe,
  Lock,
  KeyRound,
  BookOpen,
} from "lucide-react";
import api from "../config/axios";
import toast from "../utils/toast";

const CreateCourseModal = ({ onCourseCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("REGULAR");
  const [price, setPrice] = useState("");

  const [visibility, setVisibility] = useState("PUBLIC");
  const [accessCode, setAccessCode] = useState("");

  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 2MB!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingImage(true);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setThumbnailUrl(res.data.url);
      toast.success("Gambar berhasil diunggah!");
    } catch (error) {
      toast.error("Gagal mengunggah gambar. Pastikan server API menyala.");
      console.error(error);
    } finally {
      setUploadingImage(false);
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const finalPrice = type === "REGULAR" ? 0 : parseInt(price) || 0;

      await api.post("/courses", {
        title,
        description,
        type,
        price: finalPrice,
        thumbnail_url: thumbnailUrl,
        visibility,
        access_code: visibility === "PRIVATE" ? accessCode : undefined,
        // 🔥 Kirim nilai default 0 biar backend yang ngatur otomatis sesuai algoritma admin
        reward_points: 0,
        reward_exp: 0,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setType("REGULAR");
      setPrice("");
      setVisibility("PUBLIC");
      setAccessCode("");
      setThumbnailUrl("");

      document.getElementById("modal_create_course").close();
      onCourseCreated();
      toast.success("Silabus berhasil dibuat dan tersimpan sebagai Draf!");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-3 font-bold transition-all hover:scale-[1.02] shadow-sm flex items-center gap-2 text-xs uppercase tracking-wider border border-slate-800"
        onClick={() =>
          document.getElementById("modal_create_course").showModal()
        }
      >
        <Plus size={16} strokeWidth={2.5} /> Buat Kelas Baru
      </button>

      <dialog
        id="modal_create_course"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box bg-white/90 backdrop-blur-2xl border border-white/50 rounded-2xl max-w-2xl p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="p-5 border-b border-slate-200/60 flex justify-between items-center bg-white/50">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/50">
                <BookOpen size={16} strokeWidth={2.5} />
              </div>
              Setup Silabus Baru
            </h3>
            <form method="dialog">
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                <X size={16} strokeWidth={2.5} />
              </button>
            </form>
          </div>

          <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs px-4 py-3 mb-6 font-bold rounded-xl flex items-center gap-2">
                <X size={16} className="shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* AREA UPLOAD GAMBAR */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Gambar Sampul (Thumbnail)
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl text-center cursor-pointer relative overflow-hidden transition-all bg-white/50 ${
                    thumbnailUrl
                      ? "border-slate-300"
                      : "border-slate-300 hover:bg-slate-50 hover:border-indigo-400"
                  } ${uploadingImage ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() =>
                    !uploadingImage && fileInputRef.current.click()
                  }
                >
                  {thumbnailUrl ? (
                    <div className="relative h-44 w-full group bg-slate-50">
                      <img
                        src={thumbnailUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <ImageIcon className="text-white mb-2" size={28} />
                        <span className="text-xs text-white font-bold tracking-wider">
                          Ganti Gambar Sampul
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 flex flex-col items-center">
                      {uploadingImage ? (
                        <span className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></span>
                      ) : (
                        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mb-3">
                          <UploadCloud size={24} className="text-indigo-500" />
                        </div>
                      )}
                      <p className="text-xs font-bold text-slate-700">
                        {uploadingImage
                          ? "Memproses Unggahan..."
                          : "Klik untuk pilih gambar"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-widest">
                        Rekomendasi 16:9 • Maks 2MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
              </div>

              {/* INFO DASAR */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Judul Utama Kelas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Masterclass Fullstack Web Dev 2026"
                  className="w-full px-4 py-3 bg-white/80 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm font-semibold outline-none transition-colors shadow-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Deskripsi Singkat
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white/80 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm font-medium outline-none transition-colors shadow-sm h-24 resize-none"
                  placeholder="Ceritakan gambaran besar apa yang akan dipelajari siswa di kelas ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* MODEL BISNIS (GRATIS / PREMIUM) */}
              <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200 mb-6">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
                  <Tag size={16} className="text-slate-500" /> Model Bisnis
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={`flex flex-col gap-1 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      type === "REGULAR"
                        ? "bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600"
                        : "bg-white/50 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="course_type"
                        value="REGULAR"
                        checked={type === "REGULAR"}
                        onChange={(e) => setType(e.target.value)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-600"
                      />
                      <span className="font-bold text-slate-800 text-xs">
                        Reguler (Akses Bebas)
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 pl-6 leading-relaxed font-medium">
                      Silabus materi terbuka tanpa biaya pendaftaran.
                    </p>
                  </label>

                  <label
                    className={`flex flex-col gap-1 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      type === "PROJECT_BASED"
                        ? "bg-amber-50 border-amber-500 shadow-sm ring-1 ring-amber-500"
                        : "bg-white/50 border-slate-200 hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="course_type"
                        value="PROJECT_BASED"
                        checked={type === "PROJECT_BASED"}
                        onChange={(e) => setType(e.target.value)}
                        className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        Premium Project{" "}
                        <Sparkles size={12} className="text-amber-500" />
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 pl-6 leading-relaxed font-medium">
                      Kelas berbayar.
                    </p>
                  </label>
                </div>

                {type === "PROJECT_BASED" && (
                  <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      <DollarSign size={14} className="text-amber-500" />{" "}
                      Tetapkan Harga (IDR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                        Rp
                      </span>
                      <input
                        type="number"
                        required
                        min="10000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="150000"
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 rounded-xl font-black text-slate-800 text-sm outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* VISIBILITAS KELAS */}
              <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200 mb-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
                  <Globe size={16} className="text-slate-500" /> Visibilitas
                  Akses
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={`flex flex-col gap-1 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      visibility === "PUBLIC"
                        ? "bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600"
                        : "bg-white/50 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visibility_type"
                        value="PUBLIC"
                        checked={visibility === "PUBLIC"}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-600"
                      />
                      <span className="font-bold text-slate-800 text-xs">
                        Katalog Publik
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 pl-6 leading-relaxed font-medium">
                      Tampil di halaman eksplorasi umum.
                    </p>
                  </label>

                  <label
                    className={`flex flex-col gap-1 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      visibility === "PRIVATE"
                        ? "bg-rose-50 border-rose-500 shadow-sm ring-1 ring-rose-500"
                        : "bg-white/50 border-slate-200 hover:border-rose-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visibility_type"
                        value="PRIVATE"
                        checked={visibility === "PRIVATE"}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="w-4 h-4 text-rose-500 focus:ring-rose-500"
                      />
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        Sembunyi / Privat{" "}
                        <Lock size={12} className="text-rose-500" />
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 pl-6 leading-relaxed font-medium">
                      Butuh kode unik khusus untuk mendaftar.
                    </p>
                  </label>
                </div>

                {visibility === "PRIVATE" && (
                  <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <label className="flex items-center justify-between text-[10px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <KeyRound size={14} className="text-rose-500" /> Setup
                        Kunci Akses
                      </span>
                      <span className="bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded text-[8px]">
                        Opsional
                      </span>
                    </label>
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Contoh: TI-A-2026 (Kosongkan otomatis random)"
                      className="w-full px-4 py-2.5 bg-white border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 rounded-xl font-bold text-slate-800 text-sm outline-none transition-all shadow-sm"
                    />
                  </div>
                )}
              </div>

              <div className="mt-8 pt-5 border-t border-slate-200/60 flex justify-end gap-3 sticky bottom-0 bg-white/90 backdrop-blur-xl p-2 rounded-xl">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 text-xs uppercase tracking-wider transition-colors"
                  onClick={() =>
                    document.getElementById("modal_create_course").close()
                  }
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-8 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md transition-colors flex items-center gap-2"
                  disabled={loading || uploadingImage}
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Simpan Struktur Silabus"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-slate-900/30 backdrop-blur-sm"
        >
          <button>Tutup</button>
        </form>
      </dialog>
    </>
  );
};

export default CreateCourseModal;
