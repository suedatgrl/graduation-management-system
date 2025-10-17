import React from 'react';
import { X, Users, Mail, Award } from 'lucide-react';

const TeachersListModal = ({ teachers, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2 text-green-600" />
            Öğretim Üyesi Listesi ({teachers.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-96">
          {teachers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Öğretim üyesi bulunamadı
              </h3>
              <p className="mt-2 text-gray-500">
                Henüz hiç öğretim üyesi eklenmemiş.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {teacher.firstName[0]}{teacher.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {teacher.firstName} {teacher.lastName}
                            </p>
                            {!teacher.isActive && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Pasif
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Mail className="h-4 w-4 mr-1" />
                            {teacher.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    {teacher.totalQuota && (
                      <div className="ml-4">
                        <div className="flex items-center text-sm">
                          <Award className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-800">
                            Kontenjan: {teacher.totalQuota}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeachersListModal;
