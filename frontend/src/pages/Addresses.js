import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Vietnam',
    is_default: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/addresses');
      setAddresses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, formData);
      } else {
        await api.post('/addresses', formData);
      }
      fetchAddresses();
      resetForm();
      alert(editingId ? 'Address updated successfully!' : 'Address added successfully!');
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Unable to save address');
    }
  };

  const handleEdit = (address) => {
    setFormData({
      full_name: address.full_name,
      phone: address.phone,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country || 'Vietnam',
      is_default: address.is_default === 1
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await api.delete(`/addresses/${id}`);
      fetchAddresses();
      alert('Address deleted successfully!');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Unable to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/addresses/${id}/default`);
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default:', error);
      alert('Unable to set default address');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Vietnam',
      is_default: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <MapPin className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Shipping Addresses
          </h1>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Address</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-xl font-bold">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h2>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="input"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input"
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address_line_1}
                  onChange={(e) => setFormData({...formData, address_line_1: e.target.value})}
                  className="input"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address 2 (optional)
                </label>
                <input
                  type="text"
                  value={formData.address_line_2}
                  onChange={(e) => setFormData({...formData, address_line_2: e.target.value})}
                  className="input"
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="input"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="input"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postal_code}
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    className="input"
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
                  Set as default address
                </label>
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update' : 'Add Address'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No shipping addresses yet
          </h2>
          <p className="text-gray-600 mb-6">
            Add an address for faster checkout
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`card ${address.is_default ? 'border-2 border-primary-500' : ''}`}
            >
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {address.full_name}
                      </h3>
                      {address.is_default === 1 && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{address.phone}</p>
                    <p className="text-gray-600 mt-2">
                      {address.address_line_1}
                      {address.address_line_2 && `, ${address.address_line_2}`}
                    </p>
                    <p className="text-gray-600">
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                    <p className="text-gray-600">{address.country}</p>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {address.is_default !== 1 && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Set as default"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;