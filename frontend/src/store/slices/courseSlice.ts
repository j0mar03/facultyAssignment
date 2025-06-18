import { createSlice } from '@reduxjs/toolkit';

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

export default courseSlice.reducer;