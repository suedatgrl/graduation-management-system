import React, { useState, useEffect } from 'react';
import projectService from '../services/projectService';
import { X, User, Calendar, CheckCircle, XCircle, Clock, Eye, MessageCircle } from 'lucide-react';

const ApplicationsModal = ({ project, onClose }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (project?.id) {
      fetchApplications();
    }
  }, [project?.id]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjectApplications(project.id);
      console.log('Applications fetched:', data);
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (applicationId, status, reviewNotes = '') => {
    try {
      setReviewLoading(true);
      console.log('Reviewing application:', applicationId, 'with status:', status);
      
      await projectService.reviewApplication(applicationId, status, reviewNotes);
      await fetchApplications(); // Refresh applications
      setSelectedApplication(null);
      
      const statusText = status === 2 ? 'onaylandı' : 'reddedildi';
      alert(`Başvuru başarıyla ${statusText}!`);
    } catch (error) {
      console.error('Error reviewing application:', error);
      alert('Başvuru değerlendirilirken bir hata oluştu!');
    } finally {
      setReviewLoading(false);
    }
  };

  // Status yardımcı fonksiyonları
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
    case 1: // Pending
    case 'Pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 2: // Approved
    case 'Approved':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 3: // Rejected
    case 'Rejected':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
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
      return 'Bilinmeyen';
  }
};

// getStatusColor fonksiyonunu güncelleyin:
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


const isPendingStatus = (status) => {
  const normalizedStatus = normalizeStatus(status);
  return normalizedStatus === 1 || status === 'Pending';
};

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Başvurular yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Proje Başvuruları</h3>
            <p className="text-sm text-gray-600 mt-1">{project?.title}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span className="text-blue-600">
                📊 Toplam Başvuru: {applications.length}
              </span>
              <span className="text-yellow-600">
                ⏳ Beklemede: {applications.filter(app => isPendingStatus(app.status)).length}
              </span>
              <span className="text-green-600">
                ✅ Onaylanan: {applications.filter(app => normalizeStatus(app.status) === 2).length}
              </span>
              <span className="text-red-600">
                ❌ Reddedilen: {applications.filter(app => normalizeStatus(app.status) === 3).length}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Applications List */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {application.student?.firstName} {application.student?.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{application.student?.email}</p>
                        {application.student?.studentNumber && (
                          <p className="text-sm text-gray-500">Öğrenci No: {application.student.studentNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(application.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Başvuru Tarihi: {new Date(application.appliedAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    {application.reviewedAt && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Değerlendirme Tarihi: {new Date(application.reviewedAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    )}
                  </div>

                  {application.reviewNotes && (
                    <div className="mb-4">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <div className="flex items-start">
                          <MessageCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Değerlendirme Notu:</p>
                            <p className="text-sm text-blue-700 mt-1">{application.reviewNotes}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - Sadece beklemedeki başvurular için */}
                  {isPendingStatus(application.status) && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        disabled={reviewLoading}
                      >
                        <Eye className="h-4 w-4" />
                        <span>Detaylı Değerlendir</span>
                      </button>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleReviewApplication(application.id, 1)} // Approve
                          disabled={reviewLoading}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Hızlı Onayla</span>
                        </button>
                        <button
                          onClick={() => handleReviewApplication(application.id, 2)} // Reject
                          disabled={reviewLoading}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Hızlı Reddet</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Henüz başvuru yok</h3>
              <p className="text-gray-500">Bu projeye henüz kimse başvurmamış.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Toplam {applications.length} başvuru • 
              {applications.filter(app => isPendingStatus(app.status)).length} beklemede
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>

        {/* Review Modal */}
        {selectedApplication && (
          <ReviewApplicationModal
            application={selectedApplication}
            onSubmit={handleReviewApplication}
            onClose={() => setSelectedApplication(null)}
            loading={reviewLoading}
          />
        )}
      </div>
    </div>
  );
};

// Detaylı değerlendirme modalı
const ReviewApplicationModal = ({ application, onSubmit, onClose, loading }) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [decision, setDecision] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (decision !== null) {
      onSubmit(application.id, decision, reviewNotes.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Başvuru Değerlendirme</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900">
              {application.student?.firstName} {application.student?.lastName}
            </h4>
            <p className="text-sm text-gray-600">
              <strong>{application.student?.firstName} {application.student?.lastName}</strong> tarafından yapılan başvuruyu değerlendirin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Karar *
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    value={1}
                    checked={decision === 1}
                    onChange={(e) => setDecision(parseInt(e.target.value))}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <CheckCircle className="h-5 w-5 text-green-600 mx-3" />
                  <span className="text-sm font-medium text-gray-900">Onayla</span>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    value={2}
                    checked={decision === 2}
                    onChange={(e) => setDecision(parseInt(e.target.value))}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <XCircle className="h-5 w-5 text-red-600 mx-3" />
                  <span className="text-sm font-medium text-gray-900">Reddet</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Değerlendirme Notu (İsteğe bağlı)
              </label>
              <textarea
                id="reviewNotes"
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kararınızın gerekçesini yazabilirsiniz..."
              />
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                disabled={!decision || loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Değerlendiriliyor...
                  </>
                ) : (
                  'Değerlendirmeyi Kaydet'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsModal;