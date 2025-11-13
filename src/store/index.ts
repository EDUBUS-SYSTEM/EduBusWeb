import { configureStore } from '@reduxjs/toolkit';
import driverRequestsReducer from '@/store/slices/driverRequestsSlice';
import tripsReducer from '@/store/slices/tripsSlice';

export const store = configureStore({
  reducer: {
    driverRequests: driverRequestsReducer,
    trips: tripsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;