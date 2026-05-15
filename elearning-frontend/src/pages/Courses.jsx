import useAuthStore from '../store/authStore';
import CoursesLecturer from './lecturer/CoursesLecturer';
import CoursesStudent from './student/CoursesStudent';

const Courses = () => {
  const { user } = useAuthStore();

  return user?.role === 'LECTURER' ? <CoursesLecturer /> : <CoursesStudent />;
};

export default Courses;