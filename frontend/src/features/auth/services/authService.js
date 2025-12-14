import apiClient from '@/services/api/apiClient';
import { AUTH_ENDPOINTS } from '@/services/api/endpoints';
import { STORAGE_KEYS } from '@/utils/constants';

/**
 * Auth Service - Handles authentication API calls
 */
const authService = {
  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
      email,
      password,
    });
    
    const { user, tokens } = response.data;
    
    // Save tokens and user to localStorage
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    return { user, tokens };
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData);
    
    const { user, tokens } = response.data;
    
    // Save tokens and user to localStorage
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    return { user, tokens };
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (refreshToken) {
        await apiClient.post(AUTH_ENDPOINTS.LOGOUT, {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await apiClient.get(AUTH_ENDPOINTS.ME);
    const user = response.data;
    
    // Update user in localStorage
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    return user;
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    const response = await apiClient.put(AUTH_ENDPOINTS.UPDATE_PROFILE, profileData);
    const user = response.data.user;
    
    // Update user in localStorage
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    return user;
  },

  /**
   * Change password
   */
  changePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPassword,
    });
    
    return response.data;
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser: () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  },

  /**
   * Get access token
   */
  getAccessToken: () => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
};

export default authService;