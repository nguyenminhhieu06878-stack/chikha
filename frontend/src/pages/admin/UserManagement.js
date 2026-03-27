import { useState, useEffect, useCallback } from 'react';
import { Users, Search, Filter, Edit, Trash2, Eye, UserPlus, X } from 'lucide-react';
import { adminAPI } from '../../services/api';
import UserModal from '../../components/UserModal';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: filterRole === 'all' ? undefined : filterRole
      };

      const response = await adminAPI.getUsers(params);
      const usersData = response.data.data || [];
      
      setUsers(usersData);
      setTotalPages(response.data.pagination?.total_pages || 1);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách người dùng');
      console.error('Error fetching users:', err);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleViewUser = async (user) => {
    try {
      const response = await adminAPI.getUser(user.id);
      setViewingUser(response.data.data);
    } catch (err) {
      toast.error('Không thể tải thông tin người dùng');
      console.error('Error fetching user details:', err);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      setModalLoading(true);
      
      if (editingUser) {
        // Update existing user
        await adminAPI.updateUser(editingUser.id, userData);
        toast.success('Cập nhật người dùng thành công');
      } else {
        // Create new user
        await adminAPI.createUser(userData);
        toast.success('Thêm người dùng thành công');
      }
      
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      const message = err.response?.data?.error || 'Có lỗi xảy ra';
      toast.error(message);
      console.error('Error saving user:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.full_name}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(user.id);
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (err) {
      const message = err.response?.data?.error || 'Không thể xóa người dùng';
      toast.error(message);
      console.error('Error deleting user:', err);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/6 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="animate-pulse p-6">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
            <p className="text-gray-600 mt-1">Quản lý tài khoản người dùng trong hệ thống</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-500">Người dùng</div>
            </div>
            <button
              onClick={handleAddUser}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors duration-200"
            >
              <UserPlus className="w-5 h-5" />
              <span>Thêm người dùng</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="customer">Khách hàng</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thống kê nhanh
            </label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-red-50 px-3 py-2 rounded-lg">
                <div className="font-semibold text-red-800">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-red-600">Admin</div>
              </div>
              <div className="bg-green-50 px-3 py-2 rounded-lg">
                <div className="font-semibold text-green-800">
                  {users.filter(u => u.role === 'customer').length}
                </div>
                <div className="text-green-600">Khách hàng</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cập nhật
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500">
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.updated_at ? formatDate(user.updated_at) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Xóa"
                        disabled={user.role === 'admin'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có người dùng nào</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterRole !== 'all' 
                ? 'Không tìm thấy người dùng nào phù hợp với bộ lọc'
                : 'Bắt đầu bằng cách thêm người dùng đầu tiên'
              }
            </p>
            {!searchTerm && filterRole === 'all' && (
              <button
                onClick={handleAddUser}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Thêm người dùng đầu tiên
              </button>
            )}
          </div>
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-700">
            Trang {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}
      
      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        user={editingUser}
        isLoading={modalLoading}
      />

      {/* User Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setViewingUser(null)}></div>
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Chi tiết người dùng</h3>
                <button onClick={() => setViewingUser(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                  <p className="text-sm text-gray-900">{viewingUser.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{viewingUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <p className="text-sm text-gray-900">{viewingUser.phone || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                  <p className="text-sm text-gray-900">{viewingUser.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                </div>
                {viewingUser.stats && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Thống kê</label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{viewingUser.stats.total_orders}</div>
                        <div className="text-xs text-gray-500">Đơn hàng</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{viewingUser.stats.total_spent?.toLocaleString() || 0}đ</div>
                        <div className="text-xs text-gray-500">Đã chi</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{viewingUser.stats.total_reviews}</div>
                        <div className="text-xs text-gray-500">Đánh giá</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;