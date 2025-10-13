import React from 'react';
import { Calendar, User, Users, Eye, Edit, Trash2, Send } from 'lucide-react';

const ProjectCard = ({ 
  project, 
  onApply, 
  onViewApplications, 
  onEdit, 
  onDelete, 
  userRole, 
  appliedProjects = [] 
}) => {
  const isApplied = appliedProjects.includes(project.id);
  const isStudent = userRole === 'student';
  const isTeacher = userRole === 'teacher';

  const getCourseColor = (courseCode) => {
    if (courseCode?.startsWith('BLM')) {
      return 'course-blm';
    } else if (courseCode?.startsWith('COM')) {
      return 'course-com';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getLanguageText = (courseCode) => {
    if (courseCode?.startsWith('BLM')) {
      return 'Türkçe';
    } else if (courseCode?.startsWith('COM')) {
      return 'English';
    }
    return 'Bilinmeyen';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {project.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCourseColor(project.courseCode)}`}>
            {project.courseCode}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Project Info */}
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span>{project.supervisorName || 'Danışman belirtilmemiş'}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              Oluşturuldu: {new Date(project.createdAt).toLocaleDateString('tr-TR')}
            </span>
          </div>

          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span>
              {project.currentStudents || 0} / {project.maxStudents || 1} öğrenci
            </span>
          </div>

          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              project.courseCode?.startsWith('BLM') ? 'bg-blue-500' : 'bg-green-500'
            }`} />
            <span>{getLanguageText(project.courseCode)}</span>
          </div>
        </div>

        {/* Keywords */}
        {project.keywords && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {project.keywords.split(',').slice(0, 3).map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  {keyword.trim()}
                </span>
              ))}
              {project.keywords.split(',').length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                  +{project.keywords.split(',').length - 3} daha
                </span>
              )}
            </div>
          </div>
        )}

        {/* Requirements */}
        {project.requirements && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Gereksinimler:</p>
            <p className="text-sm text-gray-700 line-clamp-2">
              {project.requirements}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        {isStudent && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {project.isActive ? (
                <span className="text-green-600 text-sm font-medium">Aktif</span>
              ) : (
                <span className="text-red-600 text-sm font-medium">Pasif</span>
              )}
              {isApplied && (
                <span className="text-blue-600 text-sm font-medium">Başvuruldu</span>
              )}
            </div>
            <button
              onClick={() => onApply(project)}
              disabled={!project.isActive || isApplied}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                !project.isActive || isApplied
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Send className="h-4 w-4" />
              <span>{isApplied ? 'Başvuruldu' : 'Başvur'}</span>
            </button>
          </div>
        )}

        {isTeacher && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`text-sm font-medium ${
                project.isActive ? 'text-green-600' : 'text-red-600'
              }`}>
                {project.isActive ? 'Aktif' : 'Pasif'}
              </span>
              <span className="text-sm text-gray-500">
                {project.applicationCount || 0} başvuru
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onViewApplications(project)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>Başvurular</span>
              </button>
              <button
                onClick={() => onEdit(project)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span>Düzenle</span>
              </button>
              <button
                onClick={() => onDelete(project.id)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sil</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;