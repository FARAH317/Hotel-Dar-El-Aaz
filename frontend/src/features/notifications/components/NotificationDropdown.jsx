import { Fragment, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  BellIcon, 
  CheckIcon,
  EnvelopeIcon,
  CalendarIcon,
  CreditCardIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
  fetchUnreadNotifications,
  fetchNotificationCounts,
  markAsRead,
  markAllAsRead,
  selectUnreadNotifications,
  selectNotificationCounts
} from '../store/notificationsSlice';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { selectIsAuthenticated } from '../../auth/store/authSlice'; 

const NotificationDropdown = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const unreadNotifications = useSelector(selectUnreadNotifications) || [];
  const counts = useSelector(selectNotificationCounts) || { total: 0, unread: 0, read: 0 };


   useEffect(() => {
    if (!isAuthenticated) {
      console.log('⚠️ Utilisateur non connecté, pas de chargement des notifications');
      return;
    }

    dispatch(fetchUnreadNotifications());
    dispatch(fetchNotificationCounts());

    const interval = setInterval(() => {
      dispatch(fetchUnreadNotifications());
      dispatch(fetchNotificationCounts());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) return null;

  const handleMarkAsRead = async (notificationId, e) => {
    e.preventDefault();
    e.stopPropagation();
    await dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
  };

  const getNotificationIcon = (type) => {
    const iconClass = "h-5 w-5";
    
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
        return 'text-green-600 bg-green-50';
      
      case 'RESERVATION_CANCELLED':
      case 'PAYMENT_FAILED':
        return 'text-red-600 bg-red-50';
      
      case 'CHECK_IN_REMINDER':
      case 'CHECK_OUT_REMINDER':
      case 'RESERVATION_REMINDER':
        return 'text-blue-600 bg-blue-50';
      
      default:
        return 'text-gray-600 bg-gray-50';
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
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 text-[#6B5D4F] hover:text-[#C9A961] hover:bg-[#F5F1E8] rounded-full transition-all">
        <BellIcon className="h-6 w-6" />
        {counts.unread > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {counts.unread > 9 ? '9+' : counts.unread}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-3 w-96 origin-top-right bg-white rounded-lg shadow-xl border border-[#EAE3D2] focus:outline-none overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#EAE3D2] bg-[#F5F1E8]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#2C2416]">Notifications</h3>
              {counts.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-[#C9A961] hover:text-[#B8935A] font-medium transition-colors"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
            <p className="text-sm text-[#6B5D4F] mt-1">
              {counts.unread} non lue{counts.unread > 1 ? 's' : ''}
            </p>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {unreadNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Aucune nouvelle notification</p>
              </div>
            ) : (
              <div className="divide-y divide-[#EAE3D2]">
                {unreadNotifications.map((notification) => (
                  <Menu.Item key={notification.id}>
                    {({ active }) => (
                      <Link
                        to="/notifications"
                        className={`block px-4 py-3 transition-colors ${
                          active ? 'bg-[#F5F1E8]' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 p-2 rounded-lg ${getNotificationColor(notification.notification_type)}`}>
                            {getNotificationIcon(notification.notification_type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[#2C2416] line-clamp-1">
                                  {notification.subject}
                                </p>
                                <p className="text-xs text-[#6B5D4F] mt-1">
                                  {notification.notification_type_display}
                                </p>
                              </div>
                              
                              <button
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                className="ml-2 p-1 text-gray-400 hover:text-[#C9A961] transition-colors"
                                title="Marquer comme lu"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDate(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[#EAE3D2] bg-[#F5F1E8]">
            <Link
              to="/notifications"
              className="block text-center text-sm font-medium text-[#C9A961] hover:text-[#B8935A] transition-colors"
            >
              Voir toutes les notifications
            </Link>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NotificationDropdown;