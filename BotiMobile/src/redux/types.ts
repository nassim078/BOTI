import { User } from '../types';

import { Request } from '../types';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface RequestsState {
  activeRequests: Request[];
  userRequests: Request[];
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  requests: RequestsState;
}
