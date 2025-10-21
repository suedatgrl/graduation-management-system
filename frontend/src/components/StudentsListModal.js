import React from 'react';
import { X, Users, Mail, BookOpen } from 'lucide-react';

const StudentsListModal = ({ students, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-600" />
            Öğrenci Listesi ({students.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-96">
          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Öğrenci bulunamadı
              </h3>
              <p className="mt-2 text-gray-500">
                Henüz hiç öğrenci eklenmemiş.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </p>
                      
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="h-4 w-4 mr-1" />
                              {student.email}
                            </div>
                            {student.studentNumber && (
                              <div className="text-sm text-gray-500">
                                #{student.studentNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {student.courseCode && (
                      <div className="ml-4">
                        <div className="flex items-center text-sm">
                          <BookOpen className="h-4 w-4 mr-1 text-gray-400" />
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            student.courseCode.startsWith('BLM') 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {student.courseCode}
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

export default StudentsListModal;