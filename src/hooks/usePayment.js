import { useState } from 'react';
import { useAsync } from './useAsync';
import { paymentAPI } from '../services/api/payment';
import { useWebSocket } from './useWebSocket';

export const usePayment = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const {
    execute: createIntent,
    loading: creatingIntent
  } = useAsync(paymentAPI.createPaymentIntent);

  const {
    execute: confirmPayment,
    loading: confirming
  } = useAsync(paymentAPI.confirmPayment);

  const {
    execute: generateCryptoAddress,
    loading: generatingAddress
  } = useAsync(paymentAPI.generateCryptoAddress);

  useWebSocket('payment_status', (data) => {
    setPaymentStatus(data.status);
    if (data.error) {
      setPaymentError(data.error);
    }
  });

  const handleStripePayment = async (amount) => {
    try {
      const { clientSecret } = await createIntent(amount);
      // Here you would typically handle the Stripe payment flow
      // using the Stripe.js library and the clientSecret
      return clientSecret;
    } catch (error) {
      setPaymentError(error.message);
      throw error;
    }
  };

  const handleCryptoPayment = async (currency) => {
    try {
      const { address, amount } = await generateCryptoAddress(currency);
      return { address, amount };
    } catch (error) {
      setPaymentError(error.message);
      throw error;
    }
  };

  return {
    handleStripePayment,
    handleCryptoPayment,
    paymentStatus,
    paymentError,
    loading: creatingIntent || confirming || generatingAddress
  };
};