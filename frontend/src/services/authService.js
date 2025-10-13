import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AuthService {
  async login(credentials) {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  }

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async forgotPassword(email) {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  }

  async resetPassword(token, newPassword) {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      newPassword
    });
    return response.data;
  }

  async changePassword(currentPassword, newPassword) {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/users/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}

export default new AuthService();