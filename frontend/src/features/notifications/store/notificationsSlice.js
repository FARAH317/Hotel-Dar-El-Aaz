import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../services/notificationService';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement des notifications');
    }
  }
);

export const fetchUnreadNotifications = createAsyncThunk(
  'notifications/fetchUnread',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadNotifications();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement des notifications non lues');
    }
  }
);

export const fetchNotificationCounts = createAsyncThunk(
  'notifications/fetchCounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotificationCounts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement des compteurs');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du marquage de la notification');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAllAsRead();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du marquage des notifications');
    }
  }
);

export const fetchNotificationsByType = createAsyncThunk(
  'notifications/fetchByType',
  async (notificationType, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotificationsByType(notificationType);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur lors du chargement des notifications');
    }
  }
);

// Initial state
const initialState = {
  notifications: [],
  unreadNotifications: [],
  counts: {
    total: 0,
    unread: 0,
    read: 0
  },
  loading: false,
  error: null,
  success: false
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetNotifications: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch all notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload?.results || action.payload || [];
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur inconnue';
      })

      // Fetch unread notifications
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadNotifications = action.payload?.notifications || [];
        state.counts.unread = action.payload?.count ?? 0;
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur inconnue';
      })

      // Fetch notification counts
      .addCase(fetchNotificationCounts.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchNotificationCounts.fulfilled, (state, action) => {
        state.counts = action.payload || { total: 0, unread: 0, read: 0 };
        state.error = null;
      })
      .addCase(fetchNotificationCounts.rejected, (state, action) => {
        state.error = action.payload || 'Erreur inconnue';
      })

      // Mark as read
      .addCase(markAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload?.notification?.id;
        if (!notificationId) return;

        // Update notifications array
        const index = state.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
          state.notifications[index] = action.payload.notification;
        }

        // Remove from unread notifications
        state.unreadNotifications = state.unreadNotifications.filter(
          n => n.id !== notificationId
        );

        // Update counts
        state.counts.unread = Math.max(0, state.counts.unread - 1);
        state.counts.read += 1;

        state.success = true;
        state.error = null;
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload || 'Erreur inconnue';
      })

      // Mark all as read
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.loading = false;
        state.unreadNotifications = [];
        state.counts.read += state.counts.unread;
        state.counts.unread = 0;

        state.notifications = state.notifications.map(n => ({
          ...n,
          status: 'READ',
          is_read: true
        }));

        state.success = true;
        state.error = null;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur inconnue';
      })

      // Fetch by type
      .addCase(fetchNotificationsByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsByType.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload || [];
        state.error = null;
      })
      .addCase(fetchNotificationsByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur inconnue';
      });
  }
});

// Actions
export const { clearError, clearSuccess, resetNotifications } = notificationsSlice.actions;

// Selectors
export const selectUnreadNotifications = (state) => state.notifications?.unreadNotifications || [];
export const selectNotifications = (state) => state.notifications?.notifications || [];
export const selectNotificationCounts = (state) => state.notifications?.counts || { total: 0, unread: 0, read: 0 };
export const selectNotificationsLoading = (state) => state.notifications?.loading || false; // ✅ Valeur par défaut
export const selectNotificationsError = (state) => state.notifications?.error || null;
export const selectNotificationsSuccess = (state) => state.notifications?.success || false;

export default notificationsSlice.reducer;
