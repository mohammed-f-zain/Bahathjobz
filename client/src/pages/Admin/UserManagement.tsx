import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Search, Filter, MoreVertical, Shield, Ban, Eye, CheckCircle, XCircle,Trash2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// const roleOptions = [
//   { value: '', label: 'All Roles' },
//   { value: 'job_seeker', label: 'Job Seeker' },
//   { value: 'employer', label: 'Employer' },
//   { value: 'super_admin', label: 'Super Admin' },
// ];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inaactive' },
  // { value: 'suspended', label: 'Suspended' },
];

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('job_seeker');
  const [statusFilter, setStatusFilter] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Initial load shows skeleton
    if (isInitialLoad) {
      fetchUsers(true);
      setIsInitialLoad(false);
      return;
    }

    // Subsequent loads use debounce without skeleton
    const timer = setTimeout(() => {
      fetchUsers(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [roleFilter, statusFilter, searchTerm, pagination.page]);

  const fetchUsers = async (showLoader = false) => {
    try { 
      if (showLoader) setLoading(true);
      
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/admin/users?${params.toString()}`);

      const usersData = response.data.users || response.data.data || [];
      const paginationData = response.data.pagination || response.data.meta || pagination;

      setUsers(usersData);
      setPagination(prev => ({ ...prev, ...paginationData }));
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { is_active: !currentStatus });
      toast.success('User status updated successfully');
      fetchUsers(false); // Refresh without skeleton
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers(false); // Refresh without skeleton
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return badges[status.toLowerCase() as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      job_seeker: 'bg-blue-100 text-blue-800',
      employer: 'bg-purple-100 text-purple-800',
      super_admin: 'bg-gray-100 text-gray-800',
    };
    return badges[role as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Job Seeker Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage all platform Job Seekers and their activities</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status"
          />          
        </div>
      </Card>

      {/* Users Table - Desktop */}
      <Card className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Join Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Last Active</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
              {users
                .filter((user) => user.role === 'job_seeker')
                .map((user: any) => {
                const firstName = user.firstName || user.first_name || '';
                const lastName = user.lastName || user.last_name || '';
                const status = user.is_active  !== undefined ? (user.is_active ? 'active' : 'inactive') : user.status || 'inactive';
                const role = user.role || '';

                return (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-medium text-sm">
                            {firstName[0]}{lastName[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{firstName} {lastName}</p>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(role)}`}>
                        {role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusToggle(user.id, status === 'active')}
                          className={
                            status === "active"
                              ? "text-red-600 hover:text-red-700"
                              : "text-green-600 hover:text-green-700"
                          }
                        >
                          {status === "active" ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>                                            
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {users.length === 0 && (
          <Card className="text-center py-6 text-gray-500">
            No users found.
          </Card>
        )}
        {users
          .filter((user) => user.role === 'job_seeker')
          .map((user: any) => {
          const firstName = user.firstName || user.first_name || '';
          const lastName = user.lastName || user.last_name || '';
          const status = user.is_active !== undefined ? (user.is_active ? 'active' : 'inactive') : user.status || 'inactive';
          const role = user.role || '';

          return (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-medium">
                      {firstName[0]}{lastName[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{firstName} {lastName}</p>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
                  {status.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>Role: <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(role)}`}>{role.replace('_', ' ')}</span></span>
                <span>Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStatusToggle(user.id, status === 'active')}
                  className={status === "active" ? "text-red-600" : "text-green-600"}
                >
                  {status === "active" ? (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Activate
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="text-xs sm:text-sm"
              >
                Previous
              </Button>
              <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="text-xs sm:text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
