import React from 'react';
import { X, User, Mail, BookOpen } from 'lucide-react';
import ProjectCard from './ProjectCard';

const TeacherProjectsModal = ({ 
  teacher, 
  onApply, 
  onClose, 
  appliedProjects = [], 
  hasActiveApplication = false,
  isDeadlinePassed = false
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-full p-3">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-white">
              <h3 className="text-2xl font-bold">
                {teacher.firstName} {teacher.lastName}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Mail className="h-4 w-4" />
                <p className="text-blue-100">{teacher.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Teacher Stats */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {teacher.totalQuota || 0}
              </div>
              <div className="text-sm text-gray-600">Toplam Kontenjan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {teacher.availableQuota || 0}
              </div>
              <div className="text-sm text-gray-600">Kalan Kontenjan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {teacher.projects?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Toplam Proje</div>
            </div>
          </div>
        </div>

        {/* Projects Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {teacher.projects && teacher.projects.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-5 w-5 text-gray-600" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Mevcut Projeler ({teacher.projects.length})
                </h4>
              </div>
              
              {teacher.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onApply={onApply}
                  userRole="student"
                  appliedProjects={appliedProjects}
                  hasActiveApplication={hasActiveApplication}
                  isDeadlinePassed={isDeadlinePassed}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                Henüz Proje Yok
              </h3>
              <p className="mt-2 text-gray-500">
                Bu öğretim üyesinin henüz aktif projesi bulunmuyor.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
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

export default TeacherProjectsModal;