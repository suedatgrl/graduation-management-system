import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ProjectService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

async getProjects(courseCode = null) {
    try {
      const params = courseCode ? { courseCode } : {};
      const response = await axios.get(`${API_URL}/projects`, {
        params,
        headers: this.getAuthHeaders()
      });
      console.log('Projects fetched:', response.data); // Debug için
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProjectById(id) {
    const response = await axios.get(`${API_URL}/projects/${id}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async createProject(projectData) {
    const response = await axios.post(`${API_URL}/projects/create-project`, projectData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async updateProject(id, projectData) {
    const response = await axios.put(`${API_URL}/projects/${id}`, projectData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async deleteProject(id) {
    const response = await axios.delete(`${API_URL}/projects/${id}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getTeacherProjects() {
    const response = await axios.get(`${API_URL}/projects/my`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async applyToProject(projectId) {
    const response = await axios.post(`${API_URL}/applications/apply-project`, {
      projectId,
    }, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getMyApplications() {
    const response = await axios.get(`${API_URL}/applications/my`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getProjectApplications(projectId) {
    const response = await axios.get(`${API_URL}/applications/project/${projectId}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async reviewApplication(applicationId, status, reviewNotes) {
    const response = await axios.post(`${API_URL}/applications/${applicationId}/review`, {
      status,
      reviewNotes
    }, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }
}

export default new ProjectService();