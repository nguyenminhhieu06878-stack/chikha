import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { paymentAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Prevent multiple executions
    if (hasVerified) return;

    const verifyPayment = async () => {
      if (!orderId) {
        toast.error('Invalid order');
        navigate('/orders');
        return;
      }

      setHasVerified(true);

      try {
        // Verify payment status with backend
        const response = await paymentAPI.getPayOSStatus(orderId);
        
        if (response.data.success && response.data.data.paymentStatus === 'paid') {
          setVerified(true);
          await clearCart();
          toast.success('Payment successful!');
        } else {
          toast.error('Payment verification failed');
          navigate(`/orders/${orderId}`);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!verified) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Payment Successful!
      </h1>
      <p className="text-gray-600 mb-8">
        Your order has been placed successfully. Thank you for your purchase!
      </p>
      <div className="space-x-4">
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="btn-primary"
        >
          View Order Details
        </button>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
