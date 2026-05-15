import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  User, Mail, IdCard, ShieldCheck, 
  Award, Zap, Camera, Edit3, Save, X, Sparkles, Trophy, Briefcase, FileText, AlertCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../config/axios';
import toast from '../../utils/toast';

const ProfileStudent = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // 🔥 STATE UNTUK FORM
  const [formData, setFormData] = useState({
    name: '',
    nim_nip: '',
    profession: '',
    bio: '',
    avatar_url: ''
  });

  const [imagePreview, setImagePreview] = useState('');

  // 🔥 FETCH DATA TERBARU SAAT HALAMAN DIBUKA
  const fetchLatestProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      const userData = response.data.data.user;
      
      const mappedData = {
        name: userData.name || '',
        nim_nip: userData.nim_nip || '',
        profession: userData.profession || '',
        bio: userData.bio || '',
        avatar_url: userData.avatar_url || ''
      };

      setFormData(mappedData);
      if (userData.avatar_url) setImagePreview(userData.avatar_url);
      
      setUser(userData);
    } catch (error) {
      console.error("Gagal ambil data profil", error);
      toast.error('Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  // ✅ PERBAIKAN: Gunakan dependency array kosong agar fetch hanya dipanggil 1x
  useEffect(() => {
    fetchLatestProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔥 VALIDASI FORM
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Nama tidak boleh kosong';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nama minimal 3 karakter';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio maksimal 500 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 HANDLE IMAGE UPLOAD
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Gunakan format JPG, PNG, atau WebP');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
      setIsSubmitting(true);
      const response = await api.post('/users/upload-avatar', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedUser = response.data.data.user;
      setFormData(prev => ({ ...prev, avatar_url: updatedUser.avatar_url }));
      setUser(updatedUser);
      toast.success('Foto profil diperbarui');
    } catch (error) {
      toast.error('Gagal upload foto profil');
      setImagePreview(formData.avatar_url);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 HANDLE SIMPAN DATA
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Periksa kembali inputan lo');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.put('/users/profile', formData);
      setUser(response.data.data.user);
      setIsEditing(false);
      toast.success('Profil berhasil diperbarui! 🎉');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 HANDLE CANCEL EDIT (Balikin data ke state user terakhir)
  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setFormData({
      name: user?.name || '',
      nim_nip: user?.nim_nip || '',
      profession: user?.profession || '',
      bio: user?.bio || '',
      avatar_url: user?.avatar_url || ''
    });
    setImagePreview(user?.avatar_url || '');
  };

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center">
      <span className="loading loading-spinner loading-lg text-blue-600"></span>
      <p className="mt-4 text-slate-500 font-bold animate-pulse">Menyiapkan profil lo...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto font-sans pb-24 pt-2 px-4 relative">
      
      {/* HEADER COVER */}
      <div className="relative mb-8">
        <div className="h-48 md:h-64 w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        </div>

        {/* AVATAR & INFO RINGKAS */}
        <div className="absolute -bottom-16 left-4 md:left-12 flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-8 border-white bg-slate-100 overflow-hidden shadow-xl relative z-10">
              {imagePreview ? (
                <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                  <User size={64} />
                </div>
              )}
            </div>

            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="absolute bottom-2 right-2 z-20 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-2xl shadow-lg transition-all active:scale-90"
                title="Ganti Foto"
              >
                <Camera size={18} />
              </button>
            )}
            <input
              ref={fileInputRef} type="file" accept="image/*"
              onChange={handleImageChange} className="hidden"
            />
          </div>

          <div className="flex-1 pb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              {formData.name || 'User'} 
              <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-md font-black uppercase border border-blue-200">
                {user?.role}
              </span>
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-base">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* STATS AREA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-xs tracking-wider mb-6">
              <Zap size={16} className="text-amber-500 fill-amber-500" /> Pencapaian
            </h3>
            <div className="mb-2 flex justify-between items-end">
              <span className="text-3xl font-black text-slate-800">{user?.exp || 0}</span>
              <span className="text-sm font-bold text-slate-400 uppercase">EXP</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((user?.exp || 0) / 1000 * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest leading-relaxed">
              Dapatkan EXP dengan menyelesaikan materi dan kuis.
            </p>
          </div>
        </div>

        {/* FORM DETAIL */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-bold text-slate-800 text-lg">Informasi Profil</h3>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn btn-sm bg-white border border-slate-200 text-slate-600 rounded-xl px-4 hover:bg-slate-50 hover:border-blue-300 transition-all font-bold"
                >
                  <Edit3 size={14} className="mr-1" /> Edit Profil
                </button>
              )}
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Field Nama */}
                <div className="form-control">
                  <label className="label mb-2 font-bold text-slate-600 text-xs uppercase tracking-widest">Nama Lengkap</label>
                  <input 
                    type="text" value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing}
                    className={`input w-full bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-medium ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12}/> {errors.name}</p>}
                </div>

                {/* Field NIM */}
                <div className="form-control">
                  <label className="label mb-2 font-bold text-slate-600 text-xs uppercase tracking-widest">NIM / ID Mahasiswa</label>
                  <input 
                    type="text" value={formData.nim_nip}
                    onChange={(e) => setFormData({...formData, nim_nip: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Contoh: 2024001"
                    className="input w-full bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>

                {/* Field Profesi */}
                <div className="form-control md:col-span-2">
                  <label className="label mb-2 font-bold text-slate-600 text-xs uppercase tracking-widest">Pekerjaan / Bidang Fokus</label>
                  <input 
                    type="text" value={formData.profession}
                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Contoh: Web Developer, UI/UX Designer"
                    className="input w-full bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>

                {/* Field Bio */}
                <div className="form-control md:col-span-2">
                  <label className="label mb-2 font-bold text-slate-600 text-xs uppercase tracking-widest">Bio Singkat</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    disabled={!isEditing}
                    rows="4"
                    className="textarea w-full bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-medium resize-none"
                    placeholder="Kenalin diri lo ke dunia..."
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formData.bio.length} / 500 Karakter</p>
                    {errors.bio && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.bio}</p>}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="btn btn-ghost rounded-2xl px-6 text-slate-500 font-bold hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white border-none rounded-2xl px-8 h-12 font-bold shadow-lg shadow-blue-200 flex items-center gap-2"
                  >
                    {isSubmitting ? <span className="loading loading-spinner"></span> : <Save size={18} />}
                    Simpan Perubahan
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