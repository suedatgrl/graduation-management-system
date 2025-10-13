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

  // Teacher View - List Format
  if (isTeacher) {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 mb-4">
        <div className="p-6">
          <div className="flex items-start justify-between">
            {/* Left Side - Project Info */}
            <div className="flex-1 pr-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCourseColor(project.courseCode)}`}>
                      {project.courseCode}
                    </span>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      project.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {project.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Project Details */}
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(project.createdAt).toLocaleDateString('tr-TR')}
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

                    <div className="flex items-center">
                      <span className="text-gray-600">
                        {project.applicationCount || 0} başvuru
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => onViewApplications(project)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Başvurular</span>
              </button>
              
              <button
                onClick={() => onEdit(project)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Düzenle</span>
              </button>
              
              <button
                onClick={() => onDelete(project.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sil</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }



    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 mb-4">
        <div className="p-6">
          <div className="flex items-start justify-between">
            {/* Left Side - Project Info */}
            <div className="flex-1 pr-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCourseColor(project.courseCode)}`}>
                      {project.courseCode}
                    </span>
        
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      project.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {project.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Project Details */}
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>{project.teacher ? `${project.teacher.firstName} ${project.teacher.lastName}` : 'Danışman belirtilmemiş'}</span>
                  </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(project.createdAt).toLocaleDateString('tr-TR')}
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

                    <div className="flex items-center">
                      <span className="text-gray-600">
                        {project.applicationCount || 0} başvuru
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            

            {/* Right Side - Action Buttons */}
             <div className="flex items-center space-x-2 flex-shrink-0">
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
          </div>
        </div>
      </div>
    );
  
};

export default ProjectCard;