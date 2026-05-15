import useAuthStore from '../store/authStore';
import SubmissionsLecturer from './lecturer/SubmissionsLecturer';
import { Navigate } from 'react-router-dom';

const Submissions = () => {
  const { user } = useAuthStore();

  // Karena ini khusus Dosen, kalau mahasiswa yang buka, langsung tendang ke Home/Katalog
  return user?.role === 'LECTURER' ? <SubmissionsLecturer /> : <Navigate to="/" />;
};

export default Submissions;