import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import ProjectCard from '../components/ProjectCard';
import ApplicationModal from '../components/ApplicationModal';
import { Search, Filter, BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  // Determine course language from user's course code
  const courseLanguage = user?.courseCode?.startsWith('BLM') ? 'turkish' : 'english';
  const coursePrefix = user?.courseCode?.startsWith('BLM') ? 'BLM' : 'COM';

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm]);

  const fetchData = async () => {
  try {
    setLoading(true);
    
    // Backend'e courseCode'u gönder
    const [projectsData, applicationsData] = await Promise.all([
      projectService.getProjects(coursePrefix), // courseCode parametresi eklendi
      projectService.getMyApplications()
    ]);

    console.log('Fetched projects data:', projectsData); // Debug için
    console.log('Course prefix:', coursePrefix); // Debug için

    // Eğer backend filtreleme yapmazsa frontend'de filtrele
    const languageFilteredProjects = projectsData.filter(project => 
      project.courseCode?.startsWith(coursePrefix)
    );

    setProjects(languageFilteredProjects);
    setMyApplications(applicationsData);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};
const filterProjects = () => {
    const filtered = projects.filter(project => {
      const searchLower = searchTerm.toLowerCase();
      
      // Proje başlığında arama
      const titleMatch = project.title?.toLowerCase().includes(searchLower);
      
      // Proje açıklamasında arama
      const descriptionMatch = project.description?.toLowerCase().includes(searchLower);
      
      // Anahtar kelimelerde arama
      const keywordsMatch = project.keywords?.toLowerCase().includes(searchLower);
      
      // Öğretmen adında arama
      const teacherFirstNameMatch = project.teacher?.firstName?.toLowerCase().includes(searchLower);
      const teacherLastNameMatch = project.teacher?.lastName?.toLowerCase().includes(searchLower);
      const teacherFullNameMatch = project.teacher ? 
        `${project.teacher.firstName} ${project.teacher.lastName}`.toLowerCase().includes(searchLower) : false;
      
      // Herhangi birinde eşleşme varsa projeyi dahil et
      return titleMatch || descriptionMatch || keywordsMatch || 
             teacherFirstNameMatch || teacherLastNameMatch || teacherFullNameMatch;
    });
    
    setFilteredProjects(filtered);
  };

  const handleApplyToProject = (project) => {
    setSelectedProject(project);
    setShowApplicationModal(true);
  };

const handleApplicationSubmit = async (applicationData) => {
  try {
    console.log('Submitting application:', applicationData);
    // applicationData içinde coverMessage ve projectId olacak
    await projectService.applyToProject(applicationData.projectId, applicationData.coverMessage);
    setShowApplicationModal(false);
    setSelectedProject(null);
    await fetchData(); // Refresh data
    alert('Başvurunuz başarıyla gönderildi!');
  } catch (error) {
    console.error('Error submitting application:', error);
    if (error.response?.status === 403) {
      alert('Bu işlem için yetkiniz bulunmuyor.');
    } else if (error.response?.status === 409) {
      alert('Bu projeye zaten başvurdunuz.');
    } else {
      alert('Başvuru gönderilirken hata oluştu!');
    }
  }
};

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: // Pending
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 1: // Approved
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 2: // Rejected
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Beklemede';
      case 1: return 'Onaylandı';
      case 2: return 'Reddedildi';
      default: return 'Bilinmeyen';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-800';
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
              Hoş geldiniz, {user?.firstName} {user?.lastName}
            </h1>
            <div className="flex items-center mt-2 space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                coursePrefix === 'BLM' ? 'course-blm' : 'course-com'
              }`}>
                {user?.courseCode} - {courseLanguage === 'turkish' ? 'Türkçe' : 'English'} Kursları
              </span>
              <span className="text-gray-600">{user?.email}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{filteredProjects.length}</div>
            <div className="text-sm text-gray-600">Mevcut Proje</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Mevcut Projeler</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Başvurularım ({myApplications.length})</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Proje ara (başlık, açıklama, anahtar kelimeler)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Filter className="h-4 w-4" />
                  <span>{courseLanguage === 'turkish' ? 'Türkçe' : 'English'} Projeler</span>
                </div>
              </div>

              {/* Projects Grid */}
              {filteredProjects.length > 0 ? (
                <div className="space-y-4"> 
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onApply={handleApplyToProject}
                      userRole="student"
                      appliedProjects={myApplications.map(app => app.projectId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz proje bulunmuyor'}
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {searchTerm 
                      ? 'Farklı anahtar kelimeler deneyebilirsiniz.'
                      : `${courseLanguage === 'turkish' ? 'Türkçe' : 'İngilizce'} kursları için proje eklendiğinde görüntülenecektir.`
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-4">
              {myApplications.length > 0 ? (
                myApplications.map((application) => (
                  <div key={application.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {application.projectTitle}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Başvuru Tarihi: {new Date(application.appliedAt).toLocaleDateString('tr-TR')}
                        </p>
                    
                        {application.reviewNotes && (
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Değerlendirme Notu:</strong> {application.reviewNotes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(application.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Henüz başvuru yapmadınız</h3>
                  <p className="mt-2 text-gray-500">Projeler sekmesinden ilginizi çeken projelere başvurabilirsiniz.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <ApplicationModal
          project={selectedProject}
          onSubmit={handleApplicationSubmit}
          onClose={() => setShowApplicationModal(false)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;