// src/pages/Employer/MyJobs.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  MapPin, 
  Clock, 
  DollarSign,
  Briefcase
} from 'lucide-react';
import { useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending_approval', label: 'Pending Approval' },
  // { value: 'draft', label: 'Draft' },
  // { value: 'paused', label: 'Paused' },
  // { value: 'closed', label: 'Closed' },
];

export function MyJobs() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0
  });

  // Fetch jobs only once on mount
  useEffect(() => {
    fetchJobs(true); // Initial load shows skeleton
  }, []);

  const fetchJobs = async (showLoader = false) => {
    try {
      // Only show skeleton loader on initial load, not on refetch
      if (showLoader) setLoading(true);
      
      const response = await api.get('/jobs/employer/my-jobs');
      setJobs(response.data.jobs || []);
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to fetch your jobs');
      setJobs([]);
      setStats({ totalJobs: 0, activeJobs: 0, totalApplications: 0, totalViews: 0 });
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && job.is_approved && job.is_active) ||
      (statusFilter === 'pending_approval' && !job.is_approved) ||
      (statusFilter === 'draft' && !job.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string, isApproved: boolean) => {
    if (status === 'pending_approval' || (!isApproved && status !== 'draft')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    
    const badges = {
      active: 'bg-green-100 text-green-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800',
      paused: 'bg-orange-100 text-orange-800',
      closed: 'bg-red-100 text-red-800',
    };
    
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string, isApproved: boolean) => {
    if (status === 'pending_approval' || (!isApproved && status !== 'draft')) {
      return 'PENDING APPROVAL';
    }
    return status.toUpperCase();
  };

  const getWorkTypeBadge = (workType: string) => {
    const badges = {
      remote: 'bg-green-100 text-green-800',
      onsite: 'bg-blue-100 text-blue-800',
      hybrid: 'bg-purple-100 text-purple-800',
    };
    return badges[workType as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const formatSalary = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return 'Salary not specified';
 const currencySymbols: Record<string, string> = {
    AFN: '؋',    // Afghanistan
    AMD: '֏',    // Armenia
    AZN: '₼',    // Azerbaijan
    BHD: '.د.ب', // Bahrain
    EUR: '€',    // Cyprus
    GEL: '₾',    // Georgia
    IQD: 'ع.د',  // Iraq
    IRR: '﷼',    // Iran
    ILS: '₪',    // Israel / Palestine
    JOD: 'ينار', // Jordan
    KWD: 'ك',    // Kuwait
    LBP: 'ل.ل',  // Lebanon
    SYP: '£S',   // Syria
    AED: 'د.إ',  // UAE
    OMR: 'ر.ع',  // Oman
    QAR: 'ر.ق',  // Qatar
    SAR: 'SR',   // Saudi Arabia
    YER: '﷼',
       // Yemen

    // add more currencies as needed
  };

  const symbol = currencySymbols[currency] || currency;

  if (min && max) return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
  if (min) return `${symbol}${min.toLocaleString()}+`;
  return `Up to ${symbol}${max?.toLocaleString()}`;
};

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      fetchJobs(false); // Refresh the list without showing skeleton
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Jobs</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your job postings and track their performance</p>
        </div>
        <Link to="/employer/post-job" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total Jobs</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalApplications}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total Applications</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jobs..."
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

      {/* Jobs Grid - Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredJobs.map((job: any) => (
          <div
            key={job.id}
            onClick={(e) => {
              // Don't navigate if clicking on action buttons or links
              if ((e.target as HTMLElement).closest('.job-actions') || 
                  (e.target as HTMLElement).closest('a') ||
                  (e.target as HTMLElement).closest('button')) {
                return;
              }
              navigate(`/employer/jobs/${job.id}`);
            }}
            className="cursor-pointer"
          >
          <Card 
            className="hover:shadow-lg transition-all duration-300 group relative overflow-hidden border-2 border-transparent hover:border-blue-200 h-full"
          >
            {/* Status Badge - Top Right */}
            <div className="absolute top-3 right-3 z-10">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(job.is_approved ? 'active' : 'pending_approval', job.is_approved)}`}>
                {getStatusText(job.is_approved ? 'active' : 'pending_approval', job.is_approved)}
              </span>
            </div>

            {/* Card Content */}
            <div className="p-5 sm:p-6">
              {/* Job Icon & Title */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  {job.work_type && (
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getWorkTypeBadge(job.work_type)}`}>
                      {job.work_type.charAt(0).toUpperCase() + job.work_type.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                  <span className="truncate">{job.location}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                  <span className="truncate">
                    {job.salary_min && job.salary_max 
                      ? formatSalary(job.salary_min, job.salary_max, job.currency) 
                      : 'Salary not specified'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                    <span className="font-semibold text-blue-600">{job.application_count || 0}</span>
                    <span className="ml-1 text-gray-500">applications</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-xs">{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {job.deadline && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Deadline:</span> {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 job-actions" onClick={(e) => e.stopPropagation()}>
                <Link to={`/employer/jobs/${job.id}/edit`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs sm:text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteJob(job.id);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Hover Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:to-transparent pointer-events-none transition-all duration-300"></div>
          </Card>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && jobs.length > 0 && !loading && (
        <Card className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs match your filters</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
          <Button onClick={() => {
            setSearchTerm('');
            setStatusFilter('');
          }}>
            Clear Filters
          </Button>
        </Card>
      )}

      {jobs.length === 0 && !loading && (
        <Card className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
          <p className="text-gray-600 mb-4">Start by posting your first job to attract talented candidates</p>
          <Link to="/employer/post-job">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Job
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}