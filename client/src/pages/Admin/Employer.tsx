import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Search, Filter, MoreVertical, Shield, Ban, Eye, CheckCircle, XCircle,Trash2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'job_seeker', label: 'Job Seeker' },
  { value: 'employer', label: 'Employer' },
  { value: 'super_admin', label: 'Super Admin' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inaactive' },
  // { value: 'suspended', label: 'Suspended' },
];

export function AllEmployer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('employer');
  const [statusFilter, setStatusFilter] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
  const timer = setTimeout(() => {
    fetchUsers();
  }, 900); // wait 900ms after typing stops

  return () => clearTimeout(timer); // cleanup previous timer
}, [roleFilter, statusFilter, searchTerm, pagination.page]);

  const fetchUsers = async () => {
    try { 
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/admin/users?${params.toString()}`);
      console.log('API Response:', response.data);

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
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
  if (window.confirm('Are you sure you want to delete this employer and all related data (companies, jobs, etc.)?')) {
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Employer and related data deleted successfully');
      fetchUsers(); // refresh list
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete employer');
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employer Management</h1>
          <p className="text-gray-600">Manage all platform Employers and their activities</p>
        </div>
        {/* <Button>
          <Shield className="h-4 w-4 mr-2" />
          Export Report
        </Button> */}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* <Select
            options={roleOptions}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            placeholder="Filter by role"
          /> */}
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status"
          />          
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Join Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Active</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
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
                .filter((user) => user.role === 'employer')
                .map((user: any) => {
                const firstName = user.firstName || user.first_name || '';
                const lastName = user.lastName || user.last_name || '';
                const status = user.is_active  !== undefined ? (user.is_active ? 'active' : 'inactive') : user.status || 'inactive';
                const role = user.role || '';

                return (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {firstName[0]}{lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{firstName} {lastName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
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
                    <td className="py-3 px-4 text-gray-600">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {/* <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button> */}
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
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                            </>
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
                        {/* <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </td>                                            
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
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