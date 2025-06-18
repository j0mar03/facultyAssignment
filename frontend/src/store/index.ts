import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import facultyReducer from './slices/facultySlice';
import courseReducer from './slices/courseSlice';
import assignmentReducer from './slices/assignmentSlice';
import scheduleReducer from './slices/scheduleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    faculty: facultyReducer,
    courses: courseReducer,
    assignments: assignmentReducer,
    schedule: scheduleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;