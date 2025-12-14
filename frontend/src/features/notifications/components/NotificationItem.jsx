import { 
  CalendarIcon,
  CreditCardIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const getNotificationIcon = (type) => {
    const iconClass = "h-6 w-6";
    
    switch (type) {
      case 'RESERVATION_CREATED':
      case 'RESERVATION_CONFIRMED':
      case 'RESERVATION_CANCELLED':
      case 'RESERVATION_REMINDER':
      case 'CHECK_IN_REMINDER':
      case 'CHECK_OUT_REMINDER':
        return <CalendarIcon className={iconClass} />;
      
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_FAILED':
      case 'REFUND_PROCESSED':
      case 'INVOICE_GENERATED':
        return <CreditCardIcon className={iconClass} />;
      
      default:
        return <InformationCircleIcon className={iconClass} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'RESERVATION_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        return 'text-green-600 bg-green-50 border-green-200';
      
      case 'RESERVATION_CANCELLED':
      case 'PAYMENT_FAILED':
        return 'text-red-600 bg-red-50 border-red-200';
      
      case 'CHECK_IN_REMINDER':
      case 'CHECK_OUT_REMINDER':
      case 'RESERVATION_REMINDER':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: fr 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div 
      className={`p-4 rounded-lg border transition-all ${
        notification.is_read 
          ? 'bg-white border-[#EAE3D2] opacity-75' 
          : 'bg-[#FFFEF9] border-[#C9A961] shadow-sm'
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className={`flex-shrink-0 p-3 rounded-lg border ${getNotificationColor(notification.notification_type)}`}>
          {getNotificationIcon(notification.notification_type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="text-base font-semibold text-[#2C2416] mb-1">
                {notification.subject}
              </h4>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F5F1E8] text-[#6B5D4F]">
                {notification.notification_type_display}
              </span>
            </div>

            {/* Status Badge */}
            {notification.is_read ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Lu
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#C9A961] text-white">
                Nouveau
              </span>
            )}
          </div>

          {/* Message Preview */}
          <p className="text-sm text-[#6B5D4F] mb-3 line-clamp-2">
            {notification.message}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {formatDate(notification.created_at)}
            </span>

            {!notification.is_read && onMarkAsRead && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs font-medium text-[#C9A961] hover:text-[#B8935A] transition-colors"
              >
                Marquer comme lu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;