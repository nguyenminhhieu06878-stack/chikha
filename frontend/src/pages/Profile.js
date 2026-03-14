import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Calendar, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      date_of_birth: user?.date_of_birth || '',
      gender: user?.gender || ''
    }
  });

  React.useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || ''
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await updateProfile(data);
    
    if (result.success) {
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-outline flex items-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="btn-outline flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card-content">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avatar Section */}
              <div className="md:col-span-2 flex items-center space-x-6">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-primary-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{user.full_name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                      Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    {...register('full_name', { required: 'Full name is required' })}
                    className={`input ${errors.full_name ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.full_name || 'Not provided'}</p>
                )}
                {errors.full_name && (
                  <p className="text-red-600 text-sm mt-1">{errors.full_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <p className="text-gray-900 py-2">{user.email}</p>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    {...register('phone', {
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'Invalid phone number'
                      }
                    })}
                    className={`input ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.phone || 'Not provided'}</p>
                )}
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    {...register('date_of_birth')}
                    type="date"
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {user.date_of_birth 
                      ? new Date(user.date_of_birth).toLocaleDateString()
                      : 'Not provided'
                    }
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                {isEditing ? (
                  <select {...register('gender')} className="input">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">
                    {user.gender 
                      ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1).replace('_', ' ')
                      : 'Not provided'
                    }
                  </p>
                )}
              </div>

              {/* Account Info */}
              <div className="md:col-span-2 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Type
                    </label>
                    <p className="text-gray-900">
                      {user.role === 'admin' ? 'Administrator' : 'Customer'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <p className="text-gray-900">
                      {user.created_at 
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'Unknown'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="card p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders</h3>
          <p className="text-gray-600 mb-4">View your order history</p>
          <a href="/orders" className="btn-outline">
            View Orders
          </a>
        </div>

        <div className="card p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wishlist</h3>
          <p className="text-gray-600 mb-4">Manage your saved items</p>
          <button className="btn-outline" disabled>
            Coming Soon
          </button>
        </div>

        <div className="card p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Addresses</h3>
          <p className="text-gray-600 mb-4">Manage shipping addresses</p>
          <button className="btn-outline" disabled>
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;