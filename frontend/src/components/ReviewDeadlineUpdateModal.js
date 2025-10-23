import React, { useState } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';

const ReviewDeadlineUpdateModal = ({ currentDeadline, onUpdate, onClose }) => {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Son Değerlendirme Tarihi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Deadline Display */}
          {currentDeadline && (
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 mb-1">Mevcut Son Tarih:</p>
              <p className="text-sm font-medium text-purple-900">
                {new Date(currentDeadline).toLocaleString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}

          {/* New Deadline Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Son Tarih *
            </label>
            <input
              type="datetime-local"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Öğretim üyelerinin başvuruları değerlendirebileceği son tarih
            </p>
          </div>

          {/* Warning Message */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Önemli Bilgi</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Bu tarihten sonra öğretmenler başvuruları onaylayamaz veya reddedemez.
                  Son 7 gün içinde öğretmenlere günlük bildirim gönderilecektir.
                </p>
              </div>
            </div>
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
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Güncelleniyor...</span>
                </div>
              ) : (
                'Güncelle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewDeadlineUpdateModal;