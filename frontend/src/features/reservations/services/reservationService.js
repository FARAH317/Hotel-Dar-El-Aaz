import apiClient from '@/services/api/apiClient';
import { RESERVATION_ENDPOINTS } from '@/services/api/endpoints';

/**
 * Reservation Service - Handles reservation-related API calls
 */
const reservationService = {
  /**
   * Get all reservations
   */
  getReservations: async (params = {}) => {
    const response = await apiClient.get(RESERVATION_ENDPOINTS.LIST, { params });
    return response.data;
  },

  /**
   * Get reservation by ID
   */
  getReservationById: async (id) => {
    const response = await apiClient.get(RESERVATION_ENDPOINTS.DETAIL(id));
    return response.data;
  },

  /**
   * Get my reservations
   */
  getMyReservations: async (params = {}) => {
    const response = await apiClient.get(RESERVATION_ENDPOINTS.MY_RESERVATIONS, { params });
    return response.data;
  },

  /**
   * Create reservation
   */
  createReservation: async (reservationData) => {
    const response = await apiClient.post(RESERVATION_ENDPOINTS.CREATE, reservationData);
    return response.data;
  },

  /**
   * Update reservation
   */
  updateReservation: async (id, reservationData) => {
    const response = await apiClient.put(RESERVATION_ENDPOINTS.DETAIL(id), reservationData);
    return response.data;
  },

  /**
   * Confirm reservation
   */
  confirmReservation: async (id) => {
    const response = await apiClient.post(RESERVATION_ENDPOINTS.CONFIRM(id));
    return response.data;
  },

  /**
   * Cancel reservation - CORRIGÉ
   */
  cancelReservation: async (id, reason = '') => {
    try {
      console.log('📤 Service - Annulation réservation:', { 
        id, 
        reason,
        endpoint: RESERVATION_ENDPOINTS.CANCEL(id)
      });
      
      // IMPORTANT: Le backend Django attend probablement juste "reason"
      // Envoyons un objet simple
      const payload = reason ? { reason } : {};
      
      console.log('📦 Payload envoyé:', payload);
      
      const response = await apiClient.post(RESERVATION_ENDPOINTS.CANCEL(id), payload);
      
      console.log('✅ Service - Réponse backend:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Service - Erreur annulation:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        sentData: error.config?.data
      });
      
      throw error;
    }
  },

  /**
   * Check-in reservation (Admin)
   */
  checkInReservation: async (id) => {
    const response = await apiClient.post(RESERVATION_ENDPOINTS.CHECK_IN(id));
    return response.data;
  },

  /**
   * Check-out reservation (Admin)
   */
  checkOutReservation: async (id) => {
    const response = await apiClient.post(RESERVATION_ENDPOINTS.CHECK_OUT(id));
    return response.data;
  },

  /**
   * Get reservation statistics (Admin)
   */
  getStatistics: async (params = {}) => {
    const response = await apiClient.get(RESERVATION_ENDPOINTS.STATISTICS, { params });
    return response.data;
  },
};

export default reservationService;