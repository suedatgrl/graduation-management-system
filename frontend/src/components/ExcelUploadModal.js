import React, { useState } from "react";
import { X, Upload, GraduationCap, User } from "lucide-react";

const ExcelUploadModal = ({ onSubmit, onClose }) => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState(1); // 1: Student, 2: Teacher
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Lütfen bir Excel dosyası seçiniz.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(file, role);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Excel yüklenirken bir hata oluştu. Lütfen dosya formatını ve içeriğini kontrol ediniz."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Excel ile Toplu Kullanıcı Yükle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Rolü *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange(1)}
                className={`flex items-center p-3 rounded-lg border text-sm font-medium transition-all space-x-2 ${
                  role === 1
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <GraduationCap className="h-5 w-5" />
                <span>Öğrenci</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange(2)}
                className={`flex items-center p-3 rounded-lg border text-sm font-medium transition-all space-x-2 ${
                  role === 2
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <User className="h-5 w-5" />
                <span>Öğretmen</span>
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="excelFile" className="block text-sm font-medium text-gray-700 mb-1">
              Excel Dosyası *
            </label>
            <input
              type="file"
              id="excelFile"
              name="excelFile"
              accept=".xlsx, .xls"
              required
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 flex items-center space-x-2 ${loading ? "opacity-50" : ""}`}
              disabled={loading}
            >
              <Upload className="h-5 w-5" />
              <span>
                {loading ? "Yükleniyor..." : "Yükle"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExcelUploadModal;