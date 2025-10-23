import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import CreateUserModal from '../components/CreateUserModal';
import ExcelUploadModal from '../components/ExcelUploadModal';
import StudentsListModal from '../components/StudentsListModal';
import TeachersListModal from '../components/TeachersListModal';
import EditUserModal from '../components/EditUserModal';
import ReviewDeadlineUpdateModal from '../components/ReviewDeadlineUpdateModal';
import PendingApplicationsModal from '../components/PendingApplicationsModal';  
import DeadlineUpdateModal from '../components/DeadlineUpdateModal';  
import ProjectsListModal from '../components/ProjectsListModal';
import { Users, BookOpen, Clock, Plus, Upload, Search, Trash2, ToggleLeft, ToggleRight, Calendar, Edit } from 'lucide-react';
const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
   const [showReviewDeadlineModal, setShowReviewDeadlineModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showTeachersModal, setShowTeachersModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [studentsData, setStudentsData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
const [reviewDeadline, setReviewDeadline] = useState(null)
  const [showPendingApplicationsModal, setShowPendingApplicationsModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);  // YENİ
const [selectedUser, setSelectedUser] = useState(null); 

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, settingsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllUsers(),
        adminService.getSettings() 
      ]);
      
      setStats(statsData);
      setUsers(usersData);

         const deadlineSetting = settingsData.find(s => s.key === 'ApplicationDeadline');
      if (deadlineSetting) {
        setDeadline(deadlineSetting.value);
      }

      //  ReviewDeadline'ı al
      const reviewDeadlineSetting = settingsData.find(s => s.key === 'ReviewDeadline');
      if (reviewDeadlineSetting) {
        setReviewDeadline(reviewDeadlineSetting.value);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const filterUsers = () => {
    let filtered = users;

    if (roleFilter !== 'all') {
      const roleValue = roleFilter === 'student' ? 1 : roleFilter === 'teacher' ? 2 : 3;
      filtered = filtered.filter(user => user.role === roleValue);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) 
      );
    }

    setFilteredUsers(filtered);
  };


   const handlePendingApplicationsClick = async () => {
    try {
      const applications = await adminService.getPendingApplications();
      setPendingApplications(applications);
      setShowPendingApplicationsModal(true);
    } catch (error) {
      console.error('Error fetching pending applications:', error);
      alert('Bekleyen başvurular yüklenirken bir hata oluştu.');
    }
  };


  const handleDeadlineUpdate = async (newDeadline) => {
    try {
      await adminService.updateDeadline(newDeadline);
      setDeadline(newDeadline);
      alert('Son tarih başarıyla güncellendi!');
      await fetchData();
    } catch (error) {
      console.error('Error updating deadline:', error);
      throw error;
    }
  };

    const handleReviewDeadlineUpdate = async (newDeadline) => {
    try {
      await adminService.updateReviewDeadline(newDeadline);
      setReviewDeadline(newDeadline);
      setShowReviewDeadlineModal(false);
      alert('Son değerlendirme tarihi başarıyla güncellendi!');
    } catch (error) {
      console.error('Error updating review deadline:', error);
      alert('Tarih güncellenirken bir hata oluştu.');
    }
  };


  const handleCreateUser = async (userData) => {
    try {
      if (userData.role === 1) {
        await adminService.createStudent(userData);
      } 
      else if (userData.role==2) {
        await adminService.createTeacher(userData);
      }
      setShowCreateModal(false);
      await fetchData();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleExcelUpload = async (file, userType) => {
    try {
      await adminService.uploadUsersFromExcel(file, userType);
      setShowExcelModal(false);
      await fetchData();
    } catch (error) {
      console.error('Error uploading users:', error);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      await fetchData();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        await adminService.deleteUser(userId);
        await fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleOpenStudentsModal = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStudents();
      setStudentsData(data);
      setShowStudentsModal(true);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTeachersModal = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTeachers();
      setTeachersData(data);
      setShowTeachersModal(true);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProjectsModal = async () => {
    try {
      setLoading(true);
      const data = await adminService.getProjects();
      setProjectsData(data);
      setShowProjectsModal(true);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 1: return 'Öğrenci';
      case 2: return 'Öğretim Üyesi';
      case 3: return 'Admin';
      default: return 'Bilinmeyen';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      case 3: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateUser = async (userId, userData) => {
  try {
    await adminService.updateUser(userId, userData);
    setShowEditUserModal(false);
    setSelectedUser(null);
    await fetchData();
    alert('Kullanıcı bilgileri başarıyla güncellendi!');
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
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
            <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
            <p className="text-gray-600 mt-1">
              Hoş geldiniz, {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Kullanıcı Ekle</span>
            </button>
            <button
              onClick={() => setShowExcelModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Upload className="h-5 w-5" />
              <span>Excel Yükle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Kullanıcı Yönetimi
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Deadline */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  Proje Başvuru Son Tarihi
                </h3>
                <p className="text-lg font-bold text-blue-700 mt-1">
                  {deadline
                    ? new Date(deadline).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Belirlenmemiş'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeadlineModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Güncelle</span>
            </button>
          </div>
        </div>

        {/* YENİ: Review Deadline */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="text-sm font-medium text-purple-900">
                  Son Değerlendirme Tarihi
                </h3>
                <p className="text-lg font-bold text-purple-700 mt-1">
                  {reviewDeadline
                    ? new Date(reviewDeadline).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Belirlenmemiş'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowReviewDeadlineModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span>Güncelle</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Öğretmenlerin başvuruları onaylayıp reddedebileceği son tarih
          </p>
        </div>
      </div>


              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div 
                  onClick={handleOpenStudentsModal}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
                >
                  <div className="flex items-center">
                    <Users className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-blue-100">Toplam Öğrenci</p>
                      <p className="text-2xl font-bold">{stats.totalStudents || 0}</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={handleOpenTeachersModal}
                  className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
                >
                  <div className="flex items-center">
                    <Users className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-green-100">Toplam Öğretim Üyesi</p>
                      <p className="text-2xl font-bold">{stats.totalTeachers || 0}</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={handleOpenProjectsModal}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-purple-100">Toplam Proje</p>
                      <p className="text-2xl font-bold">{stats.totalProjects || 0}</p>
                    </div>
                  </div>
                </div>

               <div 
                  onClick={handlePendingApplicationsClick}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  <div className="flex items-center">
                    <Clock className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-orange-100">Bekleyen Başvuru</p>
                      <p className="text-2xl font-bold">{stats.pendingApplications || 0}</p>
                    </div>
                  </div>
                </div>
              </div>


              {/* Course Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Öğrenci Dağılımı</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm text-gray-700">BLM (Türkçe) </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {stats.blmStudents || 0} öğrenci
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm text-gray-700">COM (English) </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {stats.comStudents || 0} öğrenci
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Proje İstatistikleri</h3>
                  <div className="space-y-4">
                  
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Türkçe Projeler</span>
                      <span className="text-sm font-medium text-gray-900">
                        {stats.blmProjects || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">English Projeler</span>
                      <span className="text-sm font-medium text-gray-900">
                        {stats.comProjects || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Kullanıcı ara (ad, soyad, email, numara)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tüm Roller</option>
                  <option value="student">Öğrenci</option>
                  <option value="teacher">Öğretim Üyesi</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kullanıcı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ders Kodu
                        </th>
                       
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      İşlemler 
    </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.firstName[0]}{user.lastName[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                {user.studentNumber && (
                                  <div className="text-sm text-gray-500">#{user.studentNumber}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                              {getRoleText(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.courseCode || user.department || '-'}
                          </td>
                         

                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            
                              <button
    onClick={() => {
      setSelectedUser(user);
      setShowEditUserModal(true);
    }}
    className="text-blue-600 hover:text-blue-900"
    title="Düzenle"
  >
    <Edit className="h-5 w-5" />
  </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      {searchTerm || roleFilter !== 'all' ? 'Kullanıcı bulunamadı' : 'Henüz kullanıcı yok'}
                    </h3>
                    <p className="mt-2 text-gray-500">
                      {searchTerm || roleFilter !== 'all' 
                        ? 'Farklı arama terimleri veya filtreler deneyebilirsiniz.'
                        : 'Yeni kullanıcı eklemek için "Kullanıcı Ekle" butonuna tıklayın.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onSubmit={handleCreateUser}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showExcelModal && (
        <ExcelUploadModal
          onSubmit={handleExcelUpload}
          onClose={() => setShowExcelModal(false)}
        />
      )}

      {showStudentsModal && (
        <StudentsListModal
          students={studentsData}
          onClose={() => setShowStudentsModal(false)}
        />
      )}

        {showReviewDeadlineModal && (
        <ReviewDeadlineUpdateModal
          currentDeadline={reviewDeadline}
          onUpdate={handleReviewDeadlineUpdate}
          onClose={() => setShowReviewDeadlineModal(false)}
        />
      )}

      {showTeachersModal && (
        <TeachersListModal
          teachers={teachersData}
          onClose={() => setShowTeachersModal(false)}
        />
      )}

      {showProjectsModal && (
        <ProjectsListModal
          projects={projectsData}
          onClose={() => setShowProjectsModal(false)}
        />
      )}

         {showPendingApplicationsModal && (
        <PendingApplicationsModal
          applications={pendingApplications}
          onClose={() => setShowPendingApplicationsModal(false)}
        />
      )}

      {showDeadlineModal && (
        <DeadlineUpdateModal
          currentDeadline={deadline}
          onUpdate={handleDeadlineUpdate}
          onClose={() => setShowDeadlineModal(false)}
        />
      )}

      {showEditUserModal && selectedUser && (
  <EditUserModal
    user={selectedUser}
    onSubmit={handleUpdateUser}
    onClose={() => {
      setShowEditUserModal(false);
      setSelectedUser(null);
    }}
  />
)}

    </div>

    
  );
};

export default AdminDashboard;