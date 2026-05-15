import useAuthStore from '../store/authStore';
import LecturerLayout from './lecturer/LecturerLayout';
import StudentLayout from './student/StudentLayout';

const DashboardLayout = () => {
  const { user } = useAuthStore();

  // Delegasi layout berdasarkan Role
  return user?.role === 'LECTURER' ? <LecturerLayout /> : <StudentLayout />;
};

export default DashboardLayout;