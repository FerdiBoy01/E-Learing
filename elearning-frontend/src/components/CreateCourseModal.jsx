import { useState, useRef } from 'react';
import { Plus, X, Tag, Sparkles, DollarSign, UploadCloud, Image as ImageIcon, Globe, Lock, KeyRound, BookOpen, Trophy, Coins, Zap } from 'lucide-react';
import api from '../config/axios';
import toast from '../utils/toast';

const CreateCourseModal = ({ onCourseCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('REGULAR');
  const [price, setPrice] = useState('');
  
  const [visibility, setVisibility] = useState('PUBLIC');
  const [accessCode, setAccessCode] = useState('');
  
  // 🔥 STATE BARU UNTUK GAMIFIKASI
  const [rewardPoints, setRewardPoints] = useState(0);
  const [rewardExp, setRewardExp] = useState(500);

  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB!');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setThumbnailUrl(res.data.url);
      toast.success('Gambar berhasil diunggah!');
    } catch (error) {
      toast.error('Gagal mengunggah gambar. Pastikan server API menyala.');
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
      const finalPrice = type === 'REGULAR' ? 0 : parseInt(price) || 0;

      await api.post('/courses', { 
        title, 
        description,
        type,
        price: finalPrice,
        thumbnail_url: thumbnailUrl,
        visibility, 
        access_code: visibility === 'PRIVATE' ? accessCode : undefined,
        // 🔥 KIRIM DATA HADIAH KE BACKEND
        reward_points: parseInt(rewardPoints) || 0,
        reward_exp: parseInt(rewardExp) || 500
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setType('REGULAR');
      setPrice('');
      setVisibility('PUBLIC');
      setAccessCode('');
      setRewardPoints(0);
      setRewardExp(500);
      setThumbnailUrl('');
      
      document.getElementById('modal_create_course').close();
      onCourseCreated();
      toast.success('Kelas berhasil dibuat (Tersimpan sebagai Draft)!');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className="btn bg-slate-900 hover:bg-slate-800 text-white border-none shadow-md rounded-xl px-6 h-12 font-bold transition-transform hover:scale-105" 
        onClick={() => document.getElementById('modal_create_course').showModal()}
      >
        <Plus size={20} strokeWidth={2.5} /> Buat Kelas Baru
      </button>

      <dialog id="modal_create_course" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white rounded-3xl max-w-2xl p-0 overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" /> Setup Kelas Baru
            </h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost text-slate-500 hover:bg-rose-50 hover:text-rose-500"><X size={18} /></button>
            </form>
          </div>
          
          <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {error && <div className="alert alert-error text-sm py-3 mb-6 font-bold rounded-xl">{error}</div>}

            <form onSubmit={handleSubmit}>
              
              {/* AREA UPLOAD GAMBAR */}
              <div className="mb-6">
                <label className="label font-bold text-slate-700 px-0 mb-1"><span className="label-text">Gambar Sampul (Thumbnail)</span></label>
                <div 
                  className={`border-2 border-dashed rounded-2xl text-center cursor-pointer relative overflow-hidden transition-all ${thumbnailUrl ? 'border-slate-900' : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'} ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => !uploadingImage && fileInputRef.current.click()}
                >
                  {thumbnailUrl ? (
                    <div className="relative h-48 w-full group">
                      <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <ImageIcon className="text-white mb-2" size={32} />
                        <span className="text-sm text-white font-bold">Klik untuk Ganti Gambar</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 flex flex-col items-center">
                      {uploadingImage ? (
                        <span className="loading loading-spinner text-slate-800 mb-3"></span>
                      ) : (
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                          <UploadCloud size={28} className="text-slate-500" />
                        </div>
                      )}
                      <p className="text-sm font-bold text-slate-700">{uploadingImage ? 'Mengunggah...' : 'Klik untuk upload gambar'}</p>
                      <p className="text-xs text-slate-400 mt-1 font-medium">Saran: Rasio 16:9, Maksimal 2MB</p>
                    </div>
                  )}
                </div>
                <input 
                  type="file" accept="image/*" className="hidden" 
                  ref={fileInputRef} onChange={handleImageUpload}
                />
              </div>

              {/* INFO DASAR */}
              <div className="form-control w-full mb-5">
                <label className="label font-bold text-slate-700 px-0"><span className="label-text">Judul Kelas</span></label>
                <input 
                  type="text" 
                  placeholder="Contoh: Masterclass Fullstack Web Dev 2026" 
                  className="input input-bordered w-full bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-medium" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-control w-full mb-8">
                <label className="label font-bold text-slate-700 px-0"><span className="label-text">Deskripsi Singkat</span></label>
                <textarea 
                  className="textarea textarea-bordered h-24 bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl resize-none font-medium" 
                  placeholder="Ceritakan apa yang akan dipelajari siswa di kelas ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* 🔥 PENGATURAN GAMIFIKASI & HADIAH */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50/30 p-5 rounded-2xl border border-amber-200 mb-6">
                <label className="label font-black text-amber-900 flex items-center gap-2 mb-2 px-0">
                  <Trophy size={18} className="text-amber-500"/> Hadiah Kelulusan Kelas
                </label>
                <p className="text-xs text-amber-700/80 mb-4 font-medium leading-relaxed">Tentukan jumlah Poin dan EXP yang akan didapatkan mahasiswa setelah menyelesaikan 100% materi di kelas ini.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label text-[10px] font-black uppercase tracking-widest text-amber-800 px-0 mb-1 flex items-center gap-1.5">
                      <Coins size={14} className="text-amber-500" /> Nusa Points
                    </label>
                    <input 
                      type="number" min="0" value={rewardPoints} onChange={(e) => setRewardPoints(e.target.value)}
                      placeholder="0" className="input input-bordered w-full bg-white border-amber-200 focus:border-amber-500 rounded-xl font-bold text-slate-800" 
                    />
                  </div>
                  <div>
                    <label className="label text-[10px] font-black uppercase tracking-widest text-amber-800 px-0 mb-1 flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-500" /> Bonus EXP
                    </label>
                    <input 
                      type="number" min="100" value={rewardExp} onChange={(e) => setRewardExp(e.target.value)}
                      placeholder="500" className="input input-bordered w-full bg-white border-amber-200 focus:border-amber-500 rounded-xl font-bold text-slate-800" 
                    />
                  </div>
                </div>
              </div>

              {/* MODEL BISNIS (GRATIS / PREMIUM) */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 mb-6">
                <label className="label font-bold text-slate-800 flex items-center gap-2 mb-3 px-0">
                  <Tag size={18} className="text-slate-500"/> Model Bisnis Kelas
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${type === 'REGULAR' ? 'bg-white border-slate-800 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" name="course_type" value="REGULAR"
                        checked={type === 'REGULAR'} 
                        onChange={(e) => setType(e.target.value)} 
                        className="radio radio-neutral radio-sm" 
                      />
                      <span className="font-bold text-slate-800 text-sm">Regular (Gratis)</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-7 leading-relaxed font-medium">Materi terbuka untuk semua pendaftar.</p>
                  </label>

                  <label className={`flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${type === 'PROJECT_BASED' ? 'bg-amber-50 border-amber-500 shadow-md' : 'bg-white border-slate-200 hover:border-amber-300'}`}>
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" name="course_type" value="PROJECT_BASED"
                        checked={type === 'PROJECT_BASED'} 
                        onChange={(e) => setType(e.target.value)} 
                        className="radio radio-warning radio-sm" 
                      />
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                        Premium / Project-Based <Sparkles size={14} className="text-amber-500"/>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 pl-7 leading-relaxed font-medium">Kelas berbayar eksklusif.</p>
                  </label>
                </div>

                {type === 'PROJECT_BASED' && (
                  <div className="mt-5 pt-5 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <label className="label font-bold text-slate-700 flex items-center gap-2 mb-1 px-0">
                      <DollarSign size={16} className="text-amber-500"/> Harga Kelas (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                      <input 
                        type="number" required min="10000"
                        value={price} onChange={(e) => setPrice(e.target.value)}
                        placeholder="150000" 
                        className="input input-bordered bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 rounded-xl font-black text-slate-800 w-full pl-12 text-lg" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* VISIBILITAS KELAS (PUBLIK / PRIVAT) */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 mb-2">
                <label className="label font-bold text-slate-800 flex items-center gap-2 mb-3 px-0">
                  <Globe size={18} className="text-slate-500"/> Visibilitas Kelas
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${visibility === 'PUBLIC' ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" name="visibility_type" value="PUBLIC"
                        checked={visibility === 'PUBLIC'} 
                        onChange={(e) => setVisibility(e.target.value)} 
                        className="radio radio-primary radio-sm" 
                      />
                      <span className="font-bold text-slate-800 text-sm">Katalog Publik</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-7 leading-relaxed font-medium">Bisa dicari dan dilihat semua orang.</p>
                  </label>

                  <label className={`flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${visibility === 'PRIVATE' ? 'bg-rose-50 border-rose-500 shadow-md' : 'bg-white border-slate-200 hover:border-rose-300'}`}>
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" name="visibility_type" value="PRIVATE"
                        checked={visibility === 'PRIVATE'} 
                        onChange={(e) => setVisibility(e.target.value)} 
                        className="radio radio-error radio-sm" 
                      />
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                        Sembunyi / Privat <Lock size={14} className="text-rose-500"/>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 pl-7 leading-relaxed font-medium">Butuh kode akses untuk mendaftar.</p>
                  </label>
                </div>

                {visibility === 'PRIVATE' && (
                  <div className="mt-5 pt-5 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <label className="label font-bold text-slate-700 flex items-center justify-between mb-1 px-0">
                      <span className="flex items-center gap-2"><KeyRound size={16} className="text-rose-500"/> Kode Akses Khusus</span>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase">Opsional</span>
                    </label>
                    <input 
                      type="text" 
                      value={accessCode} onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Contoh: KELAS-TI-A (Kosongkan untuk otomatis)" 
                      className="input input-bordered bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 rounded-xl font-bold text-slate-800 w-full" 
                    />
                    <p className="text-xs text-slate-500 mt-2 font-medium">Jika dikosongkan, sistem akan meng-generate kode acak (6 karakter) untuk Anda.</p>
                  </div>
                )}
              </div>

              <div className="modal-action mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  className="btn btn-ghost rounded-xl font-bold text-slate-500 hover:bg-slate-100" 
                  onClick={() => document.getElementById('modal_create_course').close()}
                >
                  Batal
                </button>
                <button type="submit" className="btn bg-slate-900 hover:bg-slate-800 text-white border-none rounded-xl px-8 shadow-md" disabled={loading || uploadingImage}>
                  {loading ? <span className="loading loading-spinner"></span> : 'Simpan Draft Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop bg-slate-900/40 backdrop-blur-sm">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default CreateCourseModal;