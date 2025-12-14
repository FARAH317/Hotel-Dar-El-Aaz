import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reservationService from '../services/reservationService';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  reservations: [],
  myReservations: [],
  currentReservation: null,
  statistics: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchReservations = createAsyncThunk(
  'reservations/fetchReservations',
  async (params, { rejectWithValue }) => {
    try {
      const data = await reservationService.getReservations(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement des réservations');
    }
  }
);

export const fetchMyReservations = createAsyncThunk(
  'reservations/fetchMyReservations',
  async (params, { rejectWithValue }) => {
    try {
      const data = await reservationService.getMyReservations(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement des réservations');
    }
  }
);

export const fetchReservationById = createAsyncThunk(
  'reservations/fetchReservationById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await reservationService.getReservationById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement de la réservation');
    }
  }
);

export const createReservation = createAsyncThunk(
  'reservations/createReservation',
  async (reservationData, { rejectWithValue }) => {
    try {
      const data = await reservationService.createReservation(reservationData);
      toast.success('Réservation créée avec succès !');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de création de réservation');
    }
  }
);

export const updateReservation = createAsyncThunk(
  'reservations/updateReservation',
  async ({ id, reservationData }, { rejectWithValue }) => {
    try {
      const data = await reservationService.updateReservation(id, reservationData);
      toast.success('Réservation mise à jour avec succès');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de mise à jour');
    }
  }
);

export const confirmReservation = createAsyncThunk(
  'reservations/confirmReservation',
  async (id, { rejectWithValue }) => {
    try {
      const data = await reservationService.confirmReservation(id);
      toast.success('Réservation confirmée avec succès');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de confirmation');
    }
  }
);

// CORRIGÉ: cancelReservation avec gestion d'erreur améliorée
export const cancelReservation = createAsyncThunk(
  'reservations/cancelReservation',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      console.log('📤 Redux Thunk - Annulation:', { id, reason });
      
      const data = await reservationService.cancelReservation(id, reason);
      
      console.log('✅ Redux Thunk - Succès:', data);
      toast.success('Réservation annulée avec succès');
      return data;
    } catch (error) {
      console.error('❌ Redux Thunk - Erreur:', error);
      
      // Extraire le message d'erreur du backend
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.response?.data?.detail
        || 'Erreur d\'annulation';
      
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'reservations/fetchStatistics',
  async (params, { rejectWithValue }) => {
    try {
      const data = await reservationService.getStatistics(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement des statistiques');
    }
  }
);

// Reservation slice
const reservationSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentReservation: (state, action) => {
      state.currentReservation = action.payload;
    },
    clearCurrentReservation: (state) => {
      state.currentReservation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reservations
      .addCase(fetchReservations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reservations = action.payload.results || action.payload;
        state.error = null;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch My Reservations
      .addCase(fetchMyReservations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyReservations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myReservations = action.payload.results || action.payload;
        state.error = null;
      })
      .addCase(fetchMyReservations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Reservation By ID
      .addCase(fetchReservationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReservationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReservation = action.payload;
        state.error = null;
      })
      .addCase(fetchReservationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Reservation
      .addCase(createReservation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReservation = action.payload.reservation;
        state.error = null;
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Reservation
      .addCase(updateReservation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReservation = action.payload.reservation;
        state.error = null;
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Confirm Reservation
      .addCase(confirmReservation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReservation = action.payload.reservation;
        state.error = null;
      })
      .addCase(confirmReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Cancel Reservation
      .addCase(cancelReservation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReservation = action.payload.reservation;
        state.error = null;
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentReservation, clearCurrentReservation } = reservationSlice.actions;

// Selectors
export const selectReservations = (state) => state.reservations.reservations;
export const selectMyReservations = (state) => state.reservations.myReservations;
export const selectCurrentReservation = (state) => state.reservations.currentReservation;
export const selectReservationStatistics = (state) => state.reservations.statistics;
export const selectReservationLoading = (state) => state.reservations.isLoading;
export const selectReservationError = (state) => state.reservations.error;

export default reservationSlice.reducer;