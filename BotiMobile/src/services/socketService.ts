import io, { Socket } from 'socket.io-client';
import { User, Request } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private eventListeners: Map<string, ((...args: any[]) => void)[]> = new Map();

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(userId: string) {
    this.socket = io('YOUR_BACKEND_URL', {
      query: { userId },
      transports: ['websocket'],
    });

    this.setupListeners();
  }
  addEventListener(event: string, callback: (...args: any[]) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
    
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  removeEventListener(event: string, callback: (...args: any[]) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
    
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  private setupListeners() {
    if (!this.socket) return;

    // Re-attach all event listeners when socket reconnects
    this.eventListeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('request:new', (request: Request) => {
      // Handle new request
      console.log('New request received:', request);
    });

    this.socket.on('request:update', (request: Request) => {
      // Handle request update
      console.log('Request updated:', request);
    });

    this.socket.on('location:update', (data: { workerId: string; location: { latitude: number; longitude: number } }) => {
      // Handle worker location update
      console.log('Worker location updated:', data);
    });
  }

  // Send worker's location update
  updateLocation(location: { latitude: number; longitude: number }) {
    if (!this.socket) return;
    this.socket.emit('location:update', location);
  }

  // Send new request
  createRequest(request: Omit<Request, 'id' | 'status'>) {
    if (!this.socket) return;
    this.socket.emit('request:create', request);
  }

  // Update request status
  updateRequestStatus(requestId: string, status: Request['status']) {
    if (!this.socket) return;
    this.socket.emit('request:updateStatus', { requestId, status });
  }

  // Accept request (for workers)
  acceptRequest(requestId: string) {
    if (!this.socket) return;
    this.socket.emit('request:accept', { requestId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default SocketService.getInstance();
