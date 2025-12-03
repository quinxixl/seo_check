import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyzeUrl } from './api.js';

export const analyzeUrlThunk = createAsyncThunk(
  'siteAnalyzer/analyzeUrl',
  async (url, { getState }) => {
    const state = getState();
    const currentPlan = state.payments?.plan || 'free';
    return await analyzeUrl(url, currentPlan);
  }
);

const analyzerSlice = createSlice({
  name: 'siteAnalyzer',
  initialState: {
    loading: false,
    checking: false, // Этап проверки доступности
    report: null,
    error: null,
    history: [],
  },
  reducers: {
    addToHistory: (state, action) => {
      const report = action.payload;
      const existingIndex = state.history.findIndex(r => r.url === report.url);
      if (existingIndex >= 0) {
        state.history[existingIndex] = report;
      } else {
        state.history.unshift(report);
        if (state.history.length > 10) {
          state.history = state.history.slice(0, 10);
        }
      }
    },
    clearHistory: (state) => {
      state.history = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeUrlThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeUrlThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
        state.error = null;
        const existingIndex = state.history.findIndex(r => r.url === action.payload.url);
        if (existingIndex >= 0) {
          state.history[existingIndex] = action.payload;
        } else {
        state.history.unshift(action.payload);
        // Лимит истории зависит от тарифа, но здесь используем базовый лимит
        // Детальная проверка будет в компоненте Dashboard
        if (state.history.length > 100) {
          state.history = state.history.slice(0, 100);
        }
        }
      })
      .addCase(analyzeUrlThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка при анализе сайта. Попробуйте ещё раз.';
      });
  },
});

export const { addToHistory, clearHistory } = analyzerSlice.actions;

export default analyzerSlice.reducer;
