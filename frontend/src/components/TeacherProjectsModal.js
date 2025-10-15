import React, { useMemo } from 'react';
import { X, Calendar, Users, User, AlertCircle, Filter } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { useAuth } from '../context/AuthContext';

const TeacherProjectsModal = ({ teacher, onApply, onClose, appliedProjects, hasActiveApplication }) => {
  const { user } = useAuth();
  
  // Öğrencinin kurs diline göre projeleri filtrele
  const filteredProjects = useMemo(() => {
    if (!teacher.projects || !user?.courseCode) {
      return teacher.projects || [];
    }

    const studentCoursePrefix = user.courseCode.substring(0, 3); // BLM veya COM
    
    return teacher.projects.filter(project => {
      const projectCoursePrefix = project.courseCode?.substring(0, 3);
      return projectCoursePrefix === studentCoursePrefix;
    });
  }, [teacher.projects, user?.courseCode]);

  const getCourseLanguageText = (courseCode) => {
    if (courseCode?.startsWith('BLM')) {
      return 'Türkçe';
    } else if (courseCode?.startsWith('COM')) {
      return 'English';
    }
    return 'Bilinmeyen';
  };

  const studentLanguage = getCourseLanguageText(user?.courseCode);
  const totalProjects = teacher.projects?.length || 0;
  const filteredCount = filteredProjects.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <User className="h-10 w-10 text-gray-400" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {teacher.firstName} {teacher.lastName}
              </h2>
              <p className="text-sm text-gray-600">{teacher.email}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-blue-600">
                  Toplam Kontenjan: {filteredCount|| 0}
                </span>
        
                <span className="text-sm text-orange-600">
                  Kalan Kontenjan: {teacher.availableQuota}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>


        {/* Active Application Warning */}
        {hasActiveApplication && (
          <div className="mx-6 mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-orange-800">
                  Uyarı
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  Aktif başvurunuz bulunduğu için bu projelere başvuru yapamazsınız.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
             Aktif Projeler ({filteredCount})
          </h3>
          
          {filteredCount > 0 ? (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onApply={onApply}
                  userRole="student"
                  appliedProjects={appliedProjects}
                  hasActiveApplication={hasActiveApplication}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h4 className="mt-4 text-lg font-medium text-gray-900">
                {studentLanguage} kursları için aktif proje bulunmuyor
              </h4>
              <p className="mt-2 text-gray-500">
                Bu öğretim üyesinin {studentLanguage.toLowerCase()} kursları için şu anda aktif projesi bulunmamaktadır.
                {totalProjects > 0 && (
                  <span className="block mt-1 text-xs">
                    (Bu öğretmenin toplam {totalProjects} projesi var, ancak hiçbiri sizin kurs dilinizle uyumlu değil)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherProjectsModal;