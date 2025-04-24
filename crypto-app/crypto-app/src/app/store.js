import { configureStore } from '@reduxjs/toolkit';
import cryptoReducer from '../features/cryptoSlice';

export const store = configureStore({
  reducer: {
    crypto: cryptoReducer,
  },
});
