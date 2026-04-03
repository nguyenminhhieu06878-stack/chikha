import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { ordersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasCancelled, setHasCancelled] = useState(false);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Prevent multiple executions
    if (hasCancelled) return;

    const cancelOrder = async () => {
      if (orderId) {
        setHasCancelled(true);
        try {
          // Cancel order
          await ordersAPI.cancelOrder(orderId);
        } catch (error) {
          console.error('Failed to cancel order:', error);
        }
      }
      setLoading(false);
    };

    cancelOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Payment Cancelled
      </h1>
      <p className="text-gray-600 mb-8">
        Your payment was cancelled. The order has been cancelled automatically.
      </p>
      <div className="space-x-4">
        <button
          onClick={() => navigate('/cart')}
          className="btn-primary"
        >
          Back to Cart
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

export default PaymentCancel;
