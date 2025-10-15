import React, { useState } from 'react';
import { X, User, GraduationCap, Shield } from 'lucide-react';

const CreateUserModal = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    tcIdentityNumber: '',
    role: 1, // Default to Student
    // Student specific
    studentNumber: '',
    courseCode: 'BLM',
    // Teacher specific
    totalQuota: 10
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Kullanıcı oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Yeni Kullanıcı Oluştur</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kullanıcı Türü
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 1 }))}
                className={`p-3 rounded-lg border text-sm font-medium transition-all flex items-center space-x-2 ${
                  formData.role === 1
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <GraduationCap className="h-5 w-5" />
                <span>Öğrenci</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 2 }))}
                className={`p-3 rounded-lg border text-sm font-medium transition-all flex items-center space-x-2 ${
                  formData.role === 2
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="h-5 w-5" />
                <span>Öğretmen</span>
              </button>
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Ad
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Soyad
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="tcIdentityNumber" className="block text-sm font-medium text-gray-700 mb-2">
              TC Kimlik Numarası
            </label>
            <input
              type="text"
              id="tcIdentityNumber"
              name="tcIdentityNumber"
              value={formData.tcIdentityNumber}
              onChange={handleChange}
              required
              maxLength="11"
              pattern="[0-9]{11}"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Student Specific Fields */}
          {formData.role === 1 && (
            <>
              <div>
                <label htmlFor="schoolNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Okul Numarası
                </label>
                <input
                  type="text"
                  id="schoolNumber"
                  name="schoolNumber"
                  value={formData.studentNumber}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Ders Kodu
                </label>
                <select
                  id="courseCode"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BLM">BLM - Türkçe</option>
                  <option value="COM">COM - English</option>
                </select>
              </div>
            </>
          )}

          {/* Teacher Specific Fields */}
          {formData.role === 2 && (
            <div>
              <label htmlFor="totalQuota" className="block text-sm font-medium text-gray-700 mb-2">
                Toplam Kontenjan
              </label>
              <input
                type="number"
                id="totalQuota"
                name="totalQuota"
                value={formData.totalQuota}
                onChange={handleChange}
                min="1"
                max="100"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Bu öğretmenin danışmanlık yapabileceği toplam öğrenci sayısı
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;