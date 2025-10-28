import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, CheckCircle } from 'lucide-react';
import projectService from '../services/projectService';

const AssignStudentsModal = ({ isOpen, onClose, project, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && project) {
      fetchStudents();
    }
  }, [isOpen, project]);

  const fetchStudents = async () => {
  try {
    setLoading(true);
    
    // "BLM101" -> "BLM" yap
    let coursePrefix = project.courseCode;
    if (project.courseCode) {
      if (project.courseCode.startsWith('BLM')) {
        coursePrefix = 'BLM';
      } else if (project.courseCode.startsWith('COM')) {
        coursePrefix = 'COM';
      }
    }
    
    console.log('🔄 Fetching students for course:', coursePrefix);
    
    const data = await projectService.getAvailableStudents(coursePrefix);
    
    console.log('✅ Students fetched:', data);
    setStudents(data);
  } catch (err) {
    console.error('❌ Error fetching students:', err);
    setError('Öğrenciler yüklenemedi');
  } finally {
    setLoading(false);
  }
};

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        const availableSlots = project.maxStudents - project.currentStudents;
        if (prev.length >= availableSlots) {
          setError(`En fazla ${availableSlots} öğrenci seçebilirsiniz (kalan kontenjan).`);
          return prev;
        }
        setError('');
        return [...prev, studentId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      setError('En az bir öğrenci seçmelisiniz.');
      return;
    }

    try {
      setLoading(true);
      await projectService.assignStudentsToProject(project.id, selectedStudents);
      alert(`${selectedStudents.length} öğrenci başarıyla projeye atandı!`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Öğrenciler atanamadı');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentNumber.includes(searchTerm) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  const availableSlots = project.maxStudents - project.currentStudents;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <UserPlus className="h-6 w-6 mr-2 text-purple-600" />
              Öğrenci Ata
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {project.title} - Kalan Kontenjan: {availableSlots}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Ad, soyad, öğrenci no veya email ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {selectedStudents.length > 0 && (
            <div className="mt-3 flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg p-3">
              <span className="text-sm font-medium text-purple-900">
                {selectedStudents.length} öğrenci seçildi
              </span>
              <button
                onClick={() => setSelectedStudents([])}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Seçimi Temizle
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Students List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Yükleniyor...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Öğrenci bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  onClick={() => !student.hasApprovedProject && handleStudentToggle(student.id)}
                  className={`p-4 border rounded-lg transition-all cursor-pointer ${
                    selectedStudents.includes(student.id)
                      ? 'border-purple-500 bg-purple-50'
                      : student.hasApprovedProject
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          selectedStudents.includes(student.id)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {student.studentNumber} • {student.email}
                          </p>
                          {student.hasApprovedProject && (
                            <span className="inline-flex items-center text-xs text-green-700 mt-1">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Zaten bir projeye atanmış
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedStudents.includes(student.id) && (
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Seçilen: <strong>{selectedStudents.length}</strong> / Kalan Kontenjan: <strong>{availableSlots}</strong>
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedStudents.length === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Atanıyor...' : `${selectedStudents.length} Öğrenciyi Ata`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignStudentsModal;