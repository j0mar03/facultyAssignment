import { createSlice } from '@reduxjs/toolkit';

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

export default assignmentSlice.reducer;