import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import exerciseSlice from './slices/exerciseSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    exercise: exerciseSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});