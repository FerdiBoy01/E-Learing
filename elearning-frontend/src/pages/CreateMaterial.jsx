import useAuthStore from '../store/authStore';
import CreateMaterialLecturer from './lecturer/CreateMaterialLecturer';
import { Navigate } from 'react-router-dom';

const CreateMaterial = () => {
  const { user } = useAuthStore();

  // Jika bukan dosen, tendang balik ke beranda
  return user?.role === 'LECTURER' ? <CreateMaterialLecturer /> : <Navigate to="/" />;
};

export default CreateMaterial;