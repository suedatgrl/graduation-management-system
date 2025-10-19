import React, { useState } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';

const DeadlineUpdateModal = ({ currentDeadline, onUpdate, onClose }) => {
  const [newDeadline, setNewDeadline] = useState(
    currentDeadline ? new Date(currentDeadline).toISOString().slice(0, 16) : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newDeadline) {
      setError('Lütfen bir tarih seçin');
      return;
    }

    const selectedDate = new Date(newDeadline);
    const now = new Date();

    if (selectedDate <= now) {
      setError('Son tarih gelecekte bir tarih olmalıdır');
      return;
    }

    try {
      setLoading(true);
      await onUpdate(selectedDate.toISOString());
      onClose();
    } catch (err) {
      setError('Tarih güncellenirken bir hata oluştu');
      console.error('Error updating deadline:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Son Tarihi Güncelle</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mevcut Son Tarih
            </label>
            <p className="text-gray-600 text-sm mb-4">
              {currentDeadline
                ? new Date(currentDeadline).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Belirlenmemiş'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Son Tarih *
            </label>
            <input
              type="datetime-local"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Öğrencilerin proje başvurusu yapabileceği son tarih
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeadlineUpdateModal;