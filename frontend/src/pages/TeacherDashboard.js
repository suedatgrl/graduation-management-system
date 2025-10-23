import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import EditProjectModal from '../components/EditProjectModal';
import ApplicationsModal from '../components/ApplicationsModal';
import AllApplicationsModal from '../components/AllApplicationsModal'; 
import ModalsForTeacher from '../components/ModalsForTeacher';  

import { Plus, BookOpen, Users, Clock, CheckCircle, XCircle, Filter, Calendar, AlertTriangle } from 'lucide-react';
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

  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', filterType: 'all' });
 
   const [reviewDeadline, setReviewDeadline] = useState(null);
  const [daysUntilReviewDeadline, setDaysUntilReviewDeadline] = useState(null);
  const [isReviewDeadlinePassed, setIsReviewDeadlinePassed] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchReviewDeadline();
  }, []);

  useEffect(() => {
    filterProjectsByLanguage();
  }, [projects, languageFilter]);

  useEffect(() => {
    if (projects.length > 0) {
      fetchAllApplications();
    }
  }, [projects]);

  useEffect(() => {
    if (reviewDeadline) {
      const deadlineDate = new Date(reviewDeadline);
      const now = new Date();
      const diffTime = deadlineDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDaysUntilReviewDeadline(diffDays);
      setIsReviewDeadlinePassed(now > deadlineDate);
    }
  }, [reviewDeadline]);


   const fetchReviewDeadline = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const settings = await response.json();
        const reviewDeadlineSetting = settings.find(s => s.key === 'ReviewDeadline');
        if (reviewDeadlineSetting && reviewDeadlineSetting.value) {
          setReviewDeadline(reviewDeadlineSetting.value);
        }
      }
    } catch (error) {
      console.warn('Review deadline could not be loaded:', error);
    }
  };


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

   const openProjectsModal = (title, filterType) => {
    setModalConfig({ title, filterType });
    setShowProjectsModal(true);
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

    const getDeadlineStatusColor = () => {
    if (isReviewDeadlinePassed) return 'bg-red-50 border-red-200';
    if (daysUntilReviewDeadline <= 7) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getDeadlineTextColor = () => {
    if (isReviewDeadlinePassed) return 'text-red-800';
    if (daysUntilReviewDeadline <= 7) return 'text-yellow-800';
    return 'text-green-800';
  };

  const getDeadlineIcon = () => {
    if (isReviewDeadlinePassed) return <XCircle className="h-6 w-6 text-red-600" />;
    if (daysUntilReviewDeadline <= 7) return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    return <CheckCircle className="h-6 w-6 text-green-600" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }


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
      {/* Header  */}
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
       {reviewDeadline && (
        <div className={`rounded-lg shadow p-6 border-2 ${getDeadlineStatusColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getDeadlineIcon()}
              <div>
                <h3 className={`text-lg font-semibold ${getDeadlineTextColor()}`}>
                  {isReviewDeadlinePassed 
                    ? '🚫 Değerlendirme Süresi Sona Erdi' 
                    : daysUntilReviewDeadline === 0
                    ? '🚨 SON GÜN - Başvuru Değerlendirme'
                    : daysUntilReviewDeadline <= 7
                    ? `⚠️ Son ${daysUntilReviewDeadline} Gün - Başvuru Değerlendirme`
                    : '✅ Değerlendirme Süresi Aktif'}
                </h3>
                <p className={`text-sm mt-1 ${getDeadlineTextColor()}`}>
                  <strong>Son Değerlendirme Tarihi:</strong>
                  <br />
                  {new Date(reviewDeadline).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {isReviewDeadlinePassed && (
                  <p className="text-sm text-red-700 mt-2 font-medium">
                    ❌ Artık başvuruları onaylayamaz veya reddedemezsiniz.
                  </p>
                )}
                {!isReviewDeadlinePassed && stats.pendingApplications > 0 && (
                  <p className="text-sm mt-2 font-medium">
                    📋 {stats.pendingApplications} bekleyen başvurunuz var!
                  </p>
                )}
              </div>
            </div>
            {!isReviewDeadlinePassed && daysUntilReviewDeadline <= 7 && (
              <div className="text-right">
                <div className="text-4xl font-bold text-yellow-600">
                  {daysUntilReviewDeadline}
                </div>
                <div className="text-sm text-yellow-700">Gün Kaldı</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Toplam Proje */}
        <div 
          onClick={() => openProjectsModal('Tüm Projeler', 'all')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
        >
          <div className="flex items-center">
            <BookOpen className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-purple-100">Toplam Proje</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        {/* Aktif Proje */}
        <div 
          onClick={() => openProjectsModal('Aktif Projeler', 'active')}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
        >
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-green-100">Aktif Proje</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>

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

        
        {/* Türkçe Projeler */}
        <div 
          onClick={() => openProjectsModal('Türkçe Projeler', 'turkish')}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow p-6 text-white cursor-pointer hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105"
        >
          <div className="flex items-center">
            <BookOpen className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-indigo-100">Türkçe Projeler</p>
              <p className="text-2xl font-bold">{stats.turkish}</p>
            </div>
          </div>
        </div>

        {/* English Projeler */}
        <div 
          onClick={() => openProjectsModal('English Projeler', 'english')}
          className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow p-6 text-white cursor-pointer hover:from-teal-600 hover:to-teal-700 transition-all transform hover:scale-105"
        >
          <div className="flex items-center">
            <BookOpen className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-teal-100">İngilizce Projeler</p>
              <p className="text-2xl font-bold">{stats.english}</p>
            </div>
          </div>
        </div>
      </div>


      {/* Projects  */}
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

      {/*  Tüm Başvurular Modal */}
      {showAllApplicationsModal && (
        <AllApplicationsModal
          projects={filteredProjects}
          onClose={() => setShowAllApplicationsModal(false)}
        />
      )}

      {showProjectsModal && (
        <ModalsForTeacher
          projects={projects}
          title={modalConfig.title}
          filterType={modalConfig.filterType}
          onClose={() => setShowProjectsModal(false)}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;