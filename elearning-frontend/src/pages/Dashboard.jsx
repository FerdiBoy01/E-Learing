import useAuthStore from '../store/authStore';
import DashboardStudent from './student/DashboardStudent';
import DashboardLecturer from './lecturer/DashboardLecturer';

const Dashboard = () => {
  const { user } = useAuthStore();

  // Delegasi komponen berdasarkan Role
  return user?.role === 'LECTURER' ? <DashboardLecturer /> : <DashboardStudent />;
};

export default Dashboard;