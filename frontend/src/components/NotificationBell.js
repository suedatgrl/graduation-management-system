import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import notificationService from '../services/notificationService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Dropdown dışına tıklama
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Okunmamış bildirim sayısı alınamadı:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenemedi:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Tüm bildirimler işaretlenemedi:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      await fetchUnreadCount();
    } catch (error) {
      console.error('Bildirim silinemedi:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 1: // ApplicationApproved
        return '';
      case 2: // ApplicationRejected
        return '';
      case 3: // DeadlineWarning
        return '';
      case 4: // QuotaAvailable
        return '';
      default:
        return '';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 1: // ApplicationApproved
        return 'bg-green-50 border-green-200';
      case 2: // ApplicationRejected
        return 'bg-red-50 border-red-200';
      case 3: // DeadlineWarning
        return 'bg-orange-50 border-orange-200';
      case 4: // QuotaAvailable
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleBellClick = async () => {
  if (!showDropdown) {
    try {
      // Manuel deadline kontrolü tetikle
      console.log('🔔 Deadline kontrolü tetikleniyor...');
      await notificationService.triggerDeadlineCheck();
      console.log('✅ Deadline kontrolü tamamlandı');
    } catch (error) {
      console.error('Deadline kontrolü hatası:', error);
    }
    
    // Bildirimleri çek
    await fetchNotifications();
    
    // Okunmamış sayısını güncelle
    await fetchUnreadCount();
  }
  setShowDropdown(!showDropdown);
};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-white" />
              <h3 className="text-lg font-bold text-white">Bildirimler</h3>
              {unreadCount > 0 && (
                <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount} yeni
                </span>
              )}
            </div>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Tümünü Okundu İşaretle</span>
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bell className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500 font-medium">Bildirim yok</p>
                <p className="mt-1 text-sm text-gray-400">Yeni bildirimler burada görünecek</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <span className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            {notification.relatedProjectTitle && (
                              <p className="text-xs text-blue-600 mt-2 font-medium">
                                📚 {notification.relatedProjectTitle}
                              </p>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Okundu işaretle"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;