// EduBusWeb/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import driverRequestsReducer from '@/store/slices/driverRequestsSlice';
import tripsReducer from '@/store/slices/tripsSlice';
import liveTripsReducer from '@/store/slices/liveTripsSlice';

export const store = configureStore({
  reducer: {
    driverRequests: driverRequestsReducer,
    trips: tripsReducer,
    liveTrips: liveTripsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;