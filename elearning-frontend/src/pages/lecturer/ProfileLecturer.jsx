import { useEffect, useState, useRef } from 'react';
import { Save, User, Briefcase, FileText, CheckCircle, Camera } from 'lucide-react';
import api from '../../config/axios';
import useAuthStore from '../../store/authStore';
import toast from '../../utils/toast';

const ProfileLecturer = () => {
  // 🔥 AMBIL ZUSTAND UNTUK UPDATE GLOBAL STATE
  const { user, setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    bio: '',
    avatar_url: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        // Sesuaikan struktur response (biasanya data.data.user)
        const userData = res.data.data.user || res.data.data; 
        
        setFormData({
          name: userData.name || '',
          profession: userData.profession || '',
          bio: userData.bio || '',
          avatar_url: userData.avatar_url || ''
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

  // 🔥 FUNGSI SAKTI UNTUK UPLOAD GAMBAR
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Cek ukuran maksimal 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 2MB");
      return;
    }

    const uploadData = new FormData();
    // Gunakan nama field yang sama dengan backend (disamakan dengan student: 'avatar')
    uploadData.append('avatar', file); 

    try {
      setUploadingImage(true);
      // Samakan endpoint dengan milik student
      const res = await api.post('/users/upload-avatar', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updatedUser = res.data.data.user;
      
      // Update state form & global state Zustand
      setFormData({ ...formData, avatar_url: updatedUser.avatar_url });
      setUser(updatedUser); 
      toast.success("Foto profil berhasil diperbarui!");
    } catch (error) {
      toast.error('Gagal mengunggah foto. Pastikan server menyala.');
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await api.put('/users/profile', formData);
      
      // Update global state agar Navbar langsung berubah
      if (res.data.data && res.data.data.user) {
        setUser(res.data.data.user);
      }
      
      setSuccessMsg('Profil berhasil diperbarui!');
      toast.success('Profil berhasil disimpan!');
      setTimeout(() => setSuccessMsg(''), 3000); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-[70vh] flex justify-center items-center">
      <span className="loading loading-spinner loading-lg text-blue-600"></span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-8 px-4 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Profil Instruktur</h1>
        <p className="text-slate-500 mt-2 text-lg">Lengkapi profil Anda agar mahasiswa dapat mengenal Anda lebih baik.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-xl mb-6 flex items-center gap-3 font-semibold animate-fadeIn shadow-sm">
          <CheckCircle size={20} className="text-emerald-500" /> {successMsg}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-8 sm:p-10 flex flex-col md:flex-row gap-12">
          
          {/* FOTO PROFIL INTERAKTIF */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div 
              onClick={() => fileInputRef.current.click()}
              className="w-40 h-40 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden relative group cursor-pointer transition-transform hover:scale-105"
            >
              {uploadingImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/10">
                  <span className="loading loading-spinner text-blue-600"></span>
                </div>
              ) : (
                <>
                  <img 
                    src={formData.avatar_url || `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=0D8ABC&color=fff&size=200`} 
                    alt="Avatar Preview" 
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay kamera pas di-hover */}
                  <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={32} className="text-white mb-1" />
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Ubah Foto</span>
                  </div>
                </>
              )}
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">
              Foto Profil <br/> <span className="text-xs text-slate-400 font-medium normal-case">(Klik untuk mengubah)</span>
            </span>
            
            {/* Input file yang disembunyikan */}
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageUpload} 
            />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="flex-1 space-y-6">
            <div className="form-control">
              <label className="label font-bold text-slate-700 flex items-center gap-2"><User size={16} className="text-blue-500"/> Nama Lengkap</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input input-bordered bg-slate-50 focus:bg-white focus:border-blue-500 rounded-xl font-medium" required />
            </div>

            <div className="form-control">
              <label className="label font-bold text-slate-700 flex items-center gap-2"><Briefcase size={16} className="text-blue-500"/> Gelar / Profesi Singkat</label>
              <input type="text" name="profession" value={formData.profession} onChange={handleChange} placeholder="Contoh: Senior Web Developer di Tokopedia" className="input input-bordered bg-slate-50 focus:bg-white focus:border-blue-500 rounded-xl font-medium" />
            </div>

            <div className="form-control hidden">
              {/* URL input kita sembunyikan, biarkan backend yang ngisi dari hasil upload */}
              <input type="text" name="avatar_url" value={formData.avatar_url} readOnly />
            </div>

            <div className="form-control">
              <label className="label font-bold text-slate-700 flex items-center gap-2"><FileText size={16} className="text-blue-500"/> Tentang Saya (Bio)</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Ceritakan singkat tentang pengalaman dan latar belakang Anda..." className="textarea textarea-bordered bg-slate-50 focus:bg-white focus:border-blue-500 rounded-xl h-32 leading-relaxed text-base resize-none"></textarea>
            </div>

            <div className="pt-6 flex justify-end border-t border-slate-100">
              <button type="submit" disabled={saving || uploadingImage} className="btn bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl px-10 shadow-md">
                {saving ? <span className="loading loading-spinner"></span> : <><Save size={18} /> Simpan Profil</>}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ProfileLecturer;