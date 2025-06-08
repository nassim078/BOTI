import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Request } from '../types';

interface RequestsState {
  activeRequests: Request[];
  userRequests: Request[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RequestsState = {
  activeRequests: [],
  userRequests: [],
  isLoading: false,
  error: null,
};

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    fetchRequestsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchRequestsSuccess: (state, action: PayloadAction<Request[]>) => {
      state.isLoading = false;
      state.activeRequests = action.payload;
      state.error = null;
    },
    fetchRequestsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createRequest: (state, action: PayloadAction<Request>) => {
      state.activeRequests.push(action.payload);
      state.userRequests.push(action.payload);
    },
    updateRequestStatus: (state, action: PayloadAction<{ id: string; status: Request['status'] }>) => {
      const { id, status } = action.payload;
      const request = state.activeRequests.find(r => r.id === id);
      if (request) {
        request.status = status;
      }
      const userRequest = state.userRequests.find(r => r.id === id);
      if (userRequest) {
        userRequest.status = status;
      }
    },
  },
});

export const {
  fetchRequestsStart,
  fetchRequestsSuccess,
  fetchRequestsFailure,
  createRequest,
  updateRequestStatus,
} = requestsSlice.actions;
export default requestsSlice.reducer;
