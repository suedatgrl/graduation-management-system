import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);
      
      // Backend'den gelen kullanıcı rolüne göre yönlendirme
      if (response.user.role === 1) { // Student
        navigate('/dashboard');
      } else if (response.user.role === 2) { // Teacher
        navigate('/dashboard');
      } else if (response.user.role === 3) { // Admin
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Kullanıcı adı alanı için dinamik bilgi
  const getUsernameInfo = () => {
    const isEmail = formData.username.includes('@');
    const isNumeric = /^\d+$/.test(formData.username);

    if (isEmail) {
      return {
        label: 'E-mail',
        placeholder: 'E-mail adresinizi girin',
        icon: Mail,
        helpText: 'E-mail adresiniz ile giriş yapıyorsunuz'
      };
    } else if (isNumeric && formData.username.length > 0) {
      return {
        label: 'Öğrenci Numarası',
        placeholder: 'Öğrenci numaranızı girin',
        icon: User,
        helpText: 'Öğrenci numaranız ile giriş yapıyorsunuz'
      };
    }

    return {
      label: 'E-mail / Öğrenci Numarası',
      placeholder: 'E-mail adresiniz veya öğrenci numaranız',
      icon: User,
      helpText: ''
    };
  };

  const usernameInfo = getUsernameInfo();
  const IconComponent = usernameInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bitirme Projeleri Yönetim Sistemi
            </h2>
            <p className="text-gray-600 mb-8">Hesabınıza giriş yapın</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Kullanıcı Adı/E-mail Alanı */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {usernameInfo.label}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconComponent className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={usernameInfo.placeholder}
                />
              </div>
              {usernameInfo.helpText && (
                <p className="mt-1 text-xs text-blue-600">{usernameInfo.helpText}</p>
              )}
              
            </div>

            {/* Şifre Alanı */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Şifrenizi girin"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Giriş Yap'
              )}
            </button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Şifremi Unuttum
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;