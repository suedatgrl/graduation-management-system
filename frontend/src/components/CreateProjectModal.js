import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const CreateProjectModal = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    keywords: '',
    maxStudents: 1,
    courseCode: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Proje başlığı gereklidir');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Proje açıklaması gereklidir');
      setLoading(false);
      return;
    }

    if (!formData.courseCode) {
      setError('Kurs kodu seçmelisiniz');
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Proje oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const courseCodes = [
    { value: 'BLM101', label: 'BLM101 - Bilgisayar Programlama I' },
    { value: 'BLM102', label: 'BLM102 - Bilgisayar Programlama II' },
    { value: 'BLM201', label: 'BLM201 - Veri Yapıları' },
    { value: 'BLM202', label: 'BLM202 - Algoritma Analizi' },
    { value: 'BLM301', label: 'BLM301 - Veritabanı Yönetimi' },
    { value: 'BLM302', label: 'BLM302 - Web Programlama' },
    { value: 'BLM401', label: 'BLM401 - Yazılım Mühendisliği' },
    { value: 'BLM402', label: 'BLM402 - Mezuniyet Projesi' },
    { value: 'COM101', label: 'COM101 - Computer Programming I' },
    { value: 'COM102', label: 'COM102 - Computer Programming II' },
    { value: 'COM201', label: 'COM201 - Data Structures' },
    { value: 'COM202', label: 'COM202 - Algorithm Analysis' },
    { value: 'COM301', label: 'COM301 - Database Management' },
    { value: 'COM302', label: 'COM302 - Web Programming' },
    { value: 'COM401', label: 'COM401 - Software Engineering' },
    { value: 'COM402', label: 'COM402 - Graduation Project' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Yeni Proje Oluştur
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Proje Başlığı *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Proje başlığını girin"
            />
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

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Proje Açıklaması *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Proje hakkında detaylı açıklama yazın"
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
              Gereksinimler
            </label>
            <textarea
              id="requirements"
              name="requirements"
              rows={3}
              value={formData.requirements}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Proje için gerekli olan teknik beceriler, araçlar vb."
            />
          </div>

          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
              Anahtar Kelimeler
            </label>
            <input
              type="text"
              id="keywords"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="React, JavaScript, Machine Learning (virgülle ayırın)"
            />
            <p className="text-sm text-gray-500 mt-1">
              Anahtar kelimeleri virgülle ayırarak girin
            </p>
          </div>

          <div>
            <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-1">
              Maksimum Öğrenci Sayısı
            </label>
            <select
              id="maxStudents"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 Öğrenci</option>
              <option value={2}>2 Öğrenci</option>
              <option value={3}>3 Öğrenci</option>
              <option value={4}>4 Öğrenci</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Projeyi aktif olarak yayınla
            </label>
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
                  <span>Projeyi Oluştur</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;