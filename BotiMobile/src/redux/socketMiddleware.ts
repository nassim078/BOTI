import { Middleware } from '@reduxjs/toolkit';
import socketService from '../services/socketService';
import { loginSuccess, logout } from './authSlice';
import { createRequest, updateRequestStatus } from './requestsSlice';

export const socketMiddleware: Middleware = store => next => action => {
  if (loginSuccess.match(action)) {
    // Connect socket when user logs in
    socketService.connect(action.payload.id);
  }

  if (logout.match(action)) {
    // Disconnect socket when user logs out
    socketService.disconnect();
  }

  // Handle real-time events in the middleware
  socketService.socket?.on('request:new', (request) => {
    store.dispatch(createRequest(request));
  });

  socketService.socket?.on('request:update', (request) => {
    store.dispatch(updateRequestStatus({
      id: request.id,
      status: request.status,
    }));
  });

  return next(action);
}
