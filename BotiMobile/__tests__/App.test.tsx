import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { StripeProvider } from '@stripe/stripe-react-native';
import { configureStore } from '@reduxjs/toolkit';
import store from '../src/redux/store';
import AppContent from '../App';
import { ClientDashboard } from '../src/screens/ClientDashboard';
import { WorkerDashboard } from '../src/screens/WorkerDashboard';
import socketService from '../src/services/socketService';
import locationService from '../src/services/locationService';

// Mock the services
jest.mock('../src/services/socketService');
jest.mock('../src/services/locationService');

describe('Boti App Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('Client Flow', () => {
    const mockUser = {
      id: '123',
      role: 'client',
      location: { latitude: 37.7749, longitude: -122.4194 }
    };

    test('Client Dashboard Renders Correctly', () => {
      const { getByTestId, queryByTestId } = render(
        <Provider store={store}>
          <ClientDashboard user={mockUser} />
        </Provider>
      );

      expect(getByTestId('client-dashboard')).toBeTruthy();
      expect(getByTestId('user-marker')).toBeTruthy();
      expect(getByTestId('from-canister-select')).toBeTruthy();
      expect(getByTestId('to-canister-select')).toBeTruthy();
      expect(getByTestId('create-request-button')).toBeTruthy();
      expect(queryByTestId('payment-sheet')).toBeNull();
    });

    test('Request Creation Flow', async () => {
      const { getByTestId, getByText } = render(
        <Provider store={store}>
          <ClientDashboard user={mockUser} />
        </Provider>
      );

      // Select canister types
      fireEvent.press(getByTestId('from-canister-select'));
      fireEvent.press(getByText('bota1'));
      fireEvent.press(getByTestId('to-canister-select'));
      fireEvent.press(getByText('bota2'));

      // Create request
      fireEvent.press(getByTestId('create-request-button'));

      // Verify payment sheet appears
      await waitFor(() => {
        expect(getByTestId('payment-sheet')).toBeTruthy();
      });
    });

    test('Nearby Workers Display', async () => {
      const mockWorkers = [
        { id: 'w1', location: { latitude: 37.7750, longitude: -122.4195 }, name: 'Worker 1', rating: 4.5 },
        { id: 'w2', location: { latitude: 37.7751, longitude: -122.4196 }, name: 'Worker 2', rating: 4.8 }
      ];

      const { findByTestId } = render(
        <Provider store={store}>
          <ClientDashboard user={mockUser} />
        </Provider>
      );

      // Wait for worker markers to appear
      await findByTestId('worker-marker-w1');
      await findByTestId('worker-marker-w2');
    });
  });

  describe('Worker Flow', () => {
    const mockUser = {
      id: '456',
      role: 'worker',
      location: { latitude: 37.7749, longitude: -122.4194 }
    };

    test('Worker Dashboard Renders Correctly', () => {
      const { getByTestId } = render(
        <Provider store={store}>
          <WorkerDashboard user={mockUser} />
        </Provider>
      );

      expect(getByTestId('worker-dashboard')).toBeTruthy();
      expect(getByTestId('worker-map')).toBeTruthy();
      expect(getByTestId('worker-marker')).toBeTruthy();
      expect(getByTestId('availability-toggle')).toBeTruthy();
      expect(getByTestId('status-bar')).toBeTruthy();
      expect(getByTestId('requests-list')).toBeTruthy();
    });

    test('Location Tracking Toggle', async () => {
      const { getByTestId } = render(
        <Provider store={store}>
          <WorkerDashboard user={mockUser} />
        </Provider>
      );

      const toggle = getByTestId('availability-toggle');
      
      // Toggle availability off
      fireEvent(toggle, 'valueChange', false);
      
      await waitFor(() => {
        expect(locationService.stopTracking).toHaveBeenCalled();
      });

      // Toggle availability on
      fireEvent(toggle, 'valueChange', true);
      
      await waitFor(() => {
        expect(locationService.startTracking).toHaveBeenCalled();
      });
    });

    test('New Request Notifications', async () => {
      const { findByTestId } = render(
        <Provider store={store}>
          <WorkerDashboard user={mockUser} />
        </Provider>
      );

      const mockRequest = {
        id: 'r1',
        fromCanister: 'bota1',
        toCanister: 'bota2',
        location: { latitude: 37.7750, longitude: -122.4195 },
        price: 50,
        motivationFee: 10
      };

      // Simulate new request
      act(() => {
        socketService.emit('request:new', mockRequest);
      });

      // Verify request marker appears
      await findByTestId(`request-marker-${mockRequest.id}`);
    });
  });
});
