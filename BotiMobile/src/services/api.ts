import axios from 'axios';
import { User, Request, Worker } from '../types';

// TODO: Replace with your actual API URL
const API_URL = 'https://your-api-url.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export const requestsAPI = {
  createRequest: async (request: Partial<Request>): Promise<Request> => {
    const response = await api.post('/requests', request);
    return response.data;
  },

  getNearbyRequests: async (latitude: number, longitude: number): Promise<Request[]> => {
    const response = await api.get('/requests/nearby', {
      params: { latitude, longitude },
    });
    return response.data;
  },

  updateRequestStatus: async (
    requestId: string,
    status: Request['status'],
    workerId?: string
  ): Promise<Request> => {
    const response = await api.patch(`/requests/${requestId}`, {
      status,
      workerId,
    });
    return response.data;
  },
};

export const workersAPI = {
  getNearbyWorkers: async (latitude: number, longitude: number): Promise<Worker[]> => {
    const response = await api.get('/workers/nearby', {
      params: { latitude, longitude },
    });
    return response.data;
  },

  updateWorkerLocation: async (workerId: string, latitude: number, longitude: number): Promise<void> => {
    await api.post(`/workers/${workerId}/location`, {
      latitude,
      longitude,
    });
  },

  updateWorkerAvailability: async (workerId: string, isAvailable: boolean): Promise<void> => {
    await api.post(`/workers/${workerId}/availability`, {
      isAvailable,
    });
  },
};
