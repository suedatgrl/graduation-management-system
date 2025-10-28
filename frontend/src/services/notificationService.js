import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class NotificationService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

  async getMyNotifications() {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getUnreadCount() {
    const response = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: this.getAuthHeaders()
    });
    return response.data.count;
  }

  async markAsRead(notificationId) {
    const response = await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async markAllAsRead() {
    const response = await axios.put(
      `${API_URL}/notifications/read-all`,
      {},
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async deleteNotification(notificationId) {
    const response = await axios.delete(
      `${API_URL}/notifications/${notificationId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async createQuotaAlert(projectId) {
    const response = await axios.post(
      `${API_URL}/notifications/quota-alert/${projectId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async removeQuotaAlert(projectId) {
    const response = await axios.delete(
      `${API_URL}/notifications/quota-alert/${projectId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }


  async testDeadlineWarnings() {
    const response = await axios.post(
      `${API_URL}/notifications/test/deadline-warnings`,
      {},
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async testQuotaAlerts() {
    const response = await axios.post(
      `${API_URL}/notifications/test/quota-alerts`,
      {},
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getDeadlineInfo() {
    const response = await axios.get(
      `${API_URL}/notifications/test/deadline-info`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async triggerDeadlineCheck() {
  const response = await axios.post(
    `${API_URL}/notifications/trigger-deadline-check`,
    {},
    { headers: this.getAuthHeaders() }
  );
  return response.data;
}

async testReviewDeadlineWarnings() {
  const response = await axios.post(
    `${API_URL}/notifications/test/review-deadline-warnings`,
    {},
    { headers: this.getAuthHeaders() }
  );
  return response.data;
}

async getReviewDeadlineInfo() {
  const response = await axios.get(
    `${API_URL}/notifications/test/review-deadline-info`,
    { headers: this.getAuthHeaders() }
  );
  return response.data;
}
}

export default new NotificationService();