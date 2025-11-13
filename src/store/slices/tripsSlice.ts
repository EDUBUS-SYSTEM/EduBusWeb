import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tripService, GetAllTripsParams } from '@/services/tripService';
import { TripDto } from '@/types';
import axios from 'axios';
// Async thunk for fetching trips
export const fetchTrips = createAsyncThunk(
  'trips/fetchTrips',
  async (filters: GetAllTripsParams = {}) => {
    const response = await tripService.getAllTrips(filters);
    return response;
  }
);

// Async thunk for creating trip
export const createTrip = createAsyncThunk(
  'trips/createTrip',
  async (
    data: Parameters<typeof tripService.createTrip>[0],
    { rejectWithValue }
  ) => {
    try {
      const response = await tripService.createTrip(data);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          status: error.response?.status,
          data: error.response?.data,
        });
      }

      // Fallback for unexpected errors
      return rejectWithValue({ message: 'Unexpected error occurred' });
    }
  }
);

// Async thunk for updating trip
export const updateTrip = createAsyncThunk(
  'trips/updateTrip',
  async (
    { id, data }: { id: string; data: Parameters<typeof tripService.updateTrip>[1] },
    { rejectWithValue }
  ) => {
    try {
      await tripService.updateTrip(id, data);
      // Refetch to get updated data
      const response = await tripService.getTripById(id);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      return rejectWithValue({ message: 'Unexpected error' });
    }
  }
);

// Async thunk for deleting trip
export const deleteTrip = createAsyncThunk(
  'trips/deleteTrip',
  async (id: string, { rejectWithValue }) => {
    try {
      await tripService.deleteTrip(id);
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      return rejectWithValue({ message: 'Unexpected error' });
    }
  }
);

export const generateTripsFromSchedule = createAsyncThunk(
  'trips/generateTripsFromSchedule',
  async ({ scheduleId, startDate, endDate }: { scheduleId: string; startDate: string; endDate: string }) => {
    const trips = await tripService.generateTripsFromSchedule(scheduleId, startDate, endDate);
    return trips;
  }
);

interface TripsState {
  trips: TripDto[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalItems: number;
    totalPages: number;
    perPage: number;
  };
  filters: GetAllTripsParams;
  generating: boolean; // Loading state for generate operation
  generateError: string | null; // Error state for generate operation
  generatedTripsCount: number; // Count of last generated trips
}

const initialState: TripsState = {
  trips: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
    perPage: 20,
  },
  filters: {},
  generating: false,
  generateError: null,
  generatedTripsCount: 0,
};

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<GetAllTripsParams>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to page 1 when filters change
      state.pagination.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.perPage = action.payload;
      state.pagination.currentPage = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearGenerateError: (state) => {
      state.generateError = null;
    },
    updateTripInList: (state, action: PayloadAction<TripDto>) => {
      const index = state.trips.findIndex(trip => trip.id === action.payload.id);
      if (index !== -1) {
        state.trips[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch trips
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload.data;
        state.pagination = {
          currentPage: action.payload.page,
          totalItems: action.payload.total,
          totalPages: action.payload.totalPages,
          perPage: action.payload.perPage,
        };
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch trips';
      })
      // Create trip
      .addCase(createTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips.unshift(action.payload);
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create trip';
      })
      // Update trip
      .addCase(updateTrip.fulfilled, (state, action) => {
        const index = state.trips.findIndex(trip => trip.id === action.payload.id);
        if (index !== -1) {
          state.trips[index] = action.payload;
        }
      })
      // Delete trip
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.trips = state.trips.filter(trip => trip.id !== action.payload);
      })

      // NEW: Generate trips from schedule
      .addCase(generateTripsFromSchedule.pending, (state) => {
        state.generating = true;
        state.generateError = null;
        state.generatedTripsCount = 0;
      })
      .addCase(generateTripsFromSchedule.fulfilled, (state, action) => {
        state.generating = false;
        state.generateError = null;
        state.generatedTripsCount = action.payload.length;
        // Optionally: Refresh trips list or add generated trips to the list
        // For now, we'll let the parent component refresh the list
      })
      .addCase(generateTripsFromSchedule.rejected, (state, action) => {
        state.generating = false;
        // Extract error message from the rejected action
        const errorMessage = action.error.message || 'Failed to generate trips';
        state.generateError = errorMessage;
        state.generatedTripsCount = 0;
      });
  },
});

export const {
  setFilters,
  setCurrentPage,
  setPerPage,
  clearError,
  clearGenerateError,
  updateTripInList
} = tripsSlice.actions;
export default tripsSlice.reducer;