import React, { useState } from 'react';
import { useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Eye, Building2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { countryOptions, industryOptions, currentPositionOptions } from "../../utils/options";

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  // { value: 'suspended', label: 'Suspended' },
];

// const industryOptions = [
//   { value: '', label: 'All Industries' },
//   { value: 'Technology', label: 'Technology' },
//   { value: 'Healthcare', label: 'Healthcare' },
//   { value: 'Finance', label: 'Finance' },
//   { value: 'Education', label: 'Education' },
//   { value: 'Marketing & Advertising', label: 'Marketing & Advertising' },
//   { value: 'Manufacturing', label: 'Manufacturing' },
//   { value: 'Retail', label: 'Retail' },
// ];

export function EmployerManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    suspended: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  }); 

  useEffect(() => {
    fetchCompanies();
  }, [statusFilter, industryFilter, pagination.page]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (pagination.page === 1) {
        fetchCompanies();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 900); // wait 900ms after typing stops

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (statusFilter === 'approved') params.append('approved', 'true');
      if (statusFilter === 'pending') params.append('approved', 'false');
      // if (industryFilter) params.append('industry', industryFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/admin/companies?${params.toString()}`);
      let companiesData = response.data.companies || [];

      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        companiesData = companiesData.filter((c: any) =>
          c.name?.toLowerCase().includes(lowerSearch)
        );
      }

      // ✅ Apply client-side filter for industry
      if (industryFilter) {
        companiesData = companiesData.filter((c: any) => c.industry === industryFilter);
      }
        // const companiesData = response.data.companies || [];
        setCompanies(companiesData);
        setPagination(response.data.pagination || pagination);
        
        // Calculate stats
        setStats({
          total: response.data.pagination?.total || companiesData.length,
          approved: companiesData.filter((c: any) => c.is_approved).length,
          pending: companiesData.filter((c: any) => !c.is_approved).length,
          suspended: 0 // Would need additional field in schema
        });
      } catch (error) {
        console.error('Failed to fetch companies:', error);
        toast.error('Failed to fetch companies');
        setCompanies([]);
        setStats({ total: 0, approved: 0, pending: 0, suspended: 0 });
      } finally {
        setLoading(false);
      }
    };

  // Toggle function
  const handleApprovalToggle = async (companyId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/companies/${companyId}/approval`, { isApproved: !currentStatus });
      toast.success(`Company ${!currentStatus ? 'approved' : 'revoked'} successfully`);
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update company approval');
    }
  };


  const getStatusBadge = (status: string) => {
    const badges = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
    };
    
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Management</h1>
          <p className="text-gray-600">Manage employer accounts and company profiles</p>
        </div>
        {/* <Button>
          <Building2 className="h-4 w-4 mr-2" />
          Export Report
        </Button> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Employers</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
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

      {/* Employers Table */}
      <Card>
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
                          className="w-10 h-10 object-cover rounded-lg" />
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
                  {/* <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{company.first_name} {company.last_name}</p>
                      <p className="text-sm text-gray-600">{company.email}</p>
                      {company.contact_phone && (
                        <p className="text-sm text-gray-500">{company.contact_phone}</p>
                      )}
                    </div>
                  </td> */}
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
                      {/* <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button> */}
                      <Button variant="ghost" size="sm" onClick={() => handleApprovalToggle(company.id, company.is_approved)}
                        className={
                          company.is_approved
                            ? "text-red-600 hover:text-red-700"
                            : "text-green-600 hover:text-green-700"
                        }
                      >
                        {company.is_approved ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                          </>
                        )}
                      </Button>
                      {/* <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {companies.length === 0 && !loading && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600">No companies match your current filters</p>
            </div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} companies
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