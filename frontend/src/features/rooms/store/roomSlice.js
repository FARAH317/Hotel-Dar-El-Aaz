import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roomService from '../services/roomService';

// Initial state
const initialState = {
  rooms: [],
  currentRoom: null,
  roomTypes: [],
  amenities: [],
  availableRooms: [],
  isLoading: false,
  error: null,
  searchFilters: {
    check_in: null,
    check_out: null,
    room_type_id: null,
    min_price: null,
    max_price: null,
    amenities: [],
  },
};

// Async thunks
export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async (params, { rejectWithValue }) => {
    try {
      const data = await roomService.getRooms(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement des chambres');
    }
  }
);

export const fetchRoomById = createAsyncThunk(
  'rooms/fetchRoomById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await roomService.getRoomById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement de la chambre');
    }
  }
);

export const searchRooms = createAsyncThunk(
  'rooms/searchRooms',
  async (searchParams, { rejectWithValue }) => {
    try {
      const data = await roomService.searchRooms(searchParams);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de recherche');
    }
  }
);

export const checkAvailability = createAsyncThunk(
  'rooms/checkAvailability',
  async ({ checkIn, checkOut }, { rejectWithValue }) => {
    try {
      const data = await roomService.checkAvailability(checkIn, checkOut);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de vérification de disponibilité');
    }
  }
);

export const fetchRoomTypes = createAsyncThunk(
  'rooms/fetchRoomTypes',
  async (_, { rejectWithValue }) => {
    try {
      const data = await roomService.getRoomTypes();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement des types de chambres');
    }
  }
);

export const fetchAmenities = createAsyncThunk(
  'rooms/fetchAmenities',
  async (params, { rejectWithValue }) => {
    try {
      const data = await roomService.getAmenities(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Erreur de chargement des équipements');
    }
  }
);

// Room slice
const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchFilters: (state, action) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    clearSearchFilters: (state) => {
      state.searchFilters = initialState.searchFilters;
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rooms
      .addCase(fetchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload.results || action.payload;
        state.error = null;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Room By ID
      .addCase(fetchRoomById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRoom = action.payload;
        state.error = null;
      })
      .addCase(fetchRoomById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Search Rooms
.addCase(searchRooms.pending, (state) => {
  state.isLoading = true;
  state.error = null;
})
.addCase(searchRooms.fulfilled, (state, action) => {
  state.isLoading = false;
  // ✅ Gérer la pagination comme pour fetchRooms
  state.rooms = action.payload.results || action.payload;
  state.error = null;
})
.addCase(searchRooms.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})
      
      // Check Availability
      .addCase(checkAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableRooms = action.payload.rooms;
        state.error = null;
      })
      .addCase(checkAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Room Types
      .addCase(fetchRoomTypes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRoomTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roomTypes = action.payload.results || action.payload;
      })
      .addCase(fetchRoomTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Amenities
      .addCase(fetchAmenities.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAmenities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.amenities = action.payload.results || action.payload;
      })
      .addCase(fetchAmenities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSearchFilters, clearSearchFilters, setCurrentRoom } = roomSlice.actions;

// Selectors
export const selectRooms = (state) => state.rooms.rooms;
export const selectCurrentRoom = (state) => state.rooms.currentRoom;
export const selectRoomTypes = (state) => state.rooms.roomTypes;
export const selectAmenities = (state) => state.rooms.amenities;
export const selectAvailableRooms = (state) => state.rooms.availableRooms;
export const selectRoomLoading = (state) => state.rooms.isLoading;
export const selectRoomError = (state) => state.rooms.error;
export const selectSearchFilters = (state) => state.rooms.searchFilters;

export default roomSlice.reducer;