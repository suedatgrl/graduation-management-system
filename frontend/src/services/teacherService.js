
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class TeacherService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  }

  async getAllTeachers() {
    const response = await axios.get(`${API_URL}/teachers`, this.getAuthHeaders());
    return response.data;
  }

  async getTeacherProjects(teacherId) {
    const response = await axios.get(`${API_URL}/teachers/${teacherId}/projects`, this.getAuthHeaders());
    return response.data;
  }
}

export default new TeacherService();