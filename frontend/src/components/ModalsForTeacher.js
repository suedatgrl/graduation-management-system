import React from 'react';
import { X, BookOpen, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';

const ModalsForTeacher = ({ projects, title, onClose, filterType = 'all' }) => {
  // Filtreleme
  const filteredProjects = projects.filter(project => {
    switch (filterType) {
      case 'turkish':
        return project.courseCode?.startsWith('BLM');
      case 'english':
        return project.courseCode?.startsWith('COM');
      case 'active':
        return project.isActive;
      case 'inactive':
        return !project.isActive;
      default:
        return true;
    }
  });

  const getCourseColor = (courseCode) => {
    if (courseCode?.startsWith('BLM')) return 'bg-blue-100 text-blue-800';
    if (courseCode?.startsWith('COM')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getLanguageText = (courseCode) => {
    if (courseCode?.startsWith('BLM')) return 'Türkçe';
    if (courseCode?.startsWith('COM')) return 'English';
    return 'Bilinmiyor';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-purple-600">
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-full p-3">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-white">
              <h3 className="text-2xl font-bold">{title}</h3>
              <p className="text-purple-100 mt-1">
                Toplam {filteredProjects.length} proje
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredProjects.length > 0 ? (
            <div className="space-y-4">
              {filteredProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center">
                        <span className="text-purple-700 font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {project.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCourseColor(project.courseCode)}`}>
                            {project.courseCode}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getLanguageText(project.courseCode)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {project.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pasif
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-gray-500">Kontenjan:</span>
                        <span className="font-semibold text-gray-900 ml-1">
                          {project.currentStudents}/{project.maxStudents}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-gray-500">Başvuru:</span>
                        <span className="font-semibold text-gray-900 ml-1">
                          {project.totalApplications || 0}/{project.maxApplications || (project.maxStudents + 2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-gray-500">Tarih:</span>
                        <span className="text-gray-900 ml-1">
                          {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        project.currentStudents >= project.maxStudents 
                          ? 'bg-red-500' 
                          : project.currentStudents > 0 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}></div>
                      <div>
                        <span className="text-gray-500">Durum:</span>
                        <span className="text-gray-900 ml-1">
                          {project.currentStudents >= project.maxStudents 
                            ? 'Dolu' 
                            : project.currentStudents > 0 
                              ? 'Kısmen Dolu' 
                              : 'Boş'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                Proje Bulunamadı
              </h3>
              <p className="mt-2 text-gray-500">
                Bu kategoride henüz proje bulunmuyor.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{filteredProjects.length}</span> proje listelendi
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalsForTeacher;