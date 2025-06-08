import { initStripe, createPaymentMethod, confirmPayment } from '@stripe/stripe-react-native';

class PaymentService {
  private static instance: PaymentService;
  private publishableKey = 'YOUR_STRIPE_PUBLISHABLE_KEY'; // Replace with your actual key

  private constructor() {
    this.initialize();
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  private async initialize() {
    await initStripe({
      publishableKey: this.publishableKey,
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<string> {
    try {
      const response = await fetch('YOUR_BACKEND_URL/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      });

      const { clientSecret } = await response.json();
      return clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async processPayment(amount: number): Promise<boolean> {
    try {
      // Create payment method
      const { paymentMethod, error: paymentMethodError } = await createPaymentMethod({
        type: 'Card',
      });

      if (paymentMethodError) {
        console.error('Error creating payment method:', paymentMethodError);
        return false;
      }

      // Get client secret
      const clientSecret = await this.createPaymentIntent(amount);

      // Confirm payment
      const { error: confirmError } = await confirmPayment(clientSecret, {
        paymentMethodId: paymentMethod.id,
      });

      if (confirmError) {
        console.error('Error confirming payment:', confirmError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error processing payment:', error);
      return false;
    }
  }
}

export default PaymentService.getInstance();
