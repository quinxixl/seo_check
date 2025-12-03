import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  plan: 'free',
  analysesToday: 0,
  lastAnalysisDate: null,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setPlan: (state, action) => {
      state.plan = action.payload;
    },
    incrementAnalysesCount: (state) => {
      const today = new Date().toDateString();
      if (state.lastAnalysisDate !== today) {
        state.analysesToday = 1;
        state.lastAnalysisDate = today;
      } else {
        state.analysesToday += 1;
      }
    },
    resetDailyCount: (state) => {
      state.analysesToday = 0;
      state.lastAnalysisDate = null;
    },
  },
});

export const { setPlan, incrementAnalysesCount, resetDailyCount } = paymentSlice.actions;
export default paymentSlice.reducer;
