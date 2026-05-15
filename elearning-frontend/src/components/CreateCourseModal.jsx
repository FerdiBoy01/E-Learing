import { useState } from 'react';
import { Plus, X, Tag, Sparkles, DollarSign } from 'lucide-react';
import api from '../config/axios';

const CreateCourseModal = ({ onCourseCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // 🔥 STATE BARU UNTUK FITUR FREEMIUM
  const [type, setType] = useState('REGULAR');
  const [price, setPrice] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Pastikan harga 0 jika kelas Regular, jika Project Based parse string ke angka
      const finalPrice = type === 'REGULAR' ? 0 : parseInt(price) || 0;

      await api.post('/courses', { 
        title, 
        description,
        type,
        price: finalPrice
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setType('REGULAR');
      setPrice('');
      
      // Tutup modal
      document.getElementById('modal_create_course').close();
      
      // Beritahu parent component untuk me-refresh data
      onCourseCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tombol Triger Modal (Tetap sama) */}
      <button 
        className="btn btn-primary" 
        onClick={() => document.getElementById('modal_create_course').showModal()}
      >
        <Plus size={20} /> Buat Course
      </button>

      {/* Struktur Modal DaisyUI */}
      <dialog id="modal_create_course" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white rounded-3xl max-w-2xl p-0">
          
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-xl text-slate-800">Buat Mata Kuliah Baru</h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost text-slate-500 hover:bg-rose-50 hover:text-rose-500"><X size={18} /></button>
            </form>
          </div>
          
          <div className="p-6">
            {error && <div className="alert alert-error text-sm py-2 mb-6 font-medium">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-control w-full mb-5">
                <label className="label font-bold text-slate-700"><span className="label-text">Judul Course</span></label>
                <input 
                  type="text" 
                  placeholder="Contoh: Pemrograman Web Lanjut" 
                  className="input input-bordered w-full bg-slate-50 focus:bg-white focus:border-blue-500 rounded-xl" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-control w-full mb-6">
                <label className="label font-bold text-slate-700"><span className="label-text">Deskripsi Singkat</span></label>
                <textarea 
                  className="textarea textarea-bordered h-24 bg-slate-50 focus:bg-white focus:border-blue-500 rounded-xl resize-none" 
                  placeholder="Pelajari cara membangun aplikasi modern..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* 🔥 UI PEMILIHAN MODEL BISNIS (FREEMIUM) */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
                <label className="label font-bold text-slate-800 flex items-center gap-2 mb-3 px-0">
                  <Tag size={18} className="text-blue-500"/> Model Bisnis Kelas
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Opsi Gratis */}
                  <label className={`flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${type === 'REGULAR' ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" name="course_type" value="REGULAR"
                        checked={type === 'REGULAR'} 
                        onChange={(e) => setType(e.target.value)} 
                        className="radio radio-primary radio-sm" 
                      />
                      <span className="font-bold text-slate-800 text-sm">Regular (Gratis)</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-7 leading-relaxed">Belajar materi fundamental secara gratis.</p>
                  </label>

                  {/* Opsi Berbayar */}
                  <label className={`flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${type === 'PROJECT_BASED' ? 'bg-amber-50 border-amber-500 shadow-sm' : 'bg-white border-slate-200 hover:border-amber-300'}`}>
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" name="course_type" value="PROJECT_BASED"
                        checked={type === 'PROJECT_BASED'} 
                        onChange={(e) => setType(e.target.value)} 
                        className="radio radio-warning radio-sm" 
                      />
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                        Project-Based <Sparkles size={14} className="text-amber-500"/>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 pl-7 leading-relaxed">Belajar membuat projek dengan biaya khusus.</p>
                  </label>
                </div>

                {/* Input Harga Khusus Project Based */}
                {type === 'PROJECT_BASED' && (
                  <div className="mt-5 pt-5 border-t border-slate-200/60 animate-fadeIn">
                    <label className="label font-bold text-slate-700 flex items-center gap-2 mb-1 px-0">
                      <DollarSign size={16} className="text-amber-500"/> Harga Kelas (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                      <input 
                        type="number" required min="10000"
                        value={price} onChange={(e) => setPrice(e.target.value)}
                        placeholder="150000" 
                        className="input input-bordered bg-white focus:border-amber-500 rounded-xl font-bold w-full pl-12" 
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-action mt-8 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-ghost rounded-xl font-bold text-slate-500" 
                  onClick={() => document.getElementById('modal_create_course').close()}
                >
                  Batal
                </button>
                <button type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl px-8" disabled={loading}>
                  {loading ? <span className="loading loading-spinner"></span> : 'Simpan Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Area luar modal untuk menutup jika diklik */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default CreateCourseModal;