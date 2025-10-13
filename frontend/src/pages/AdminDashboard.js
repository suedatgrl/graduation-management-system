import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import CreateUserModal from '../components/CreateUserModal';
import ExcelUploadModal from '../components/ExcelUploadModal';
import { Users, BookOpen, Clock, Plus, Upload, Search, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllUsers()
      ]);
      
      setStats(statsData);
      setUsers(usersData);
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
        user.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.schoolNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async (userData) => {
    try {
      if (userData.role === 1) {
        await adminService.createStudent(userData);
      } else {
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

  const getRoleText = (role) => {
    switch (role) {
      case 1: return 'Öğrenci';
      case 2: return 'Öğretmen';
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
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
                  <div className="flex items-center">
                    <Users className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-blue-100">Toplam Öğrenci</p>
                      <p className="text-2xl font-bold">{stats.totalStudents || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
                  <div className="flex items-center">
                    <Users className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-green-100">Toplam Öğretmen</p>
                      <p className="text-2xl font-bold">{stats.totalTeachers || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-purple-100">Toplam Proje</p>
                      <p className="text-2xl font-bold">{stats.totalProjects || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Kurs Dağılımı</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm text-gray-700">BLM (Türkçe) Kursları</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {stats.blmStudents || 0} öğrenci
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm text-gray-700">COM (English) Kursları</span>
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
                      <span className="text-sm text-gray-700">Aktif Projeler</span>
                      <span className="text-sm font-medium text-gray-900">
                        {stats.activeProjects || 0}
                      </span>
                    </div>
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
                  <option value="teacher">Öğretmen</option>
                  <option value="admin">Admin</option>
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
                          Kurs/Departman
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {user.isActive ? (
                                <ToggleRight className="h-5 w-5" />
                              ) : (
                                <ToggleLeft className="h-5 w-5" />
                              )}
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
    </div>
  );
};

export default AdminDashboard;