import React, { useState } from 'react';
import { X, Lock, AlertCircle } from 'lucide-react';
import authService from '../services/authService';

const ChangePasswordModal = ({ isOpen, onClose, isRequired = false }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasyonlar
    if (newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('Yeni şifre mevcut şifre ile aynı olamaz.');
      return;
    }

    try {
      setLoading(true);
      
     
      await authService.changePassword(currentPassword, newPassword);

      console.log('✅ Şifre başarıyla değiştirildi');

      
      const updatedUser = await authService.getCurrentUserFromAPI();
      console.log('✅ Updated user from API:', updatedUser);
      
      // localStorage'ı güncelle
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      alert('Şifreniz başarıyla değiştirildi!');
      
      // Modalı kapat
      onClose();
      
      // Sayfayı yenile
      window.location.reload();
    } catch (err) {
      console.error('❌ Şifre değiştirme hatası:', err);
      setError(err.response?.data?.message || 'Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Lock className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {isRequired ? 'Şifre Değiştirme Zorunludur' : 'Şifre Değiştir'}
            </h2>
          </div>
          {!isRequired && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Alert */}
        {isRequired && (
          <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Güvenlik gereği şifrenizi değiştirmeniz gerekmektedir.
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                İlk giriş şifreniz (öğrenci numaranız) ile devam edemezsiniz.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mevcut Şifre
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autoFocus
              placeholder="Öğrenci numaranız"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
              placeholder="En az 6 karakter"
            />
            <p className="text-xs text-gray-500 mt-1">En az 6 karakter olmalıdır</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre (Tekrar)
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Yeni şifrenizi tekrar girin"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;