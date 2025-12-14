import apiClient from '@/services/api/apiClient';
import { PAYMENT_ENDPOINTS, INVOICE_ENDPOINTS } from '@/services/api/endpoints';

/**
 * Payment Service - Handles payment-related API calls
 */
const paymentService = {
  /**
   * Get all payments
   */
  getPayments: async (params = {}) => {
    const response = await apiClient.get(PAYMENT_ENDPOINTS.LIST, { params });
    return response.data;
  },

  /**
   * Get my payments
   */
  getMyPayments: async (params = {}) => {
    const response = await apiClient.get(PAYMENT_ENDPOINTS.MY_PAYMENTS, { params });
    return response.data;
  },

  /**
   * Get payment by ID
   */
  getPaymentById: async (id) => {
    const response = await apiClient.get(PAYMENT_ENDPOINTS.DETAIL(id));
    return response.data;
  },

  /**
   * Create payment
   */
  createPayment: async (paymentData) => {
    const response = await apiClient.post(PAYMENT_ENDPOINTS.CREATE, paymentData);
    return response.data;
  },

  /**
   * Process payment
   */
  processPayment: async (id, paymentData) => {
    const response = await apiClient.post(PAYMENT_ENDPOINTS.PROCESS(id), paymentData);
    return response.data;
  },

  /**
   * Get payments by reservation
   */
  getPaymentsByReservation: async (reservationId) => {
    const response = await apiClient.get(PAYMENT_ENDPOINTS.BY_RESERVATION(reservationId));
    return response.data;
  },

  /**
   * Get payment statistics (Admin)
   */
  getStatistics: async (params = {}) => {
    const response = await apiClient.get(PAYMENT_ENDPOINTS.STATISTICS, { params });
    return response.data;
  },

  /**
   * Get invoices
   */
  getInvoices: async (params = {}) => {
    const response = await apiClient.get(INVOICE_ENDPOINTS.LIST, { params });
    return response.data;
  },

  /**
   * Get invoice by reservation
   */
  getInvoiceByReservation: async (reservationId) => {
    const response = await apiClient.get(INVOICE_ENDPOINTS.BY_RESERVATION(reservationId));
    return response.data;
  },

  /**
   * Create invoice for reservation
   */
  createInvoice: async (reservationId) => {
    const response = await apiClient.post(INVOICE_ENDPOINTS.CREATE_FOR_RESERVATION, {
      reservation_id: reservationId,
    });
    return response.data;
  },
};

export default paymentService;