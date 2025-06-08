import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import requestsReducer from './requestsSlice';
import { socketMiddleware } from './socketMiddleware';

const store = configureStore({
  reducer: {
    auth: authReducer,
    requests: requestsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
