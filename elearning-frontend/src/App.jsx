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
import EditMaterialLecturer from './pages/lecturer/EditMaterialLecturer'; // 🔥 IMPORT BARU
import Progress from './pages/Progress';
import ProfileLecturer from './pages/lecturer/ProfileLecturer';
import ProfileStudent from './pages/student/ProfileStudent';
import TransactionsLecturer from './pages/lecturer/TransactionsLecturer';

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
      // 🔥 UPDATE: Support untuk CREATOR dan ADMIN juga
      if (['LECTURER', 'CREATOR', 'ADMIN'].includes(user.role)) {
        document.documentElement.setAttribute('data-theme', 'corporate'); // Tema Profesional
      } else {
        document.documentElement.setAttribute('data-theme', 'retro'); // Tema Mahasiswa
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
          <Route path="transactions" element={
            ['LECTURER', 'CREATOR', 'ADMIN'].includes(user?.role) ? <TransactionsLecturer /> : <Navigate to="/" replace />
          } />
          
          <Route 
            path="profile" 
            element={
              !user ? <Navigate to="/login" replace /> : 
              ['LECTURER', 'CREATOR', 'ADMIN'].includes(user.role) ? <ProfileLecturer /> : <ProfileStudent />
            } 
          />
          
          <Route path="courses/:courseId/chapters/:chapterId/materials/new" element={<CreateMaterial />} />
          
          {/* 🔥 RUTE BARU UNTUK EDIT MATERI (TEXT EDITOR) */}
          <Route path="courses/:courseId/chapters/:chapterId/materials/:materialId/edit" element={<EditMaterialLecturer />} />
          
          <Route path="materials/:materialId" element={<MaterialDetail />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="progress" element={<Progress />} />

          {/* 🚨 FITUR ANTI-BLANK PUTIH (CATCH-ALL 404) 🚨 */}
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