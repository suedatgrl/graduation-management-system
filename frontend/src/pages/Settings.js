import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const { user, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır' });
      setLoading(false);
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Şifre değiştirme işleminde bir hata oluştu' 
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getRoleText = (role) => {
    switch (role) {
      case 1: return 'Öğrenci';
      case 2: return 'Öğretmen';
      case 3: return 'Admin';
      default: return 'Bilinmeyen';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-600 mt-1">Hesap bilgilerinizi ve şifrenizi yönetin</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profil Bilgileri</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Şifre Değiştir</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad
                  </label>
                  <input
                    type="text"
                    value={user?.firstName || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad
                  </label>
                  <input
                    type="text"
                    value={user?.lastName || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <input
                    type="text"
                    value={getRoleText(user?.role)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                {user?.role === 1 && user?.studentNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Öğrenci Numarası
                    </label>
                    <input
                      type="text"
                      value={user.studentNumber}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                )}

                {user?.courseCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {user.role === 1 ? 'Kurs Kodu' : 'Departman'}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={user.courseCode}
                        disabled
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        user.courseCode?.startsWith('BLM') ? 'course-blm' : 'course-com'
                      }`}>
                        {user.courseCode?.startsWith('BLM') ? 'Türkçe' : 'English'}
                      </span>
                    </div>
                  </div>
                )}

                {user?.tcIdentityNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TC Kimlik Numarası
                    </label>
                    <input
                      type="text"
                      value={user.tcIdentityNumber}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 text-sm">
                  <strong>Not:</strong> Profil bilgilerinizi değiştirmek için sistem yöneticisi ile iletişime geçin.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="max-w-md">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Mevcut Şifre
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      required
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mevcut şifrenizi girin"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      required
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Yeni şifrenizi girin"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre Tekrar
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      required
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Yeni şifrenizi tekrar girin"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {message.text && (
                  <div className={`p-4 rounded-lg ${
                    message.type === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">
                    <strong>Şifre gereksinimleri:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                    <li>En az 6 karakter uzunluğunda olmalıdır</li>
                    <li>Güvenlik için karmaşık bir şifre seçin</li>
                    <li>Başkalarının tahmin edemeyeceği bir şifre kullanın</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Şifreyi Değiştir</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;