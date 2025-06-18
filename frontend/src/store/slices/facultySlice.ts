import { createSlice } from '@reduxjs/toolkit';

const facultySlice = createSlice({
  name: 'faculty',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

export default facultySlice.reducer;