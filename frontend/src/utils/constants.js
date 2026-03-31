// API Base URL
// Pour le déploiement Render : https://hotel-dar-el-aaz.onrender.com/api
// Valeur par défaut de production (fallback) : héberge sur Render
export const API_URL = import.meta.env.VITE_API_URL || 'https://hotel-dar-el-aaz.onrender.com/api';

// App Info
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Hôtel Dar El Aaz';

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};

// Reservation Status
export const RESERVATION_STATUS = {
  PENDING: { value: 'PENDING', label: 'En attente', color: 'warning' },
  CONFIRMED: { value: 'CONFIRMED', label: 'Confirmée', color: 'info' },
  CHECKED_IN: { value: 'CHECKED_IN', label: 'Check-in effectué', color: 'success' },
  CHECKED_OUT: { value: 'CHECKED_OUT', label: 'Check-out effectué', color: 'secondary' },
  CANCELLED: { value: 'CANCELLED', label: 'Annulée', color: 'danger' },
  NO_SHOW: { value: 'NO_SHOW', label: 'Client absent', color: 'dark' },
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: { value: 'PENDING', label: 'En attente', color: 'warning' },
  PROCESSING: { value: 'PROCESSING', label: 'En traitement', color: 'info' },
  COMPLETED: { value: 'COMPLETED', label: 'Complété', color: 'success' },
  FAILED: { value: 'FAILED', label: 'Échoué', color: 'danger' },
  REFUNDED: { value: 'REFUNDED', label: 'Remboursé', color: 'secondary' },
  CANCELLED: { value: 'CANCELLED', label: 'Annulé', color: 'dark' },
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: { value: 'CASH', label: 'Espèces' },
  CREDIT_CARD: { value: 'CREDIT_CARD', label: 'Carte de crédit' },
  DEBIT_CARD: { value: 'DEBIT_CARD', label: 'Carte de débit' },
  STRIPE: { value: 'STRIPE', label: 'Stripe' },
  PAYPAL: { value: 'PAYPAL', label: 'PayPal' },
  BANK_TRANSFER: { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
  CCP: { value: 'CCP', label: 'CCP' },
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CLIENT: 'CLIENT',
};

// Room Status
export const ROOM_STATUS = {
  AVAILABLE: { value: 'AVAILABLE', label: 'Disponible', color: 'success' },
  OCCUPIED: { value: 'OCCUPIED', label: 'Occupée', color: 'danger' },
  MAINTENANCE: { value: 'MAINTENANCE', label: 'En maintenance', color: 'warning' },
  CLEANING: { value: 'CLEANING', label: 'En nettoyage', color: 'info' },
  OUT_OF_SERVICE: { value: 'OUT_OF_SERVICE', label: 'Hors service', color: 'dark' },
};

// Date Format
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;