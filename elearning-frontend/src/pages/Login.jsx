import { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    const isSuccess = await login(email, password);
    if (isSuccess) {
      window.location.href = '/'; // Arahkan ke dashboard jika sukses
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-primary">NusantaraLearn</h2>
            <p className="text-base-content/70 mt-2">Masuk ke akun e-learning Anda</p>
          </div>

          {error && (
            <div className="alert alert-error text-sm rounded-lg py-3 mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Input Email */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/50" />
                </div>
                <input
                  type="email"
                  placeholder="ferdi@student.kampus.ac.id"
                  className="input input-bordered w-full pl-10 focus:input-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/50" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10 focus:input-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Tombol Login */}
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="divider text-sm">ATAU</div>

          <p className="text-center text-sm">
            Belum punya akun?{' '}
            <a href="/register" className="text-primary font-semibold hover:underline">
              Hubungi Admin Kampus
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;