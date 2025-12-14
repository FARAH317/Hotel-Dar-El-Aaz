import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../services/paymentService';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  payments: [],
  myPayments: [],
  currentPayment: null,
  invoices: [],
  currentInvoice: null,
  statistics: null,
  
  // ✅ Structure pour les paiements par réservation
  paymentsByReservation: {
    payments: [],
    summary: null,
    reservation: null,
  },
  
  isLoading: false,
  error: null,
};

// ========================
//     ASYNC THUNKS
// ========================

// Fetch all payments
export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (params, { rejectWithValue }) => {
    try {
      const data = await paymentService.getPayments(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement des paiements');
    }
  }
);

// Fetch payment by ID
export const fetchPaymentById = createAsyncThunk(
  'payments/fetchPaymentById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await paymentService.getPaymentById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement');
    }
  }
);

export const fetchMyPayments = createAsyncThunk(
  'payments/fetchMyPayments',
  async (params, { rejectWithValue }) => {
    try {
      const data = await paymentService.getMyPayments(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement des paiements');
    }
  }
);

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const data = await paymentService.createPayment(paymentData);
      toast.success('Paiement créé avec succès');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de création du paiement');
    }
  }
);

export const processPayment = createAsyncThunk(
  'payments/processPayment',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const data = await paymentService.processPayment(id, paymentData);
      toast.success('Paiement traité avec succès');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de traitement du paiement');
    }
  }
);

export const fetchPaymentsByReservation = createAsyncThunk(
  'payments/fetchPaymentsByReservation',
  async (reservationId, { rejectWithValue }) => {
    try {
      const data = await paymentService.getPaymentsByReservation(reservationId);
      console.log('✅ Payments by reservation loaded:', data);
      return data;
    } catch (error) {
      console.error('❌ Error loading payments:', error);
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement des paiements');
    }
  }
);

export const fetchInvoices = createAsyncThunk(
  'payments/fetchInvoices',
  async (params, { rejectWithValue }) => {
    try {
      const data = await paymentService.getInvoices(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement des factures');
    }
  }
);

export const fetchInvoiceByReservation = createAsyncThunk(
  'payments/fetchInvoiceByReservation',
  async (reservationId, { rejectWithValue }) => {
    try {
      const data = await paymentService.getInvoiceByReservation(reservationId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement de la facture');
    }
  }
);

export const createInvoice = createAsyncThunk(
  'payments/createInvoice',
  async (reservationId, { rejectWithValue }) => {
    try {
      const data = await paymentService.createInvoice(reservationId);
      toast.success('Facture créée avec succès');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de création de facture');
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'payments/fetchStatistics',
  async (params, { rejectWithValue }) => {
    try {
      const data = await paymentService.getStatistics(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement des statistiques');
    }
  }
);

// ========================
//        SLICE
// ========================
const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPayment: (state, action) => {
      state.currentPayment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch Payments
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.results || action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Payment By ID
      .addCase(fetchPaymentById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch My Payments
      .addCase(fetchMyPayments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myPayments = action.payload.results || action.payload;
      })
      .addCase(fetchMyPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Payment
      .addCase(createPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload.payment;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Process Payment
      .addCase(processPayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload.payment;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Payments By Reservation - ✅ Structure corrigée
      .addCase(fetchPaymentsByReservation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPaymentsByReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        // ✅ Stocker la structure complète
        state.paymentsByReservation = {
          payments: action.payload.payments || [],
          summary: action.payload.summary || null,
          reservation: action.payload.reservation || null,
        };
      })
      .addCase(fetchPaymentsByReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload.results || action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Invoice By Reservation
      .addCase(fetchInvoiceByReservation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInvoiceByReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoiceByReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Invoice
      .addCase(createInvoice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInvoice = action.payload.invoice;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentPayment } = paymentSlice.actions;

// Selectors
export const selectPayments = (state) => state.payments.payments;
export const selectMyPayments = (state) => state.payments.myPayments;
export const selectCurrentPayment = (state) => state.payments.currentPayment;
export const selectInvoices = (state) => state.payments.invoices;
export const selectCurrentInvoice = (state) => state.payments.currentInvoice;
export const selectPaymentStatistics = (state) => state.payments.statistics;
export const selectPaymentLoading = (state) => state.payments.isLoading;
export const selectPaymentError = (state) => state.payments.error;

// ✅ Nouveau selector pour les paiements par réservation
export const selectPaymentsByReservation = (state) => state.payments.paymentsByReservation;

export default paymentSlice.reducer;