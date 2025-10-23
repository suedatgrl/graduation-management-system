import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AdminService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

  async createStudent(studentData) {
    const response = await axios.post(`${API_URL}/admin/add-student`, studentData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async createTeacher(teacherData) {
    const response = await axios.post(`${API_URL}/admin/add-teacher`, teacherData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async uploadUsersFromExcel(file, userType) {
    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('userType', userType);

    const response = await axios.post(`${API_URL}/admin/bulk-upload`, formData, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async getAllUsers() {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getDashboardStats() {
    const response = await axios.get(`${API_URL}/admin/dashboard-stats`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async deleteUser(userId) {
    const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async toggleUserStatus(userId) {
    const response = await axios.put(`${API_URL}/admin/users/${userId}/toggle-status`, {}, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getStudents() {
    const response = await axios.get(`${API_URL}/admin/students`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getTeachers() {
    const response = await axios.get(`${API_URL}/admin/teachers`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getProjects() {
    const response = await axios.get(`${API_URL}/admin/projects`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getSettings() {
    const response = await axios.get(`${API_URL}/admin/settings`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async updateDeadline(newDeadline) {
    const response = await axios.put(
      `${API_URL}/admin/settings/ApplicationDeadline`,
      { value: newDeadline },
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async updateReviewDeadline(newDeadline) {
  const response = await axios.put(
    `${API_URL}/admin/settings/ReviewDeadline`,
    { value: newDeadline },
    { headers: this.getAuthHeaders() }
  );
  return response.data;
}

    async updateUser(userId, userData) {
    const response = await axios.put(
      `${API_URL}/admin/users/${userId}`,
      userData,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }


  async getPendingApplications() {
    const response = await axios.get(`${API_URL}/admin/pending-applications`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }
}



export default new AdminService();