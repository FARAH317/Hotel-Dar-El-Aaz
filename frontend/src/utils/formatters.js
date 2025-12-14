import dayjs from 'dayjs';
import { DATE_FORMAT, DATETIME_FORMAT } from './constants';

/**
 * Format currency (DZD)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date, format = DATE_FORMAT) => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * Format datetime
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '-';
  return dayjs(datetime).format(DATETIME_FORMAT);
};

/**
 * Format phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  // Format: +213 555 12 34 56
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('213')) {
    return `+213 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
  }
  return phone;
};

/**
 * Get status badge color class
 */
export const getStatusBadgeClass = (color) => {
  const colors = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    secondary: 'bg-gray-100 text-gray-800',
    dark: 'bg-gray-800 text-white',
  };
  return colors[color] || colors.secondary;
};

/**
 * Truncate text
 */
export const truncate = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Calculate nights between dates
 */
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = dayjs(checkIn);
  const end = dayjs(checkOut);
  return end.diff(start, 'day');
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};