import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell'; 
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home,
  User,
  GraduationCap,
  Shield
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    const items = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        current: location.pathname === '/dashboard'
      }
    ];

    if (user?.role === 1) { // Student
      items.push(
        {
          name: 'Projeler',
          href: '/dashboard',
          icon: BookOpen,
          current: location.pathname === '/dashboard'
        }
      );
    } else if (user?.role === 2) { // Teacher
      items.push(
        {
          name: 'Projelerim',
          href: '/dashboard',
          icon: BookOpen,
          current: location.pathname === '/dashboard'
        }
      );
    } else if (user?.role === 3) { // Admin
      items.push(
        {
          name: 'Kullanıcı Yönetimi',
          href: '/dashboard',
          icon: Users,
          current: location.pathname === '/dashboard'
        }
      );
    }

    items.push(
      {
        name: 'Ayarlar',
        href: '/settings',
        icon: Settings,
        current: location.pathname === '/settings'
      }
    );

    return items;
  };

  const navigationItems = getNavigationItems();

  const getRoleIcon = (role) => {
    switch (role) {
      case 1: return GraduationCap;
      case 2: return User;
      case 3: return Shield;
      default: return User;
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 1: return 'Öğrenci';
      case 2: return 'Öğretim Üyesi';
      case 3: return 'Admin';
      default: return 'Kullanıcı';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 1: return 'bg-blue-100 text-blue-600';
      case 2: return 'bg-green-100 text-green-600';
      case 3: return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const RoleIcon = getRoleIcon(user?.role);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent
              navigationItems={navigationItems}
              user={user}
              onLogout={handleLogout}
              RoleIcon={RoleIcon}
              getRoleText={getRoleText}
              getRoleColor={getRoleColor}
            />
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent
            navigationItems={navigationItems}
            user={user}
            onLogout={handleLogout}
            RoleIcon={RoleIcon}
            getRoleText={getRoleText}
            getRoleColor={getRoleColor}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                Bitirme Projeleri Yönetim Sistemi
              </h1>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-3">
                <div><NotificationBell /></div>
                 <div className={`p-2 rounded-full ${getRoleColor(user?.role)}`}>
                  
                  <RoleIcon className="h-5 w-5" />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{getRoleText(user?.role)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigationItems, user, onLogout, RoleIcon, getRoleText, getRoleColor }) => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-blue-600">
        <BookOpen className="h-8 w-8 text-white" />
        <span className="ml-2 text-white font-bold text-lg">BPYS</span>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-2 rounded-full ${getRoleColor(user?.role)}`}>
            <RoleIcon className="h-6 w-6" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-sm text-gray-500">{getRoleText(user?.role)}</div>
            {user?.courseCode && (
              <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                user.courseCode.startsWith('BLM') ? 'course-blm' : 'course-com'
              }`}>
                {user.courseCode}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                item.current
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`mr-3 flex-shrink-0 h-6 w-6 ${
                  item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default Layout;