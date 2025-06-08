import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import MapView, { Marker, MapMarker } from 'react-native-maps';
import { useDispatch } from 'react-redux';
import { CanisterType, Worker } from '../types';
import { PaymentSheet } from '../components/PaymentSheet';
import socketService from '../services/socketService';
import { useAppSelector } from '../redux/hooks';
import type { RootState } from '../redux/store';
import { useNavigation } from '@react-navigation/native';

interface MarkerProps {
  identifier: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  pinColor?: string;
}

const DEFAULT_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
};

export const ClientDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useAppSelector((state: RootState) => state.auth.user);
  
  if (!user) {
    // If no user is found, redirect to auth screen
    React.useEffect(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }, [navigation]);
    return null;
  }

  const [selectedFromType, setSelectedFromType] = useState<CanisterType>('bota1');
  const [selectedToType, setSelectedToType] = useState<CanisterType>('bota2');
  const [price, setPrice] = useState(0);
  const [motivationFee, setMotivationFee] = useState(0);
  const [nearbyWorkers, setNearbyWorkers] = useState<Worker[]>([]);
  const [userLocation, setUserLocation] = useState(user.location || DEFAULT_LOCATION);
  const [showPayment, setShowPayment] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [workerLocation, setWorkerLocation] = useState<{latitude: number; longitude: number} | null>(null);
  
  const requests = useAppSelector(state => state.requests.userRequests);

  useEffect(() => {
    // TODO: Implement actual location tracking and worker fetching
    const mockWorkers: Worker[] = [
      {
        id: '1',
        name: 'Worker 1',
        location: {
          latitude: userLocation.latitude + 0.001,
          longitude: userLocation.longitude + 0.001,
        },
        isAvailable: true,
        rating: 4.5,
        completedDeliveries: 150,
      },
      // Add more mock workers as needed
    ];
    setNearbyWorkers(mockWorkers);
  }, [userLocation]);
  useEffect(() => {
    const handleLocationUpdate = (data: { workerId: string; location: { latitude: number; longitude: number } }) => {
      if (currentRequestId) {
        setWorkerLocation(data.location);
      }
    };

    socketService.addEventListener('location:update', handleLocationUpdate);

    return () => {
      socketService.removeEventListener('location:update', handleLocationUpdate);
    };
  }, [currentRequestId]);

  const calculatePrice = () => {
    // Simple price calculation based on canister types
    const basePrice = 50; // Base delivery fee
    const canisterPrice = 30; // Price per canister
    return basePrice + canisterPrice;
  };

  const handleCreateRequest = async () => {
    const totalPrice = calculatePrice();
    setPrice(totalPrice);
    setShowPayment(true);
  };
  const handlePaymentSuccess = () => {
    const newRequest = {
      clientId: user.id,
      fromCanister: selectedFromType,
      toCanister: selectedToType,
      location: userLocation,
      price: price,
      motivationFee: motivationFee,
      createdAt: new Date().toISOString()
    };

    socketService.createRequest(newRequest);
    Alert.alert(
      'Success',
      'Your request has been created! Nearby workers will be notified.',
      [{ text: 'OK' }]
    );
    setShowPayment(false);
  };

  const handlePaymentFailure = () => {
    Alert.alert(
      'Payment Failed',
      'There was an error processing your payment. Please try again.',
      [{ text: 'OK' }]
    );
    setShowPayment(false);
  };

  const handleRequestService = () => {
    if (!user) return;
    
    socketService.emit('service-request', {
      clientId: user.id,
      location: userLocation,
      // ...other request details...
    });
  };

  return (
    <View style={styles.container} testID="client-dashboard">
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker 
          identifier="user"
          coordinate={userLocation} 
          title="Your Location" 
          testID="user-marker"
        />
        {nearbyWorkers.map((worker, index) => (
          <Marker
            key={worker.id}
            identifier={`worker-${worker.id}`}
            coordinate={worker.location}
            title={`${worker.name} (${worker.rating}★)`}
            pinColor="blue"
            testID={`worker-marker-${worker.id}`}
          />
        ))}
        {workerLocation && (
          <Marker
            identifier="active-worker"
            coordinate={workerLocation}
            title="Worker Location"
            pinColor="green"
          />
        )}
      </MapView>

      <ScrollView style={styles.requestForm}>
        <Text style={styles.title}>Request Gas Canister</Text>

        <View style={styles.canisterSelector}>
          <View>
            <Text style={styles.label}>Your Canister Type:</Text>
            {['bota1', 'bota2', 'bota3', 'bota4'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  selectedFromType === type && styles.selectedType,
                ]}
                onPress={() => setSelectedFromType(type as CanisterType)}
              >
                <Text
                  style={[
                    styles.typeText,
                    selectedFromType === type && styles.selectedTypeText,
                  ]}
                >
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View>
            <Text style={styles.label}>Desired Canister Type:</Text>
            {['bota1', 'bota2', 'bota3', 'bota4'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  selectedToType === type && styles.selectedType,
                ]}
                onPress={() => setSelectedToType(type as CanisterType)}
              >
                <Text
                  style={[
                    styles.typeText,
                    selectedToType === type && styles.selectedTypeText,
                  ]}
                >
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.requestButton}
          onPress={handleCreateRequest}
          testID="create-request-button"
        >
          <Text style={styles.requestButtonText}>Create Request</Text>
        </TouchableOpacity>
      </ScrollView>

      {showPayment && (
        <PaymentSheet
          amount={price + motivationFee}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
          testID="payment-sheet"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  requestForm: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  canisterSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  typeButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    width: 150,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    fontSize: 16,
    color: '#333',
  },
  selectedTypeText: {
    color: 'white',
  },
  requestButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
