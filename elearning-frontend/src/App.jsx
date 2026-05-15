import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Import Pages & Layouts
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import MaterialDetail from './pages/student/MaterialDetail';
import Submissions from './pages/Submissions';
import CreateMaterial from './pages/CreateMaterial'; 
import Progress from './pages/Progress';
import ProfileLecturer from './pages/lecturer/ProfileLecturer';
import ProfileStudent from './pages/student/ProfileStudent';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const { user } = useAuthStore();

  // EFEK SAKTI: Ganti tema root HTML secara dinamis!
  useEffect(() => {
    if (user) {
      if (user.role === 'LECTURER') {
        document.documentElement.setAttribute('data-theme', 'corporate'); // Tema Profesional
      } else {
        document.documentElement.setAttribute('data-theme', 'retro'); // Tema dasar untuk Neobrutalism
      }
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          
          {/* ✅ RUTE PROFIL ROLE-BASED LANGSUNG DI RENDER DI SINI */}
          <Route 
            path="profile" 
            element={
              !user ? <Navigate to="/login" replace /> : 
              user.role === 'LECTURER' ? <ProfileLecturer /> : <ProfileStudent />
            } 
          />
          
          <Route path="courses/:courseId/chapters/:chapterId/materials/new" element={<CreateMaterial />} />
          <Route path="materials/:materialId" element={<MaterialDetail />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="progress" element={<Progress />} />

          {/* 🚨 FITUR ANTI-BLANK PUTIH (CATCH-ALL 404) 🚨 */}
          {/* Kalau rute ga ketemu, dia bakal nampilin ini di dalam Dashboard, bukan layar putih! */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h1 className="text-6xl font-black text-rose-500 mb-4">404</h1>
              <h2 className="text-2xl font-bold text-slate-700 mb-2">Waduh, Kesasar Coy!</h2>
              <p className="text-slate-500">Rute atau halaman yang kamu cari nggak ada di sistem.</p>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;