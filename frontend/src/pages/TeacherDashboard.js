import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import ApplicationsModal from '../components/ApplicationsModal';
import { Plus, BookOpen, Users, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [languageFilter, setLanguageFilter] = useState('all');
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjectsByLanguage();
  }, [projects, languageFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getTeacherProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjectsByLanguage = () => {
    if (languageFilter === 'all') {
      setFilteredProjects(projects);
    } else {
      const prefix = languageFilter === 'turkish' ? 'BLM' : 'COM';
      setFilteredProjects(projects.filter(project => 
        project.courseCode?.startsWith(prefix)
      ));
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      await projectService.createProject(projectData);
      setShowCreateModal(false);
      await fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleViewApplications = (project) => {
    setSelectedProject(project);
    setShowApplicationsModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      try {
        await projectService.deleteProject(projectId);
        await fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const getProjectStats = () => {
    const total = filteredProjects.length;
    const active = filteredProjects.filter(p => p.isActive).length;
    const totalApplications = filteredProjects.reduce((sum, p) => sum + (p.currentStudents || 0), 0);
    const turkish = filteredProjects.filter(p => p.courseCode?.startsWith('BLM')).length;
    const english = filteredProjects.filter(p => p.courseCode?.startsWith('COM')).length;

    return { total, active, totalApplications, turkish, english };
  };

  const stats = getProjectStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Öğretmen Paneli
            </h1>
            <p className="text-gray-600 mt-1">
              Hoş geldiniz, {user?.firstName} {user?.lastName}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni Proje</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Proje</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktif Proje</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Başvuru</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">TR</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Türkçe Proje</p>
              <p className="text-2xl font-bold text-gray-900">{stats.turkish}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">EN</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">English Proje</p>
              <p className="text-2xl font-bold text-gray-900">{stats.english}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Projects */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Projelerim</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Dil Filtresi:</span>
              </div>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="turkish">Türkçe (BLM)</option>
                <option value="english">English (COM)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewApplications={handleViewApplications}
                  onEdit={(project) => {
                    // Handle edit functionality
                    console.log('Edit project:', project);
                  }}
                  onDelete={handleDeleteProject}
                  userRole="teacher"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {languageFilter === 'all' ? 'Henüz proje oluşturmadınız' : 'Bu dilde proje bulunamadı'}
              </h3>
              <p className="mt-2 text-gray-500">
                Yeni proje oluşturmak için "Yeni Proje" butonuna tıklayın.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          onSubmit={handleCreateProject}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showApplicationsModal && selectedProject && (
        <ApplicationsModal
          project={selectedProject}
          onClose={() => setShowApplicationsModal(false)}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;