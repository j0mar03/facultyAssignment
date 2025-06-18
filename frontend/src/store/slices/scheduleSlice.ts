import { createSlice } from '@reduxjs/toolkit';

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState: {
    events: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

export default scheduleSlice.reducer;