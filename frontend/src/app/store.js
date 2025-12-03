import { configureStore } from '@reduxjs/toolkit';
import auth from '../features/auth/authSlice.js';
import payments from '../features/payments/paymentSlice.js';
import siteAnalyzer from '../features/siteAnalyzer/analyzerSlice.js';

const store = configureStore({
  reducer: {
    auth,
    payments,
    siteAnalyzer,
  },
});

export default store;
