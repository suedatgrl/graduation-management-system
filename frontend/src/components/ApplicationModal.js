import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

const ApplicationModal = ({ project, onSubmit, onClose }) => {

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
 

    try {
      setLoading(true);
      await onSubmit({ 
        projectId: project.id,
 
      });
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Projeye Başvur
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{project.description}</p>
          {project.teacher && (
            <p className="text-sm text-gray-500">
              <strong>Danışman:</strong> {project.teacher.firstName} {project.teacher.lastName}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading }
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{loading ? 'Gönderiliyor...' : 'Başvuru Gönder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;