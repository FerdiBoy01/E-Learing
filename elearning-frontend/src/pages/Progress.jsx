import useAuthStore from '../store/authStore';
import ProgressStudent from './student/ProgressStudent';
import { Navigate } from 'react-router-dom';

const Progress = () => {
  const { user } = useAuthStore();

  // Halaman ini khusus Mahasiswa, kalau Dosen nyasar lempar ke beranda
  return user?.role === 'STUDENT' ? <ProgressStudent /> : <Navigate to="/" />;
};

export default Progress;