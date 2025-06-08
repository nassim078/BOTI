import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import paymentService from '../services/paymentService';

interface PaymentSheetProps {
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentFailure: () => void;
}

export const PaymentSheet: React.FC<PaymentSheetProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const initializePayment = async () => {
    try {
      setLoading(true);
      const success = await paymentService.processPayment(amount);
      
      if (success) {
        onPaymentSuccess();
      } else {
        onPaymentFailure();
      }
    } catch (error) {
      Alert.alert('Error', 'There was a problem processing your payment. Please try again.');
      onPaymentFailure();
    } finally {
      setLoading(false);
    }
  };

  return null; // This component doesn't render anything, it just handles the payment logic
};
