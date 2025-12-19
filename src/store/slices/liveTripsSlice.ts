import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tripService } from '@/services/tripService';
import { TripDto, TripStopDto } from '@/types';
import axios from 'axios';

export interface LocationUpdateData {
  tripId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  accuracy?: number;
  isMoving: boolean;
  timestamp: string;
}

export interface TripStatusChangedData {
  tripId: string;
  status: "InProgress" | "Scheduled" | "Completed";
  startTime?: string;
  endTime?: string;
  timestamp: string;
}

interface PerStopAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  pending: number;
  late: number;
  excused: number;
  arrivedAt?: string;
  departedAt?: string;
}

export interface AttendanceUpdatedData {
  tripId: string;
  stopId: string;
  attendance: PerStopAttendanceSummary;
  timestamp: string;
}

interface TripAttendanceUpdates {
  [stopId: string]: {
    attendance: PerStopAttendanceSummary;
    timestamp: string;
  };
}

export const fetchOngoingTrips = createAsyncThunk(
  'liveTrips/fetchOngoingTrips',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tripService.getAllTrips({
        status: 'InProgress',
        perPage: 100
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      return rejectWithValue({ message: 'Failed to fetch ongoing trips' });
    }
  }
);

interface LiveTripsState {
  ongoingTrips: TripDto[];

  locationUpdates: Record<string, LocationUpdateData>;

  statusChanges: Record<string, TripStatusChangedData>;

  attendanceUpdates: Record<string, TripAttendanceUpdates>;

  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  connectionError: string | null;
  lastUpdate: string | null;

  loading: boolean;
  error: string | null;

  stats: {
    activeTrips: number;
    studentsOnBoard: number;
    onTimeTrips: number;
    issues: number;
  };

  selectedTripIds: string[];
}

const initialState: LiveTripsState = {
  ongoingTrips: [],
  locationUpdates: {},
  statusChanges: {},
  attendanceUpdates: {},
  connectionStatus: 'disconnected',
  connectionError: null,
  lastUpdate: null,
  loading: false,
  error: null,
  stats: {
    activeTrips: 0,
    studentsOnBoard: 0,
    onTimeTrips: 0,
    issues: 0,
  },
  selectedTripIds: [], 
};

const liveTripsSlice = createSlice({
  name: 'liveTrips',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<LiveTripsState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
      if (action.payload === 'connected') {
        state.connectionError = null;
      }
    },
    setConnectionError: (state, action: PayloadAction<string | null>) => {
      state.connectionError = action.payload;
    },

    updateLocation: (state, action: PayloadAction<LocationUpdateData>) => {
      state.locationUpdates[action.payload.tripId] = action.payload;
      state.lastUpdate = new Date().toISOString();
    },

    updateTripStatus: (state, action: PayloadAction<TripStatusChangedData>) => {
      state.statusChanges[action.payload.tripId] = action.payload;
      state.lastUpdate = new Date().toISOString();

      const tripIndex = state.ongoingTrips.findIndex(t => t.id === action.payload.tripId);
      if (tripIndex !== -1) {
        state.ongoingTrips[tripIndex].status = action.payload.status;
        if (action.payload.startTime) {
          state.ongoingTrips[tripIndex].startTime = action.payload.startTime;
        }
        if (action.payload.endTime) {
          state.ongoingTrips[tripIndex].endTime = action.payload.endTime;
        }

        if (action.payload.status !== 'InProgress') {
          state.ongoingTrips.splice(tripIndex, 1);
          state.selectedTripIds = state.selectedTripIds.filter(id => id !== action.payload.tripId);
        }
        state.stats = calculateStats(state.ongoingTrips, state.attendanceUpdates);
      }
    },

    updateAttendance: (state, action: PayloadAction<AttendanceUpdatedData>) => {
      const { tripId, stopId, attendance, timestamp } = action.payload;

      if (!state.attendanceUpdates[tripId]) {
        state.attendanceUpdates[tripId] = {};
      }

      const normalizedStopId = String(stopId).toLowerCase();
      state.attendanceUpdates[tripId][normalizedStopId] = {
        attendance: attendance as PerStopAttendanceSummary,
        timestamp: timestamp
      };

      const tripIndex = state.ongoingTrips.findIndex(t => t.id === tripId);
      if (tripIndex !== -1) {
        const trip = state.ongoingTrips[tripIndex];
        const stopIndex = trip.stops?.findIndex((s: TripStopDto) => {
          const sId = String(s.id || '').toLowerCase();
          return sId === normalizedStopId;
        });

        if (stopIndex !== undefined && stopIndex !== -1 && trip.stops) {
          const summary = attendance as PerStopAttendanceSummary;
          if (summary.arrivedAt) {
            trip.stops[stopIndex].actualArrival = summary.arrivedAt;
          }
          if (summary.departedAt) {
            trip.stops[stopIndex].actualDeparture = summary.departedAt;
          }
        }
      }

      state.lastUpdate = new Date().toISOString();

      state.stats = calculateStats(state.ongoingTrips, state.attendanceUpdates);
    },

    addOngoingTrip: (state, action: PayloadAction<TripDto>) => {
      const existingIndex = state.ongoingTrips.findIndex(t => t.id === action.payload.id);
      if (existingIndex === -1) {
        state.ongoingTrips.push(action.payload);
      } else {
        state.ongoingTrips[existingIndex] = action.payload;
      }
      state.stats = calculateStats(state.ongoingTrips, state.attendanceUpdates);
    },

    removeOngoingTrip: (state, action: PayloadAction<string>) => {
      state.ongoingTrips = state.ongoingTrips.filter(t => t.id !== action.payload);
      delete state.locationUpdates[action.payload];
      delete state.statusChanges[action.payload];
      delete state.attendanceUpdates[action.payload];
      state.selectedTripIds = state.selectedTripIds.filter(id => id !== action.payload);

      state.stats = calculateStats(state.ongoingTrips, state.attendanceUpdates);
    },

    updateOngoingTrip: (state, action: PayloadAction<TripDto>) => {
      const index = state.ongoingTrips.findIndex(trip => trip.id === action.payload.id);
      if (index !== -1) {
        state.ongoingTrips[index] = action.payload;
      }
    },

    clearRealTimeData: (state) => {
      state.locationUpdates = {};
      state.statusChanges = {};
      state.attendanceUpdates = {};
    },

    clearError: (state) => {
      state.error = null;
    },

    toggleTripSelection: (state, action: PayloadAction<string>) => {
      const tripId = action.payload;
      const index = state.selectedTripIds.indexOf(tripId);
      if (index === -1) {
        state.selectedTripIds.push(tripId);
      } else {
        state.selectedTripIds.splice(index, 1);
      }
    },

    selectAllTrips: (state) => {
      state.selectedTripIds = state.ongoingTrips.map(trip => trip.id);
    },

    deselectAllTrips: (state) => {
      state.selectedTripIds = [];
    },

    setSelectedTripIds: (state, action: PayloadAction<string[]>) => {
      state.selectedTripIds = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOngoingTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOngoingTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.ongoingTrips = action.payload;
        state.lastUpdate = new Date().toISOString();

        state.stats = calculateStats(action.payload, state.attendanceUpdates);
      })
      .addCase(fetchOngoingTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ongoing trips';
      });
  },
});

function calculateStats(
  trips: TripDto[],
  attendanceUpdates?: Record<string, TripAttendanceUpdates>
): LiveTripsState['stats'] {
  let studentsOnBoard = 0;
  let onTimeTrips = 0;
  let issues = 0;

  trips.forEach(trip => {
    const tripAttendanceUpdates = attendanceUpdates?.[trip.id];

    let tripPresent = 0;
    let tripAbsent = 0;
    let tripPending = 0;
    let hasIssues = false;

    if (tripAttendanceUpdates && Object.keys(tripAttendanceUpdates).length > 0) {
      Object.values(tripAttendanceUpdates).forEach(stopUpdate => {
        const summary = stopUpdate.attendance;
        tripPresent += summary.present || 0;
        tripAbsent += summary.absent || 0;
        tripPending += summary.pending || 0;

        if ((summary.absent || 0) > 0 || (summary.pending || 0) > 5) {
          hasIssues = true;
        }
      });

      studentsOnBoard += tripPresent;
      if (hasIssues) {
        issues++;
      }
    } else {
      trip.stops?.forEach(stop => {
        stop.attendance?.forEach(att => {
          if (att.state === 'Present') {
            studentsOnBoard++;
            tripPresent++;
          } else if (att.state === 'Absent') {
            tripAbsent++;
          } else if (att.state === 'Pending') {
            tripPending++;
          }
        });
      });

      if (tripAbsent > 0 || tripPending > 5) {
        issues++;
      }
    }

    if (trip.startTime) {
      const plannedStart = new Date(trip.plannedStartAt);
      const actualStart = new Date(trip.startTime);
      const diffMinutes = Math.abs((actualStart.getTime() - plannedStart.getTime()) / (1000 * 60));
      if (diffMinutes <= 5) {
        onTimeTrips++;
      }
    }
  });

  return {
    activeTrips: trips.length,
    studentsOnBoard,
    onTimeTrips,
    issues,
  };
}

export const {
  setConnectionStatus,
  setConnectionError,
  updateLocation,
  updateTripStatus,
  updateAttendance,
  addOngoingTrip,
  removeOngoingTrip,
  updateOngoingTrip,
  clearRealTimeData,
  clearError,
  toggleTripSelection,
  selectAllTrips,
  deselectAllTrips,
  setSelectedTripIds,
} = liveTripsSlice.actions;

export default liveTripsSlice.reducer;