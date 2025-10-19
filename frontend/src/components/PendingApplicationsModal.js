import React from 'react';
import { X, Clock, User, BookOpen, Calendar } from 'lucide-react';

const PendingApplicationsModal = ({ applications, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-orange-600" />
            <h3 className="text-xl font-bold text-gray-900">Bekleyen Başvurular</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        <h4 className="text-lg font-semibold text-gray-900">
                          {application.projectTitle}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          <strong>Öğrenci:</strong> {application.student.firstName} {application.student.lastName}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-700">
                          <strong>Email:</strong> {application.student.email}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-700">
                          <strong>Öğrenci No:</strong> {application.student.studentNumber}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Başvuru Tarihi: {new Date(application.appliedAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Beklemede
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Bekleyen Başvuru Yok
              </h3>
              <p className="mt-2 text-gray-500">
                Şu anda değerlendirme bekleyen başvuru bulunmuyor.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApplicationsModal;