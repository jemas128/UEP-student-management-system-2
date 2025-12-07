import React, { useState } from 'react';
import { User, UserRole, AccountStatus } from '../types';
import { GraduationCap, ArrowRight, Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  onSignup: (user: User) => void;
  users: User[];
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onSignup, users }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isLogin) {
      const user = users.find(u => u.username === formData.username && u.password === formData.password);
      if (user) {
        if (user.status === AccountStatus.PENDING) {
          setError('Your account is still pending administrator approval.');
        } else if (user.status === AccountStatus.REJECTED) {
          setError('Your account has been rejected. Contact administration.');
        } else {
          onLogin(user);
        }
      } else {
        setError('Invalid credentials.');
      }
    } else {
      // Signup Logic
      if (users.find(u => u.username === formData.username)) {
        setError('Username already taken.');
        return;
      }
      
      const newUser: User = {
        id: `u-${Date.now()}`,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        role: UserRole.STUDENT,
        status: AccountStatus.PENDING
      };
      
      onSignup(newUser);
      setSuccessMsg('Account created! Please wait for admin approval before logging in.');
      setIsLogin(true);
      setFormData({ username: '', password: '', fullName: '', email: '' });
    }
  };

  return (
    <div className="min-h-screen bg-maroon-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-maroon-800 p-8 text-center border-b border-maroon-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white p-3 rounded-full mb-4 shadow-lg">
              <GraduationCap className="h-10 w-10 text-maroon-900" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-wide">UEP PORTAL</h1>
            <p className="text-maroon-200 text-sm mt-1 uppercase tracking-widest">Student Management System</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Student Registration'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center">
              <span className="mr-2">●</span> {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg flex items-center">
              <span className="mr-2">●</span> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                 <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-maroon-800 text-white font-bold py-3 rounded-lg hover:bg-maroon-900 transition-colors flex items-center justify-center mt-6 shadow-md"
            >
              {isLogin ? 'Sign In' : 'Submit Application'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccessMsg('');
              }}
              className="text-sm text-maroon-700 hover:text-maroon-900 font-medium hover:underline"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="absolute bottom-4 text-maroon-200 text-xs opacity-60">
        Demo Credentials: admin / admin
      </div>
    </div>
  );
};