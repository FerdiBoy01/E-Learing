import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../config/axios';

const DashboardLecturer = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/dashboard/lecturer');
        setStats(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil data statistik", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-blue-600"></span></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800">Overview Akademik</h1>
        <p className="text-slate-500 mt-1">Selamat datang kembali, Dosen {user?.name}. Berikut adalah ringkasan kelas Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat bg-white shadow-sm rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
          <div className="stat-figure text-blue-600"><BookOpen size={36} /></div>
          <div className="stat-title font-medium text-slate-500">Total Mata Kuliah</div>
          <div className="stat-value text-slate-800 mt-2">{stats?.totalCourses || 0}</div>
        </div>
        <div className="stat bg-white shadow-sm rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
          <div className="stat-figure text-emerald-500"><CheckCircle size={36} /></div>
          <div className="stat-title font-medium text-slate-500">Tugas Dinilai</div>
          <div className="stat-value text-slate-800 mt-2">{stats?.gradedSubmissions || 0}</div>
        </div>
        <div className="stat bg-white shadow-sm rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
          <div className="stat-figure text-amber-500"><Clock size={36} /></div>
          <div className="stat-title font-medium text-slate-500">Perlu Dinilai</div>
          <div className="stat-value text-amber-600 mt-2">{stats?.pendingSubmissions || 0}</div>
          <div className="stat-desc mt-1 font-medium text-amber-600">Butuh perhatian segera</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLecturer;