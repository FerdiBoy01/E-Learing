import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Target, Award, Clock, CheckCircle, 
  MessageSquare, Map, Flag, Sparkles, ChevronRight, Activity
} from 'lucide-react';
import api from '../../config/axios';
import useAuthStore from '../../store/authStore';

const ProgressStudent = () => {
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.get('/submissions/student');
        const data = response.data.data;
        setSubmissions(data.submissions || data || []);
      } catch (error) {
        console.error("Gagal mengambil riwayat progress", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center">
      <span className="loading loading-spinner loading-lg text-blue-600"></span>
      <p className="mt-4 text-slate-500 font-medium">Lagi nggambar peta perjalanan lo...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto font-sans pb-20 pt-2 px-4 relative">
      
      {/* 🔥 Header Section (Modern Clean) */}
      <div className="relative mb-12 p-8 md:p-12 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-60"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-blue-100">
              <Map size={14} /> Learning Roadmap
            </div>
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Pencapaian Lo 🏆</h1>
            <p className="text-slate-500 mt-2 font-medium max-w-md">
              Lihat riwayat "pembantaian" tugas dan feedback dari dosen di sepanjang perjalanan belajarmu.
            </p>
          </div>

          {/* Stats Ringkas */}
          <div className="flex gap-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center min-w-[100px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Level</p>
              <p className="text-2xl font-black text-slate-800">1</p>
            </div>
            <div className="bg-blue-600 border border-blue-500 p-4 rounded-2xl text-center min-w-[100px] shadow-lg shadow-blue-200">
              <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Total EXP</p>
              <p className="text-2xl font-black text-white">{user?.exp || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white border border-slate-200 p-16 rounded-[2.5rem] text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target size={40} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Belum Ada Jejak Langkah</h2>
          <p className="text-slate-500 font-medium mb-8">Lo belum ngumpulin tugas apapun di kelas mana pun. Ayo mulai satu hari ini!</p>
          <Link to="/courses" className="btn bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl px-8">Cari Kelas</Link>
        </div>
      ) : (
        <div className="relative">
          
          {/* 🔥 Garis Roadmap (Vertical Line) */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 -translate-x-1/2 hidden md:block"></div>
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-slate-200 md:hidden"></div>

          {/* List Milestone */}
          <div className="space-y-12">
            {submissions.map((sub, idx) => {
              const isEven = idx % 2 === 0;
              const isGraded = sub.status === 'GRADED';

              return (
                <div key={sub.id} className={`relative flex flex-col md:flex-row items-start md:items-center ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Indicator Dot (Milestone Point) */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-white shadow-md z-20 flex items-center justify-center bg-white transition-transform hover:scale-110">
                    {isGraded ? <Flag size={18} className="text-blue-600" /> : <Clock size={18} className="text-amber-500" />}
                  </div>

                  {/* Card Konten */}
                  <div className={`w-full md:w-[45%] ml-16 md:ml-0 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group relative">
                      
                      {/* Label Indikator */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-tighter border border-blue-100">
                          Milestone #{submissions.length - idx}
                        </span>
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${isGraded ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {isGraded ? <CheckCircle size={14} /> : <Clock size={14} />}
                          {sub.status}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {sub.material?.title || 'Challenge'}
                      </h3>
                      
                      {/* Skor area */}
                      {isGraded && (
                        <div className="flex items-center gap-3 mt-4 mb-4">
                          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex flex-col items-center justify-center min-w-[70px] shadow-lg shadow-slate-900/10">
                            <span className="text-[9px] font-black uppercase opacity-60">Skor</span>
                            <span className="text-xl font-black">{sub.score}</span>
                          </div>
                          {sub.score >= 80 && (
                            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs uppercase tracking-tight">
                              <Award size={16} /> Outstanding Kerja Bagus!
                            </div>
                          )}
                        </div>
                      )}

                      {/* Feedback Dosen */}
                      {sub.feedback && (
                        <div className="mt-4 bg-slate-50 border border-slate-100 p-4 rounded-xl relative">
                           <MessageSquare size={16} className="text-blue-400 absolute top-2 right-2 opacity-50" />
                           <p className="text-sm italic font-medium text-slate-600 leading-relaxed">
                            "{sub.feedback}"
                           </p>
                        </div>
                      )}

                      {/* Tautan ke materi */}
                      <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Activity size={12} /> {new Date(sub.submitted_at).toLocaleDateString()}
                        </span>
                        <Link to={`/materials/${sub.material_id}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                          <ChevronRight size={20} />
                        </Link>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}

            {/* 🔥 Start Point */}
            <div className="relative flex justify-center">
              <div className="bg-slate-900 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl relative z-10">
                Awal Perjuangan 🚀
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background Decor */}
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
    </div>
  );
};

export default ProgressStudent;