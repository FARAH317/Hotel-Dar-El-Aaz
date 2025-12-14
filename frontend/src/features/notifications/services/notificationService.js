import apiClient from '@/services/api/apiClient'; // ✅ Utiliser apiClient au lieu d'axios

const notificationService = {
  getNotifications: () => apiClient.get('/notifications/'),
  
  getUnreadNotifications: () => apiClient.get('/notifications/unread/'),
  
  getNotificationCounts: () => apiClient.get('/notifications/count/'),
  
  markAsRead: (id) => apiClient.post(`/notifications/${id}/mark-as-read/`),
  
  markAllAsRead: () => apiClient.post('/notifications/mark-all-as-read/'),
  
  getNotificationsByType: (type) => apiClient.get(`/notifications/by-type/${type}/`)
};

export default notificationService;