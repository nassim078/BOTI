import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Request, Location } from '../types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import socketService from '../services/socketService';
import locationService from '../services/locationService';

interface WorkerDashboardProps {
  user: {
    id: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ user }) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [userLocation, setUserLocation] = useState(user.location || {
    latitude: 0,
    longitude: 0,
  });

  const dispatch = useAppDispatch();
  const nearbyRequests = useAppSelector(state => state.requests.activeRequests);
  useEffect(() => {
    if (isAvailable) {
      const startTracking = async () => {
        await locationService.startTracking();
      };
      startTracking();

      socketService.addEventListener('request:new', (request: Request) => {
        // Handle new request notifications
        Alert.alert(
          'New Request',
          `New gas canister exchange request from ${request.fromCanister} to ${request.toCanister}`,
          [
            { text: 'Ignore', style: 'cancel' },
            { text: 'View', onPress: () => handleViewRequest(request.id) }
          ]
        );
      });
    } else {
      locationService.stopTracking();
    }

    return () => {
      locationService.stopTracking();
      // Clean up socket listeners if needed
    };
  }, [isAvailable]);

  const handleViewRequest = (requestId: string) => {
    const request = nearbyRequests.find(r => r.id === requestId);
    if (request) {
      Alert.alert(
        'Request Details',
        `From: ${request.fromCanister}\nTo: ${request.toCanister}\nPrice: $${request.price + request.motivationFee}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Accept', onPress: () => handleAcceptRequest(requestId) }
        ]
      );
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      socketService.acceptRequest(requestId);
      Alert.alert('Success', 'Request accepted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept request. Please try again.');
    }
  };

  const handleAvailabilityToggle = async (value: boolean) => {
    setIsAvailable(value);
    if (value) {
      await locationService.startTracking();
    } else {
      locationService.stopTracking();
    }
  };

  const renderRequestItem = ({ item }: { item: Request }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>
          {item.fromCanister} → {item.toCanister}
        </Text>
        <Text style={styles.price}>${item.price + item.motivationFee}</Text>
      </View>
      
      <Text style={styles.requestDetail}>
        Base Price: ${item.price}
      </Text>
      <Text style={styles.requestDetail}>
        Motivation Fee: ${item.motivationFee}
      </Text>
      
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleAcceptRequest(item.id)}
      >
        <Text style={styles.acceptButtonText}>Accept Request</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container} testID="worker-dashboard">
      <MapView
        style={styles.map}
        testID="worker-map"
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
          pinColor="blue"
          testID="worker-marker"
        />
        {nearbyRequests.filter(r => r.status === 'pending').map((request) => (
          <Marker
            key={request.id}
            identifier={`request-${request.id}`}
            coordinate={request.location}
            title={`${request.fromCanister} → ${request.toCanister}`}
            description={`Price: $${request.price + request.motivationFee}`}
            pinColor="red"
            testID={`request-marker-${request.id}`}
          />
        ))}
      </MapView>

      <View style={styles.statusBar} testID="status-bar">
        <Text style={styles.statusText}>
          Status: {isAvailable ? 'Available' : 'Unavailable'}
        </Text>
        <Switch
          testID="availability-toggle"
          value={isAvailable}
          onValueChange={handleAvailabilityToggle}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isAvailable ? '#007AFF' : '#f4f3f4'}
        />
      </View>

      <FlatList
        testID="requests-list"
        data={nearbyRequests}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.requestItem}
            onPress={() => handleViewRequest(item.id)}
            testID={`request-item-${item.id}`}
          >
            <Text style={styles.requestText}>
              {item.fromCanister} → {item.toCanister}
            </Text>
            <Text style={styles.priceText}>
              ${item.price + item.motivationFee}
            </Text>
          </TouchableOpacity>
        )}
      />
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
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  requestsList: {
    backgroundColor: 'white',
    padding: 20,
    maxHeight: '40%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  requestCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  requestDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  acceptButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
