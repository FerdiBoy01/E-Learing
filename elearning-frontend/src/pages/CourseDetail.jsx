import useAuthStore from '../store/authStore';
import CourseDetailStudent from './student/CourseDetailStudent';
import CourseDetailLecturer from './lecturer/CourseDetailLecturer';

const CourseDetail = () => {
  const { user } = useAuthStore();

  // Delegasi komponen berdasarkan Role
  return user?.role === 'LECTURER' ? <CourseDetailLecturer /> : <CourseDetailStudent />;
};

export default CourseDetail;