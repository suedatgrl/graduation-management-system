import React, { useState } from 'react';
import { Calendar, User, Users, BookOpen, AlertTriangle, Bell, BellOff } from 'lucide-react';
import notificationService from '../services/notificationService';

const ProjectCard = ({ 
  project, 
  onApply, 
  onEdit, 
  onViewApplications, 
  userRole, 
  appliedProjects = [], 
  hasActiveApplication = false,
  isDeadlinePassed = false
}) => {
  const isStudent = userRole === 'student';
  const isTeacher = userRole === 'teacher';
  const hasApplied = appliedProjects.includes(project.id);
  
  const isStudentQuotaFull = project.currentStudents >= project.maxStudents;
  const isApplicationQuotaFull = project.isApplicationFull || 
                                 (project.totalApplications >= project.maxApplications);
  
  const [hasQuotaAlert, setHasQuotaAlert] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);

  const isApplyDisabled = isStudent && (
    hasApplied || 
    !project.isActive || 
    isStudentQuotaFull ||
    isApplicationQuotaFull ||
    hasActiveApplication ||
    isDeadlinePassed
  );

  const handleQuotaAlertToggle = async (e) => {
    e.stopPropagation(); // Kartın tıklama olayını engelle
    
    setAlertLoading(true);
    try {
      if (hasQuotaAlert) {
        await notificationService.removeQuotaAlert(project.id);
        setHasQuotaAlert(false);
        alert('Kontenjan bildirimi iptal edildi.');
      } else {
        await notificationService.createQuotaAlert(project.id);
        setHasQuotaAlert(true);
        alert('Kontenjan açıldığında bildirim alacaksınız!');
      }
    } catch (error) {
      console.error('Quota alert error:', error);
      alert(error.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setAlertLoading(false);
    }
  };

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
            {/* YENİ: Kontenjan Dolu ise Zil Butonu */}
            {isStudent && isApplicationQuotaFull && !hasApplied && (
              <button
                onClick={handleQuotaAlertToggle}
                disabled={alertLoading}
                className={`group relative flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  hasQuotaAlert
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={hasQuotaAlert ? 'Bildirimi iptal et' : ''}
              >
                {alertLoading ? (
                  <div className="animate-spin h-3 w-3 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                ) : hasQuotaAlert ? (
                  <BellOff className="h-3 w-3" />
                ) : (
                  <Bell className="h-3 w-3" />
                )}
                <span className="text-xs">
                  {hasQuotaAlert ? 'Bildirimi İptal Et' : 'Haber Ver'}
                </span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 z-10">
                  {hasQuotaAlert 
                    ? 'Kontenjan bildirimi iptal edilecek' 
                    : 'Kontenjan açılınca email ve bildirim gönderilir'}
                  <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </button>
            )}

            {!project.isActive && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                Pasif
              </span>
            )}
            
            {isStudentQuotaFull && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                Kontenjan Dolu
              </span>
            )}
            
            {!isStudentQuotaFull && isApplicationQuotaFull && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                Başvuru Kontenjanı Dolu
              </span>
            )}
            
            {hasApplied && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                Başvuruldu
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
            <span className="font-medium">
              {project.currentStudents}/{project.maxStudents}
            </span>
          
          </div>
        </div>
          
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          {project.description}
        </p>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
        {isStudent && (
          <>
            {isDeadlinePassed ? (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Başvuru süresi sona erdi</span>
              </div>
            ) : isApplicationQuotaFull ? (
              <div className="flex items-center space-x-2 text-orange-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Başvuru kontenjanı dolmuştur </span>
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
              <span>Başvurular ({project.totalApplications || 0}/{project.maxApplications})</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;