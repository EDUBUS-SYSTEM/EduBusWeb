import { configureStore } from '@reduxjs/toolkit';
import driverRequestsReducer from '@/store/slices/driverRequestsSlice';

export const store = configureStore({
  reducer: {
    driverRequests: driverRequestsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;