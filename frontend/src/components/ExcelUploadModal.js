import React, { useState } from 'react';
import { X, Save, User, GraduationCap } from 'lucide-react';

const CreateUserModal = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    role: 1, // Default to student
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    studentNumber: '',
    courseCode: '',
    tcIdentityNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Ad ve soyad gereklidir');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email adresi gereklidir');
      setLoading(false);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setLoading(false);
      return;
    }

    if (formData.role === 1) { // Student validation
      if (!formData.studentNumber.trim()) {
        setError('Öğrenci numarası gereklidir');
        setLoading(false);
        return;
      }
      if (!formData.courseCode) {
        setError('Kurs kodu seçmelisiniz');
        setLoading(false);
        return;
      }
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Kullanıcı oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const courseCodes = [
    { value: 'BLM101', label: 'BLM101 - Araştırma Teknikleri' },
    { value: 'COM101', label: 'COM101 - Research Techniques' },

  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Yeni Kullanıcı Oluştur
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Rolü *
            </label>
            <div className="grid grid-cols-2 gap-3">
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

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Ad *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ad"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Soyad *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Soyad"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="En az 6 karakter"
            />
          </div>

          {/* Student specific fields */}
          {formData.role === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Öğrenci Numarası *
                  </label>
                  <input
                    type="text"
                    id="studentNumber"
                    name="studentNumber"
                    required
                    value={formData.studentNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345678"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Kurs Kodu *
                </label>
                <select
                  id="courseCode"
                  name="courseCode"
                  required
                  value={formData.courseCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kurs kodu seçin</option>
                  <optgroup label="Türkçe Kurslar (BLM)">
                    {courseCodes.filter(code => code.value.startsWith('BLM')).map(code => (
                      <option key={code.value} value={code.value}>
                        {code.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="English Courses (COM)">
                    {courseCodes.filter(code => code.value.startsWith('COM')).map(code => (
                      <option key={code.value} value={code.value}>
                        {code.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </>
          )}

          <div>
            <label htmlFor="tcIdentityNumber" className="block text-sm font-medium text-gray-700 mb-1">
              TC Kimlik Numarası
            </label>
            <input
              type="text"
              id="tcIdentityNumber"
              name="tcIdentityNumber"
              value={formData.tcIdentityNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="12345678901"
              maxLength="11"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Kullanıcı Oluştur</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;