import apiClient from '@/services/api/apiClient';
import { ROOM_ENDPOINTS, ROOM_TYPE_ENDPOINTS, AMENITY_ENDPOINTS } from '@/services/api/endpoints';

/**
 * Room Service - Handles room-related API calls
 */
const roomService = {
  /**
   * Get all rooms
   */
  getRooms: async (params = {}) => {
    const response = await apiClient.get(ROOM_ENDPOINTS.LIST, { params });
    return response.data;
  },

  /**
   * Get room by ID
   */
  getRoomById: async (id) => {
    const response = await apiClient.get(ROOM_ENDPOINTS.DETAIL(id));
    return response.data;
  },

  /**
   * Search rooms with filters
   */
 searchRooms: async (searchParams) => {
  console.log('🌐 Appel API searchRooms vers:', ROOM_ENDPOINTS.SEARCH);
  console.log('🌐 Méthode: POST');
  console.log('🌐 Params:', searchParams);
  const response = await apiClient.post(ROOM_ENDPOINTS.SEARCH, searchParams);
  return response.data;
},

  /**
   * Check room availability
   */
  checkAvailability: async (checkIn, checkOut) => {
    const response = await apiClient.post(ROOM_ENDPOINTS.CHECK_AVAILABILITY, {
      check_in: checkIn,
      check_out: checkOut,
    });
    return response.data;
  },

  /**
   * Get room types
   */
  getRoomTypes: async () => {
    const response = await apiClient.get(ROOM_TYPE_ENDPOINTS.LIST);
    return response.data;
  },

  /**
   * Get amenities
   */
  getAmenities: async (params = {}) => {
    const response = await apiClient.get(AMENITY_ENDPOINTS.LIST, { params });
    return response.data;
  },

  /**
   * Get room statistics (Admin)
   */
  getRoomStatistics: async () => {
    const response = await apiClient.get(ROOM_ENDPOINTS.STATISTICS);
    return response.data;
  },
};

export default roomService;