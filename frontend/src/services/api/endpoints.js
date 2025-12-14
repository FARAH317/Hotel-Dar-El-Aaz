/**
 * API Endpoints
 */

// Auth
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  LOGOUT: '/auth/logout/',
  REFRESH: '/auth/token/refresh/',
  ME: '/users/me/',
  UPDATE_PROFILE: '/users/me/update/',
  CHANGE_PASSWORD: '/users/me/change-password/',
};

// Rooms
export const ROOM_ENDPOINTS = {
  LIST: '/rooms/',
  DETAIL: (id) => `/rooms/${id}/`,
  SEARCH: '/rooms/search/',
  CHECK_AVAILABILITY: '/rooms/check-availability/',
  STATISTICS: '/rooms/statistics/',
  CHANGE_STATUS: (id) => `/rooms/${id}/change-status/`,
};

// Room Types
export const ROOM_TYPE_ENDPOINTS = {
  LIST: '/room-types/',
  DETAIL: (id) => `/room-types/${id}/`,
};

// Amenities
export const AMENITY_ENDPOINTS = {
  LIST: '/amenities/',
  DETAIL: (id) => `/amenities/${id}/`,
};

// Reservations
export const RESERVATION_ENDPOINTS = {
  LIST: '/reservations/',
  DETAIL: (id) => `/reservations/${id}/`,
  CREATE: '/reservations/',
  MY_RESERVATIONS: '/reservations/my-reservations/',
  CONFIRM: (id) => `/reservations/${id}/confirm/`,
  CANCEL: (id) => `/reservations/${id}/cancel/`,
  CHECK_IN: (id) => `/reservations/${id}/check-in/`,
  CHECK_OUT: (id) => `/reservations/${id}/check-out/`,
  APPLY_DISCOUNT: (id) => `/reservations/${id}/apply-discount/`,
  UPCOMING: '/reservations/upcoming/',
  TODAYS_CHECKINS: '/reservations/todays-checkins/',
  TODAYS_CHECKOUTS: '/reservations/todays-checkouts/',
  STATISTICS: '/reservations/statistics/',
};

// Payments
export const PAYMENT_ENDPOINTS = {
  LIST: '/payments/',
  DETAIL: (id) => `/payments/${id}/`,
  CREATE: '/payments/',
  MY_PAYMENTS: '/payments/my-payments/',
  PROCESS: (id) => `/payments/${id}/process/`,
  REFUND: (id) => `/payments/${id}/refund/`,
  BY_RESERVATION: (reservationId) => `/payments/by-reservation/${reservationId}/`,
  STATISTICS: '/payments/statistics/',
};

// Invoices
export const INVOICE_ENDPOINTS = {
  LIST: '/invoices/',
  DETAIL: (id) => `/invoices/${id}/`,
  CREATE_FOR_RESERVATION: '/invoices/create-for-reservation/',
  BY_RESERVATION: (reservationId) => `/invoices/by-reservation/${reservationId}/`,
};

// Notifications
export const NOTIFICATION_ENDPOINTS = {
  LIST: '/notifications/',
  DETAIL: (id) => `/notifications/${id}/`,
  UNREAD: '/notifications/unread/',
  MARK_AS_READ: (id) => `/notifications/${id}/mark-as-read/`,
  MARK_ALL_AS_READ: '/notifications/mark-all-as-read/',
  COUNT: '/notifications/count/',
  BY_TYPE: (type) => `/notifications/by-type/${type}/`,
};