import React, { useState } from 'react';
import { useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Search, CheckCircle, XCircle, Building2, Users, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { countryOptions, industryOptions, currentPositionOptions } from "../../utils/options";

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
];

const userStatusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function CompanyEmployerManagement() {
  const [activeTab, setActiveTab] = useState<'companies' | 'employers'>('companies');
  
  // Company Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companyStats, setCompanyStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    suspended: 0
  });
  const [companyPagination, setCompanyPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Employer Management State
  const [employerSearchTerm, setEmployerSearchTerm] = useState('');
  const [employerStatusFilter, setEmployerStatusFilter] = useState('');
  const [employers, setEmployers] = useState<any[]>([]);
  const [employersLoading, setEmployersLoading] = useState(true);
  const [employerPagination, setEmployerPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch Companies
  useEffect(() => {
    if (activeTab === 'companies') {
      fetchCompanies();
    }
  }, [statusFilter, industryFilter, companyPagination.page, activeTab]);

  useEffect(() => {
    if (activeTab === 'companies') {
      const delayedSearch = setTimeout(() => {
        if (companyPagination.page === 1) {
          fetchCompanies();
        } else {
          setCompanyPagination(prev => ({ ...prev, page: 1 }));
        }
      }, 900);

      return () => clearTimeout(delayedSearch);
    }
  }, [searchTerm, activeTab]);

  // Fetch Employers
  useEffect(() => {
    if (activeTab === 'employers') {
      fetchEmployers();
    }
  }, [employerStatusFilter, employerPagination.page, activeTab]);

  useEffect(() => {
    if (activeTab === 'employers') {
      const timer = setTimeout(() => {
        fetchEmployers();
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [employerSearchTerm, activeTab]);

  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const params = new URLSearchParams();
      params.append('page', companyPagination.page.toString());
      params.append('limit', companyPagination.limit.toString());
      if (statusFilter === 'approved') params.append('approved', 'true');
      if (statusFilter === 'pending') params.append('approved', 'false');
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/admin/companies?${params.toString()}`);
      let companiesData = response.data.companies || [];

      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        companiesData = companiesData.filter((c: any) =>
          c.name?.toLowerCase().includes(lowerSearch)
        );
      }

      if (industryFilter) {
        companiesData = companiesData.filter((c: any) => c.industry === industryFilter);
      }

      setCompanies(companiesData);
      setCompanyPagination(response.data.pagination || companyPagination);
      
      setCompanyStats({
        total: response.data.pagination?.total || companiesData.length,
        approved: companiesData.filter((c: any) => c.is_approved).length,
        pending: companiesData.filter((c: any) => !c.is_approved).length,
        suspended: 0
      });
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to fetch companies');
      setCompanies([]);
      setCompanyStats({ total: 0, approved: 0, pending: 0, suspended: 0 });
    } finally {
      setCompaniesLoading(false);
    }
  };

  const fetchEmployers = async () => {
    try {
      setEmployersLoading(true);
      const params = new URLSearchParams();
      params.append('page', employerPagination.page.toString());
      params.append('limit', employerPagination.limit.toString());
      params.append('role', 'employer');
      if (employerStatusFilter) params.append('status', employerStatusFilter);
      if (employerSearchTerm) params.append('search', employerSearchTerm);

      const response = await api.get(`/admin/users?${params.toString()}`);
      const usersData = response.data.users || response.data.data || [];
      const paginationData = response.data.pagination || response.data.meta || employerPagination;

      setEmployers(usersData.filter((user: any) => user.role === 'employer'));
      setEmployerPagination(prev => ({ ...prev, ...paginationData }));
    } catch (error: any) {
      console.error('Failed to fetch employers:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch employers');
    } finally {
      setEmployersLoading(false);
    }
  };

  const handleCompanyApprovalToggle = async (companyId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/companies/${companyId}/approval`, { isApproved: !currentStatus });
      toast.success(`Company ${!currentStatus ? 'approved' : 'revoked'} successfully`);
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update company approval');
    }
  };

  const handleEmployerStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { is_active: !currentStatus });
      toast.success('Employer status updated successfully');
      fetchEmployers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update employer status');
    }
  };

  const handleDeleteEmployer = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this employer and all related data (companies, jobs, etc.)?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('Employer and related data deleted successfully');
        fetchEmployers();
      } catch (error: any) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete employer');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company & Employer Management</h1>
          <p className="text-gray-600">Manage employer accounts and company profiles</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('companies')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'companies'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Company Management</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('employers')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'employers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Employer Management</span>
            </div>
          </button>
        </div>
      </div>

      {/* Company Management Tab */}
      {activeTab === 'companies' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{companyStats.total}</p>
                <p className="text-sm text-gray-600">Total Companies</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{companyStats.approved}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{companyStats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{companyStats.suspended}</p>
                <p className="text-sm text-gray-600">Suspended</p>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search Company..."
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
              <Select
                options={industryOptions}
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                placeholder="Filter by industry"
              />
            </div>
          </Card>

          {/* Companies Table */}
          <Card>
            {companiesLoading ? (
              <div className="p-6 text-center">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Industry</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Jobs</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Join Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company: any) => (
                      <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{company.first_name} {company.last_name}</p>
                            <p className="text-sm text-gray-600">{company.email}</p>
                            {company.contact_phone && (
                              <p className="text-sm text-gray-500">{company.contact_phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              {company.logo ? (
                                <img
                                  src={company.logo}
                                  alt={company.name}
                                  className="w-10 h-10 object-cover rounded-lg"
                                />
                              ) : (
                                <Building2 className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{company.name}</p>
                              <p className="text-sm text-gray-600">{company.location}</p>
                              {company.website && (
                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700">
                                  {company.website}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {company.industry}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(company.is_approved ? 'approved' : 'pending')}`}>
                            {company.is_approved ? 'APPROVED' : 'PENDING'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p className="font-medium">{company.activeJobs || 0} active</p>
                            <p className="text-gray-600">{company.totalJobs || 0} total</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{new Date(company.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCompanyApprovalToggle(company.id, company.is_approved)}
                              className={
                                company.is_approved
                                  ? "text-red-600 hover:text-red-700"
                                  : "text-green-600 hover:text-green-700"
                              }
                            >
                              {company.is_approved ? (
                                <XCircle className="h-4 w-4 mr-1" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {companies.length === 0 && !companiesLoading && (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies found</h3>
                    <p className="text-gray-600">No companies match your current filters</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Pagination */}
          {companyPagination.totalPages > 1 && (
            <Card className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {((companyPagination.page - 1) * companyPagination.limit) + 1} to {Math.min(companyPagination.page * companyPagination.limit, companyPagination.total)} of {companyPagination.total} companies
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={companyPagination.page === 1}
                    onClick={() => setCompanyPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm">
                    Page {companyPagination.page} of {companyPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={companyPagination.page === companyPagination.totalPages}
                    onClick={() => setCompanyPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Employer Management Tab */}
      {activeTab === 'employers' && (
        <>
          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employers..."
                  value={employerSearchTerm}
                  onChange={(e) => setEmployerSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                options={userStatusOptions}
                value={employerStatusFilter}
                onChange={(e) => setEmployerStatusFilter(e.target.value)}
                placeholder="Filter by status"
              />
            </div>
          </Card>

          {/* Employers Table */}
          <Card>
            {employersLoading ? (
              <div className="p-6 text-center">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
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
                    {employers.length === 0 && !employersLoading && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-gray-500">
                          No employers found.
                        </td>
                      </tr>
                    )}
                    {employers.map((user: any) => {
                      const firstName = user.firstName || user.first_name || '';
                      const lastName = user.lastName || user.last_name || '';
                      const status = user.is_active !== undefined ? (user.is_active ? 'active' : 'inactive') : user.status || 'inactive';
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEmployerStatusToggle(user.id, status === 'active')}
                                className={
                                  status === "active"
                                    ? "text-red-600 hover:text-red-700"
                                    : "text-green-600 hover:text-green-700"
                                }
                              >
                                {status === "active" ? (
                                  <XCircle className="h-4 w-4 mr-1" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEmployer(user.id)}
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
            )}
          </Card>

          {/* Pagination */}
          {employerPagination.totalPages > 1 && (
            <Card className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {((employerPagination.page - 1) * employerPagination.limit) + 1} to {Math.min(employerPagination.page * employerPagination.limit, employerPagination.total)} of {employerPagination.total} employers
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={employerPagination.page === 1}
                    onClick={() => setEmployerPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm">
                    Page {employerPagination.page} of {employerPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={employerPagination.page === employerPagination.totalPages}
                    onClick={() => setEmployerPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

