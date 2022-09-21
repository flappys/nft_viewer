import { createSlice } from '@reduxjs/toolkit';

export const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
    value: false,
  },
  reducers: {
    viewIsLoading: (state) => {
      state.value = true;
    },
    viewIsNotLoading: (state) => {
      state.value = false;
    },
  },
});

export const { viewIsLoading, viewIsNotLoading } = loadingSlice.actions;
export const loadingState = (state) => state.loading.value;

export default loadingSlice.reducer;
