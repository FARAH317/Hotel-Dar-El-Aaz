import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  fetchNotificationCounts,
  markAsRead,
  markAllAsRead,
  selectNotifications,
  selectNotificationCounts,
  selectNotificationsLoading
} from '../store/notificationsSlice';
import NotificationItem from './NotificationItem';
import { 
  BellIcon,
  FunnelIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const NotificationList = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const counts = useSelector(selectNotificationCounts);
  const loading = useSelector(selectNotificationsLoading);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchNotificationCounts());
  }, [dispatch]);

  const handleMarkAsRead = async (notificationId) => {
    await dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
    dispatch(fetchNotifications());
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.is_read;
    }
    if (filter === 'read') {
      return notification.is_read;
    }
    return true;
  });

  return (
    <div className="luxury-container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2C2416] mb-2">Mes Notifications</h1>
        <p className="text-[#6B5D4F]">
          Suivez toutes vos notifications de réservations et paiements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#C9A961] to-[#B8935A] p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total</p>
              <p className="text-3xl font-bold mt-1">{counts.total}</p>
            </div>
            <BellIcon className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Non lues</p>
              <p className="text-3xl font-bold mt-1">{counts.unread}</p>
            </div>
            <BellIcon className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Lues</p>
              <p className="text-3xl font-bold mt-1">{counts.read}</p>
            </div>
            <CheckIcon className="h-12 w-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-[#6B5D4F]" />
          <span className="text-sm font-medium text-[#6B5D4F]">Filtrer:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#C9A961] text-white'
                  : 'bg-[#F5F1E8] text-[#6B5D4F] hover:bg-[#EAE3D2]'
              }`}
            >
              Toutes ({counts.total})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-[#C9A961] text-white'
                  : 'bg-[#F5F1E8] text-[#6B5D4F] hover:bg-[#EAE3D2]'
              }`}
            >
              Non lues ({counts.unread})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-[#C9A961] text-white'
                  : 'bg-[#F5F1E8] text-[#6B5D4F] hover:bg-[#EAE3D2]'
              }`}
            >
              Lues ({counts.read})
            </button>
          </div>
        </div>

        {counts.unread > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn-secondary text-sm"
          >
            Marquer tout comme lu
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A961]"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-[#EAE3D2] p-12 text-center">
          <BellIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-[#2C2416] mb-2">
            Aucune notification
          </h3>
          <p className="text-[#6B5D4F]">
            {filter === 'unread' 
              ? 'Vous n\'avez aucune notification non lue'
              : filter === 'read'
              ? 'Vous n\'avez aucune notification lue'
              : 'Vous n\'avez reçu aucune notification pour le moment'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;