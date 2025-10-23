import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import ApplicationModal from '../components/ApplicationModal';
import TeacherProjectsModal from '../components/TeacherProjectsModal';
import ProjectCard from '../components/ProjectCard';
import { Search, Filter, BookOpen, Clock, CheckCircle, XCircle, Users, User, AlertCircle, X, Calendar } from 'lucide-react';  // Calendar eklendi

const StudentDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showTeacherProjectsModal, setShowTeacherProjectsModal] = useState(false);
  const [showApplicationDetailModal, setShowApplicationDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [hasActiveApplication, setHasActiveApplication] = useState(false);
  const [activeApplication, setActiveApplication] = useState(null);
  

    const [deadlineInfo, setDeadlineInfo] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

  // Determine course language from user's course code
  const courseLanguage = user?.courseCode?.startsWith('BLM') ? 'turkish' : 'english';
  const coursePrefix = user?.courseCode?.substring(0, 3);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm]);

  useEffect(() => {
    // Aktif başvuru kontrolü
    const activeApp = myApplications.find(app => {
      const status = app.status;
      if (typeof status === 'string') {
        return status === 'Pending' || status === 'Approved';
      }
      return status === 1 || status === 2;
    });
    
    setHasActiveApplication(!!activeApp);
    setActiveApplication(activeApp);
  }, [myApplications]);

  //  Son tarih kontrolü
  useEffect(() => {
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      setIsDeadlinePassed(now > deadlineDate);
    }
  }, [deadline]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, applicationsData] = await Promise.all([
        projectService.getProjects(user?.courseCode),
        projectService.getMyApplications()
      ]);
      
      setProjects(projectsData);
      setMyApplications(applicationsData);

      // YENİ: Son tarihi çek
      try {
        const settingsResponse = await fetch('/api/admin/settings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          const deadlineSetting = settings.find(s => s.key === 'ApplicationDeadline');
          if (deadlineSetting) {
            setDeadline(deadlineSetting.value);
          }
        }
      } catch (settingsError) {
        console.warn('Settings could not be loaded:', settingsError);
      }

      // Teachers'ı ayrı çek
      try {
        const teachersResponse = await fetch('/api/teachers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (teachersResponse.ok) {
          const teachersData = await teachersResponse.json();
          setTeachers(teachersData);
        }
      } catch (teacherError) {
        console.warn('Teachers data could not be loaded:', teacherError);
        setTeachers([]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


    const fetchDeadlineInfo = async () => {
    try {
      const info = await notificationService.getDeadlineInfo();
      setDeadlineInfo(info);
    } catch (error) {
      console.error('Deadline bilgisi alınamadı:', error);
    }
  };
  const filterProjects = () => {
    if (!searchTerm) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(project => {
      const titleMatch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
      const descriptionMatch = project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const teacherFirstNameMatch = project.teacher?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
      const teacherLastNameMatch = project.teacher?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
      const teacherFullNameMatch = `${project.teacher?.firstName} ${project.teacher?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      return titleMatch || descriptionMatch || teacherFirstNameMatch || teacherLastNameMatch || teacherFullNameMatch;
    });
    
    setFilteredProjects(filtered);
  };

  const handleApplyToProject = (project) => {
  
    if (isDeadlinePassed) {
      alert('Başvuru süresi sona ermiştir. Artık proje başvurusu yapamazsınız.');
      return;
    }

    if (hasActiveApplication) {
      const statusText = activeApplication?.status === 'Pending' ? 'beklemede olan' : 'onaylanmış';
      alert(`Zaten ${statusText} bir başvurunuz bulunmaktadır. Yeni başvuru yapmak için mevcut başvurunuzun sonuçlanmasını bekleyiniz.\n\nAktif Başvuru: ${activeApplication?.projectTitle}`);
      return;
    }
    setSelectedProject(project);
    setShowApplicationModal(true);
  };

 const handleApplicationSubmit = async (applicationData) => {
  try {
    await projectService.applyToProject(applicationData.projectId, applicationData.studentNote);
    setShowApplicationModal(false);
    setSelectedProject(null);
    await fetchData();
    alert('Başvurunuz başarıyla gönderildi!');
  } catch (error) {
    console.error('Error submitting application:', error);
    if (error.response?.status === 403) {
      alert('Bu işlem için yetkiniz bulunmuyor.');
    } else if (error.response?.status === 409) {
      alert('Bu projeye zaten başvurdunuz.');
    } else {
      alert('Başvuru gönderilirken bir hata oluştu.');
    }
  }
};

  const handleTeacherClick = async (teacher) => {
    try {
      const response = await fetch(`/api/teachers/${teacher.id}/projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const teacherWithProjects = await response.json();
        setSelectedTeacher(teacherWithProjects);
        setShowTeacherProjectsModal(true);
      } else {
        throw new Error('Failed to fetch teacher projects');
      }
    } catch (error) {
      console.error('Error fetching teacher projects:', error);
      alert('Öğretmen projeleri yüklenirken bir hata oluştu.');
    }
  };

  const handleApplicationClick = (applicationData) => {
    setSelectedApplication(applicationData);
    setShowApplicationDetailModal(true);
  };

  const normalizeStatus = (status) => {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'pending': return 1;
        case 'approved': return 2;
        case 'rejected': return 3;
        default: return status;
      }
    }
    return status;
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 1:
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 2:
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 3:
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 2:
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 3:
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 2:
      case 'Approved':
        return 'Onaylandı';
      case 3:
      case 'Rejected':
        return 'Reddedildi';
      default:
        return 'Beklemede';
    }
  };

  const isActiveStatus = (status) => {
    const normalizedStatus = normalizeStatus(status);
    return normalizedStatus === 1 || normalizedStatus === 2 || status === 'Pending' || status === 'Approved';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          <div className="flex items-center space-x-4 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              coursePrefix === 'BLM' ? 'course-blm' : 'course-com'
            }`}>
              {user?.courseCode} - {courseLanguage === 'turkish' ? 'Türkçe' : 'English'} Projeleri
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

    {/* Deadline ve Başvuru Durumu Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Deadline Box - Her zaman görünsün */}
      {deadline ? (
        <div className={`border rounded-lg p-4 ${
          isDeadlinePassed 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-start space-x-3">
            <Calendar className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
              isDeadlinePassed ? 'text-red-600' : 'text-green-600'
            }`} />
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${
                isDeadlinePassed ? 'text-red-800' : 'text-green-800'
              }`}>
                {isDeadlinePassed ? '⚠️ Başvuru Süresi Sona Erdi' : '✅ Başvuru Süresi Aktif'}
              </h3>
              <p className={`text-sm mt-1 ${
                isDeadlinePassed ? 'text-red-700' : 'text-green-700'
              }`}>
                <strong>Son Başvuru Tarihi:</strong>
                <br />
                {new Date(deadline).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {isDeadlinePassed ? (
                <p className="text-sm text-red-700 mt-2 font-medium">
                  🚫 Proje seçme süresi geçmiştir. Yeni başvuru yapamazsınız.
                </p>
              ) : (
                <p className="text-sm text-green-700 mt-2">
                  ✓ Başvuru yapabilirsiniz
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-700">
                Son Başvuru Tarihi Belirlenmedi
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Admin tarafından henüz bir son başvuru tarihi belirlenmemiştir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Application veya Bilgilendirme */}
      {hasActiveApplication ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Aktif Başvuru Bulunuyor
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                <strong>{activeApplication?.projectTitle}</strong> projesine başvurunuz bulunmaktadır.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                Yalnızca bir projeye başvurma hakkınız var.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                Proje Başvurusu
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                {isDeadlinePassed 
                  ? 'Başvuru süresi sona erdiği için yeni başvuru yapamazsınız.'
                  : 'Aşağıdaki projeler arasından seçim yaparak başvurunuzu gerçekleştirebilirsiniz.'
                }
              </p>
              {!isDeadlinePassed && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    💡 İpucu: Proje detaylarını inceleyip size en uygun projeyi seçin
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
                <span>Başvuru Durumum</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'teachers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Öğretim Üyeleri</span>
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
                    placeholder="Proje ara (başlık, açıklama, öğretmen adı)..."
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
                      hasActiveApplication={hasActiveApplication}
                      isDeadlinePassed={isDeadlinePassed}  
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
                myApplications.map((application) => {
                  const isActive = isActiveStatus(application.status);
                  
                  return (
                    <div 
                      key={application.id} 
                      className={`rounded-lg p-6 border cursor-pointer hover:shadow-md transition-shadow ${
                        isActive
                          ? 'bg-yellow-50 border-yellow-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => handleApplicationClick(application)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {application.projectTitle}
                            </h3>
                        
                            {application.reviewNotes && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                Değerlendirme Notu Var
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Başvuru Tarihi: {new Date(application.appliedAt).toLocaleDateString('tr-TR')}
                          </p>
                          {application.reviewedAt && (
                            <p className="text-sm text-gray-600">
                              Değerlendirme Tarihi: {new Date(application.reviewedAt).toLocaleDateString('tr-TR')}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-2 italic">
                            Detaylar için tıklayın
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(application.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                            {getStatusText(application.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Henüz başvuru yapmadınız</h3>
                  <p className="mt-2 text-gray-500">Projeler sekmesinden ilginizi çeken projelere başvurabilirsiniz.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="space-y-4">
              {teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <div 
                    key={teacher.id} 
                    className="bg-gray-50 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleTeacherClick(teacher)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <User className="h-10 w-10 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {teacher.firstName} {teacher.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{teacher.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          Toplam Kontenjan: {teacher.totalQuota || 0}
                        </div>
                        <div className="text-s text-gray-500">
                          Kalan Kontenjan: {teacher.availableQuota || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Öğretim üyesi bulunamadı</h3>
                  <p className="mt-2 text-gray-500">Henüz sistemde kayıtlı öğretim üyesi bulunmuyor.</p>
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

      {/* Teacher Projects Modal */}
      {showTeacherProjectsModal && selectedTeacher && (
        <TeacherProjectsModal
          teacher={selectedTeacher}
          onApply={handleApplyToProject}
          onClose={() => setShowTeacherProjectsModal(false)}
          appliedProjects={myApplications.map(app => app.projectId)}
          hasActiveApplication={hasActiveApplication}
          isDeadlinePassed={isDeadlinePassed}
        />
      )}

      {/* Application Detail Modal */}
      {showApplicationDetailModal && selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setShowApplicationDetailModal(false)}
        />
      )}
    </div>
  );
};

// ApplicationDetailModal bileşeni aynı kalıyor (değişiklik yok)
const ApplicationDetailModal = ({ application, onClose }) => {
  const normalizeStatus = (status) => {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'pending': return 1;
        case 'approved': return 2;
        case 'rejected': return 3;
        default: return status;
      }
    }
    return status;
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 1:
      case 'Pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 2:
      case 'Approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 3:
      case 'Rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 1:
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 2:
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 3:
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 1:
      case 'Pending':
        return 'Beklemede';
      case 2:
      case 'Approved':
        return 'Onaylandı';
      case 3:
      case 'Rejected':
        return 'Reddedildi';
      default:
        return 'Bilinmiyor';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Başvuru Detayları</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Proje</h4>
            <p className="text-gray-600">{application.projectTitle}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Durum</h4>
            <div className="flex items-center space-x-2">
              {getStatusIcon(application.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                {getStatusText(application.status)}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Başvuru Tarihi</h4>
            <p className="text-gray-600">
              {new Date(application.appliedAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {application.studentNote && (
  <div>
    <h4 className="text-sm font-medium text-gray-900 mb-2">Başvuru Notunuz</h4>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-blue-800 whitespace-pre-wrap">{application.studentNote}</p>
    </div>
  </div>
)}

          {application.reviewedAt && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Değerlendirme Tarihi</h4>
              <p className="text-gray-600">
                {new Date(application.reviewedAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}

          {application.reviewNotes && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Değerlendirme Notu</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700">{application.reviewNotes}</p>
              </div>
            </div>
          )}
          
          {!application.reviewNotes && application.reviewedAt && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Değerlendirme Notu</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-500 italic">Öğretim üyesi herhangi bir not bırakmamış.</p>
              </div>
            </div>
          )}

          {!application.reviewedAt && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Değerlendirme Durumu</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700">Başvurunuz henüz değerlendirilmemiş. Lütfen bekleyiniz.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;