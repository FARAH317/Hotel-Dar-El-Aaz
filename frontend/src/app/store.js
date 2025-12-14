import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/store/authSlice';
import roomReducer from '@/features/rooms/store/roomSlice';
import reservationReducer from '@/features/reservations/store/reservationSlice';
import paymentReducer from '@/features/payments/store/paymentSlice';
import notificationsReducer from '@/features/notifications/store/notificationsSlice'; // ✅ Import

const store = configureStore({
  reducer: {
    auth: authReducer,
    rooms: roomReducer,
    reservations: reservationReducer,
    payments: paymentReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;