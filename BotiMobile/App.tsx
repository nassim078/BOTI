import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { StripeProvider } from '@stripe/stripe-react-native';

import { AuthScreen } from './src/screens/AuthScreen';
import { ClientDashboard } from './src/screens/ClientDashboard';
import { WorkerDashboard } from './src/screens/WorkerDashboard';
import { RootStackParamList } from './src/navigation/types';
import store, { RootState } from './src/redux/store';
import { useAppSelector } from './src/redux/hooks';

const Stack = createStackNavigator<RootStackParamList>();

const AppContent = () => {
  const auth = useAppSelector((state: RootState) => state.auth);

  // Start location tracking for workers
  React.useEffect(() => {
    if (auth.user?.role === 'worker') {
      const setupLocationTracking = async () => {
        try {
          const locationService = (await import('./src/services/locationService')).default;
          await locationService.startTracking();
        } catch (error) {
          console.error('Failed to start location tracking:', error);
        }
      };
      setupLocationTracking();
      return () => {
        try {
          const locationService = require('./src/services/locationService').default;
          locationService.stopTracking();
        } catch (error) {
          console.error('Failed to stop location tracking:', error);
        }
      };
    }
  }, [auth.user?.role]);

  if (auth.isLoading) {
    return null; // or your loading component
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!auth.user ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              {auth.user.role === 'client' ? (
                <Stack.Screen
                  name="ClientDashboard"
                  component={ClientDashboard}
                />
              ) : (
                <Stack.Screen
                  name="WorkerDashboard"
                  component={WorkerDashboard}
                />
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <StripeProvider
        publishableKey={process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || ''}
        merchantIdentifier="merchant.com.boti"
      >
        <AppContent />
      </StripeProvider>
    </Provider>
  );
}
