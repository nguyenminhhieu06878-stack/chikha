import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mt-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary inline-flex items-center px-6 py-3"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          
          <div>
            <button
              onClick={() => window.history.back()}
              className="btn-outline inline-flex items-center px-6 py-3"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? <Link to="/contact" className="text-primary-600 hover:text-primary-700">Contact us</Link></p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;