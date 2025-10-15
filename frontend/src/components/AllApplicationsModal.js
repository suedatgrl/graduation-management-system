import React, { useState, useEffect } from 'react';
import projectService from '../services/projectService';
import { X, User, Calendar, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

const AllApplicationsModal = ({ projects, onClose }) => {
  const [allApplicationsData, setAllApplicationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchAllApplications();
  }, [projects]);

  const fetchAllApplications = async () => {
    try {
      setLoading(true);
      const applicationsWithProjects = [];

      for (const project of projects) {
        const applications = await projectService.getProjectApplications(project.id);
        if (applications.length > 0) {
          applicationsWithProjects.push({
            project,
            applications
          });
        }
      }

      setAllApplicationsData(applicationsWithProjects);
    } catch (error) {
      console.error('Error fetching all applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (applicationId, status, reviewNotes = '') => {
    try {
      setReviewLoading(true);
      await projectService.reviewApplication(applicationId, status, reviewNotes);
      await fetchAllApplications(); // Refresh applications
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error reviewing application:', error);
      alert('Başvuru değerlendirilirken hata oluştu!');
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 1: return <Clock className="h-5 w-5 text-yellow-500" />;
      case 2: return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 3: return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Beklemede';
      case 2: return 'Onaylandı';
      case 3: return 'Reddedildi';
      default: return 'Bilinmeyen';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-green-100 text-green-800';
      case 3: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalApplications = allApplicationsData.reduce((sum, item) => sum + item.applications.length, 0);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Tüm Proje Başvuruları
            </h3>
            <p className="text-sm text-gray-600">
              Toplam {totalApplications} başvuru • {allApplicationsData.length} proje
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-6">
          {allApplicationsData.length > 0 ? (
            allApplicationsData.map((item) => (
              <div key={item.project.id} className="border border-gray-200 rounded-lg p-4">
                {/* Proje Başlığı */}
                <div className="border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {item.project.title}
                      </h4>
                      <div className="flex items-center mt-1 space-x-3 text-sm text-gray-500">
                        <span>Kurs: {item.project.courseCode}</span>
                        <span>•</span>
                        <span>{item.applications.length} başvuru</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Başvurular */}
                <div className="space-y-3">
                  {item.applications.map((application) => (
                    <div key={application.id} className="bg-gray-50 rounded-lg p-3 border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">
                              {application.student?.firstName} {application.student?.lastName}
                            </h5>
                            <p className="text-xs text-gray-500">{application.student?.email}</p>
                            {application.student?.studentNumber && (
                              <p className="text-xs text-gray-500">#{application.student?.studentNumber}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(application.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {getStatusText(application.status)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 ml-11">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Başvuru Tarihi: {new Date(application.appliedAt).toLocaleDateString('tr-TR')}</span>
                          </div>

                          {/* Action Buttons - Sadece beklemedeki başvurular için */}
                          {application.status === 2 && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedApplication(application)}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors flex items-center space-x-1"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Değerlendir</span>
                              </button>
                              <button
                                onClick={() => handleReviewApplication(application.id, 2)}
                                disabled={reviewLoading}
                                className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors flex items-center space-x-1 disabled:opacity-50"
                              >
                                <CheckCircle className="h-3 w-3" />
                                <span>Onayla</span>
                              </button>
                              <button
                                onClick={() => handleReviewApplication(application.id, 3)}
                                disabled={reviewLoading}
                                className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors flex items-center space-x-1 disabled:opacity-50"
                              >
                                <XCircle className="h-3 w-3" />
                                <span>Reddet</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Henüz başvuru yok</h3>
              <p className="mt-2 text-gray-500">Projelerinize henüz kimse başvurmamış.</p>
            </div>
          )}
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

// Review Modal Component
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-60">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Başvuru Değerlendirmesi
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <strong>{application.student?.firstName} {application.student?.lastName}</strong> tarafından yapılan başvuruyu değerlendirin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Karar *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value={2}
                  checked={decision === 2}
                  onChange={(e) => setDecision(parseInt(e.target.value))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-900">Onayla</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value={3}
                  checked={decision === 3}
                  onChange={(e) => setDecision(parseInt(e.target.value))}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-900">Reddet</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Değerlendirme Notu (İsteğe bağlı)
            </label>
            <textarea
              id="reviewNotes"
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kararınızla ilgili açıklama yazabilirsiniz..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || decision === null}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Değerlendirmeyi Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllApplicationsModal;