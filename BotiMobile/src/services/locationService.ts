import * as Location from 'expo-location';
import socketService from './socketService';

class LocationService {
  private static instance: LocationService;
  private locationSubscription: Location.LocationSubscription | null = null;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return false;
    }
    return true;
  }

  async startTracking() {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Start watching position
    this.locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        // Send location update through socket
        socketService.updateLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );
  }

  stopTracking() {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }
}

export default LocationService.getInstance();
