import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    if (error === 'invalid_signature') return 'Invalid payment signature';
    if (error === 'invalid_order') return 'Invalid order information';
    if (error === 'order_not_found') return 'Order not found';
    if (error === 'system_error') return 'System error occurred';
    return error || 'Payment was not completed';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <XCircle className="w-20 h-20 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>
          
          <p className="text-gray-600 mb-2">
            {getErrorMessage()}
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            Your order has been created but payment was not completed.
          </p>
          
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <p className="text-lg font-semibold text-gray-900">#{orderId}</p>
            </div>
          )}
          
          <div className="space-y-3">
            {orderId && (
              <button
                onClick={() => navigate(`/orders/${orderId}`)}
                className="btn-primary w-full py-3"
              >
                View Order & Retry Payment
              </button>
            )}
            
            <button
              onClick={() => navigate('/cart')}
              className="btn-secondary w-full py-3"
            >
              Back to Cart
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 w-full py-2"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
