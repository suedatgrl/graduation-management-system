import React, { useState } from 'react';
import { X, User, Mail, AlertCircle, Save } from 'lucide-react';

const EditUserModal = ({ user, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    studentNumber: user.studentNumber || '',
    courseCode: user.courseCode || '',
    totalQuota: user.totalQuota || 10,
    sicilNumber: user.sicilNumber || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isStudent = user.role === 1;
  const isTeacher = user.role === 2;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Ad ve Soyad alanları zorunludur.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (isStudent && !formData.studentNumber.trim()) {
      setError('Öğrenci numarası zorunludur.');
      return;
    }

    if (isStudent && !formData.courseCode) {
      setError('Ders kodu seçiniz.');
      return;
    }

    if (isTeacher && (!formData.totalQuota || formData.totalQuota < 1)) {
      setError('Kontenjan en az 1 olmalıdır.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(user.id, formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Kullanıcı güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleText = () => {
    if (isStudent) return 'Öğrenci';
    if (isTeacher) return 'Öğretim Üyesi';
    return 'Admin';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Kullanıcı Düzenle</h3>
              <p className="text-sm text-gray-600 mt-1">
                {getRoleText()} bilgilerini güncelleyin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Role Badge */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-900">Rol:</span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                isStudent ? 'bg-blue-100 text-blue-800' : 
                isTeacher ? 'bg-green-100 text-green-800' : 
                'bg-purple-100 text-purple-800'
              }`}>
                {getRoleText()}
              </span>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soyad *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Student Specific Fields */}
          {isStudent && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Öğrenci Numarası *
                </label>
                <input
                  type="text"
                  name="studentNumber"
                  value={formData.studentNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: 2021123456"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ders Kodu *
                </label>
                <select
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seçiniz</option>
                  <option value="BLM">BLM (Türkçe)</option>
                  <option value="COM">COM (English)</option>
                </select>
              </div>
            </>
          )}

          {/* Teacher Specific Fields */}
          {isTeacher && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Toplam Kontenjan *
              </label>
              <input
                type="number"
                name="totalQuota"
                value={formData.totalQuota}
                onChange={handleChange}
                min="1"
                max="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Öğretim üyesinin alabileceği maksimum öğrenci sayısı (1-50 arası)
              </p>
            </div>
          )}

          {/* TC Identity Number (Optional Update) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sicil No
            </label>
            <input
              type="text"
              name="sicilNumber"
              value={formData.sicilNumber}
              onChange={handleChange}
              maxLength="11"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="11 haneli Sicil numarası"
            />
            <p className="text-xs text-gray-500 mt-1">
              Değiştirmek istemiyorsanız boş bırakabilirsiniz
            </p>
          </div>

          {/* Current Status */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Mevcut Durum:</span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Durumu değiştirmek için işlemler bölümündeki aktif/pasif butonunu kullanın
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Kaydediliyor...' : 'Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;