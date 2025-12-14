import apiClient from '@/services/api/apiClient';
import { 
  RESERVATION_ENDPOINTS, 
  PAYMENT_ENDPOINTS, 
  ROOM_ENDPOINTS 
} from '@/services/api/endpoints';

/**
 * Dashboard Service - Aggregates data for dashboard
 */
const dashboardService = {
  /**
   * Get dashboard overview stats
   */
  getDashboardStats: async () => {
    const [reservationStats, paymentStats, roomStats] = await Promise.all([
      apiClient.get(RESERVATION_ENDPOINTS.STATISTICS),
      apiClient.get(PAYMENT_ENDPOINTS.STATISTICS),
      apiClient.get(ROOM_ENDPOINTS.STATISTICS),
    ]);

    return {
      reservations: reservationStats.data,
      payments: paymentStats.data,
      rooms: roomStats.data,
    };
  },

  /**
   * Get today's check-ins
   */
  getTodaysCheckIns: async () => {
    const response = await apiClient.get(RESERVATION_ENDPOINTS.TODAYS_CHECKINS);
    return response.data;
  },

  /**
   * Get today's check-outs
   */
  getTodaysCheckOuts: async () => {
    const response = await apiClient.get(RESERVATION_ENDPOINTS.TODAYS_CHECKOUTS);
    return response.data;
  },

  /**
   * Get upcoming reservations
   */
  getUpcomingReservations: async (days = 7) => {
    const response = await apiClient.get(RESERVATION_ENDPOINTS.UPCOMING, {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get recent reservations
   */
  getRecentReservations: async (limit = 10) => {
    const response = await apiClient.get(RESERVATION_ENDPOINTS.LIST, {
      params: { page_size: limit },
    });
    return response.data;
  },
};

export default dashboardService;