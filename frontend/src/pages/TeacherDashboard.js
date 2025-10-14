import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import EditProjectModal from '../components/EditProjectModal';
import ApplicationsModal from '../components/ApplicationsModal';
import AllApplicationsModal from '../components/AllApplicationsModal'; // Yeni import
import { Plus, BookOpen, Users, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [showAllApplicationsModal, setShowAllApplicationsModal] = useState(false); // Yeni state
  const [languageFilter, setLanguageFilter] = useState('all');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [allApplications, setAllApplications] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjectsByLanguage();
  }, [projects, languageFilter]);

  useEffect(() => {
    if (projects.length > 0) {
      fetchAllApplications();
    }
  }, [projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getTeacherProjects();
      const activeProjects = data.filter(project => project.isActive);
      setProjects(activeProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllApplications = async () => {
    try {
      const allAppsPromises = projects.map(project => 
        projectService.getProjectApplications(project.id)
      );
      const allAppsResults = await Promise.all(allAppsPromises);
      const flatApplications = allAppsResults.flat();
      setAllApplications(flatApplications);
    } catch (error) {
      console.error('Error fetching all applications:', error);
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

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleUpdateProject = async (projectData) => {
    try {
      await projectService.updateProject(selectedProject.id, projectData);
      setShowEditModal(false);
      setSelectedProject(null);
      await fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleViewApplications = (project) => {
    setSelectedProject(project);
    setShowApplicationsModal(true);
  };

  // Güncellenmiş: Tüm başvuruları liste halinde göster
  const handleViewAllApplications = () => {
    setShowAllApplicationsModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      try {
        await projectService.deleteProject(projectId);
        setProjects(prevProjects => 
          prevProjects.filter(project => project.id !== projectId)
        );
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const getProjectStats = () => {
    const total = filteredProjects.length;
    const active = filteredProjects.filter(p => p.isActive).length;
    
    const totalApplications = filteredProjects.reduce((sum, project) => {
      const projectApplications = allApplications.filter(app => app.projectId === project.id);
      return sum + projectApplications.length;
    }, 0);
    
    const turkish = filteredProjects.filter(p => p.courseCode?.startsWith('BLM')).length;
    const english = filteredProjects.filter(p => p.courseCode?.startsWith('COM')).length;

    return { total, active, totalApplications, turkish, english };
  };

  const stats = getProjectStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - değişiklik yok */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hoş geldiniz, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-gray-600 mt-2">Projelerinizi yönetin ve başvuruları inceleyin.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni Proje</span>
          </button>
        </div>
      </div>

      {/* Stats - sadece Toplam Başvuru kartı güncellenmiş */}
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

        {/* Güncellenmiş: Tıklanabilir Başvuru Stats */}
        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleViewAllApplications}
          title="Tüm başvuruları görüntülemek için tıklayın"
        >
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
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">TR</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Türkçe Projeler</p>
              <p className="text-2xl font-bold text-gray-900">{stats.turkish}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">EN</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">English Projeler</p>
              <p className="text-2xl font-bold text-gray-900">{stats.english}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects - değişiklik yok */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Projelerim</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
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
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewApplications={handleViewApplications}
                  onEdit={handleEditProject}
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

      {showEditModal && selectedProject && (
        <EditProjectModal
          project={selectedProject}
          onSubmit={handleUpdateProject}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
        />
      )}

      {showApplicationsModal && selectedProject && (
        <ApplicationsModal
          project={selectedProject}
          onClose={() => setShowApplicationsModal(false)}
        />
      )}

      {/* Yeni: Tüm Başvurular Modal */}
      {showAllApplicationsModal && (
        <AllApplicationsModal
          projects={filteredProjects}
          onClose={() => setShowAllApplicationsModal(false)}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;