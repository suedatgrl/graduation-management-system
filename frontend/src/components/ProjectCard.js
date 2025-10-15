import React from 'react';
import { Calendar, User, Users, Eye, Edit, Trash2, Send, Lock, AlertTriangle } from 'lucide-react';

const ProjectCard = ({ 
  project, 
  onApply, 
  onViewApplications, 
  onEdit, 
  onDelete, 
  userRole, 
  appliedProjects = [],
  hasActiveApplication = false
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
    return 'Unknown';
  };

  const canApply = () => {
    if (!isStudent) return false;
    if (isApplied) return false;
    if (hasActiveApplication) return false;
    if (project.isApplicationFull) return false; // Başvuru kontenjanı dolu
    return true;
  };

  const getApplyButtonText = () => {
    if (isApplied) return 'Başvuru Yapıldı';
    if (hasActiveApplication) return 'Aktif Başvuru Var';
    if (project.isApplicationFull) return 'Başvuru Kontenjanı Dolu';
    return 'Başvur';
  };

  const getApplyButtonColor = () => {
    if (isApplied) return 'bg-green-500 text-white cursor-not-allowed';
    if (hasActiveApplication) return 'bg-orange-500 text-white cursor-not-allowed';
    if (project.isApplicationFull) return 'bg-red-500 text-white cursor-not-allowed';
    return 'bg-blue-600 hover:bg-blue-700 text-white';
  };

  const getApplyButtonIcon = () => {
    if (isApplied) return <Send className="h-4 w-4" />;
    if (hasActiveApplication) return <Lock className="h-4 w-4" />;
    if (project.isApplicationFull) return <Lock className="h-4 w-4" />;
    return <Send className="h-4 w-4" />;
  };

  const getStatusInfo = () => {
    if (project.isApplicationFull) {
      return {
        color: 'bg-red-500',
        text: 'Başvuru Kontenjanı Dolu',
        icon: <Lock className="h-4 w-4 text-red-500" />
      };
    } else if (project.remainingApplicationSlots <= 2) {
      return {
        color: 'bg-yellow-500',
        text: 'Başvuru Kontenjanı Azalıyor',
        icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />
      };
    } else {
      return {
        color: 'bg-green-500',
        text: 'Başvuru Açık',
        icon: null
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
      hasActiveApplication && !isApplied ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCourseColor(project.courseCode)}`}>
              {project.courseCode} - {getLanguageText(project.courseCode)}
            </span>
            {hasActiveApplication && !isApplied && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Başvuru Engelli
              </span>
            )}
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
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
          <span className="text-sm text-gray-600">{statusInfo.text}</span>
          {statusInfo.icon}
        </div>
        
        <div className="flex items-center space-x-2">
          {isStudent && (
            <button
              onClick={() => canApply() && onApply(project)}
              disabled={!canApply()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${getApplyButtonColor()}`}
              title={
                hasActiveApplication && !isApplied 
                  ? 'Aktif başvurunuz bulunduğu için yeni başvuru yapamazsınız' 
                  : project.isApplicationFull 
                  ? `Başvuru kontenjanı dolu (${project.totalApplications}/${project.maxApplications})`
                  : ''
              }
            >
              {getApplyButtonIcon()}
              <span>{getApplyButtonText()}</span>
            </button>
          )}
          
          {isTeacher && (
            <>
              <button
                onClick={() => onViewApplications(project)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Başvuruları Görüntüle"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(project)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Düzenle"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(project)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;