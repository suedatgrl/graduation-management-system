import React from 'react';
import { Calendar, User, Users, BookOpen, AlertTriangle } from 'lucide-react';

const ProjectCard = ({ 
  project, 
  onApply, 
  onEdit, 
  onViewApplications, 
  userRole, 
  appliedProjects = [], 
  hasActiveApplication = false,
  isDeadlinePassed = false  // YENİ PROP
}) => {
  const isStudent = userRole === 'student';
  const isTeacher = userRole === 'teacher';
  const hasApplied = appliedProjects.includes(project.id);
  const isFull = project.currentStudents >= project.maxStudents;
  
 
  const isApplyDisabled = isStudent && (
    hasApplied || 
    !project.isActive || 
    isFull || 
    hasActiveApplication ||
    isDeadlinePassed  
  );

  const getCourseColor = () => {
    if (project.courseCode?.startsWith('BLM')) {
      return 'course-blm';
    } else if (project.courseCode?.startsWith('COM')) {
      return 'course-com';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCourseColor()}`}>
                {project.courseCode}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            {!project.isActive && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                Pasif
              </span>
            )}
            {isFull && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                Kontenjan Dolu
              </span>
            )}
            {hasApplied && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                Başvuruldu
              </span>
            )}
            {hasActiveApplication && !hasApplied && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                Başvuru Engelli
              </span>
            )}
            {/* YENİ: Son tarih geçti uyarısı */}
            {isDeadlinePassed && isStudent && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                Süre Doldu
              </span>
            )}
          </div>
        </div>
          
        <div className="flex items-center text-sm text-gray-600 space-x-4 mb-3">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{project.teacher?.firstName} {project.teacher?.lastName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{project.currentStudents}/{project.maxStudents}</span>
          </div>
        </div>
          
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          {project.description}
        </p>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
        {isStudent && (
          <>
            {/* YENİ: Tarih geçti mesajı */}
            {isDeadlinePassed ? (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Başvuru süresi sona erdi</span>
              </div>
            ) : (
              <button
                onClick={() => onApply(project)}
                disabled={isApplyDisabled}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isApplyDisabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {hasApplied ? 'Başvurdunuz' : 'Başvur'}
              </button>
            )}
          </>
        )}

        {isTeacher && (
          <>
            <button
              onClick={() => onEdit(project)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Düzenle
            </button>
            <button
              onClick={() => onViewApplications(project)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Başvurular ({project.applicationCount || 0})</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;