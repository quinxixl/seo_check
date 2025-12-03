import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  plan: 'free',
  // Тарифы, которые пользователь уже «купил» и может свободно переключать
  unlockedPlans: ['free'],
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
    unlockPlan: (state, action) => {
      const planId = action.payload;
      if (!state.unlockedPlans.includes(planId)) {
        state.unlockedPlans.push(planId);
      }

      // Если куплен максимальный тариф, разблокируем все
      if (planId === 'business') {
        state.unlockedPlans = ['free', 'pro', 'business'];
      }
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

export const { setPlan, unlockPlan, incrementAnalysesCount, resetDailyCount } = paymentSlice.actions;
export default paymentSlice.reducer;
