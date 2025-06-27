import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import exerciseSlice from './slices/exerciseSlice';
import progressSlice from './slices/progressSlice';
import aclRsiSlice from './slices/aclRsiSlice';
import medicalCollaborationSlice from './slices/medicalCollaborationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    exercise: exerciseSlice,
    progress: progressSlice,
    aclRsi: aclRsiSlice,
    medicalCollaboration: medicalCollaborationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});