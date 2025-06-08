export type UserRole = 'client' | 'worker';

export interface Location {
  latitude: number;
  longitude: number;
}

export type CanisterType = 'bota1' | 'bota2' | 'bota3' | 'bota4';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: Location;
  phone?: string;
}

export interface Worker extends User {
  role: 'worker';
  location: Location;
  isAvailable: boolean;
  rating: number;
  completedDeliveries: number;
}

export type RequestStatus = 'pending' | 'accepted' | 'inProgress' | 'completed' | 'cancelled';

export interface Request {
  id: string;
  clientId: string;
  workerId?: string;
  fromCanister: CanisterType;
  toCanister: CanisterType;
  status: RequestStatus;
  price: number;
  motivationFee: number;
  location: Location;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  clientSecret: string;
  requestId: string;
  createdAt: string;
}
