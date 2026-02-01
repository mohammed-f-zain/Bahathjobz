// src/pages/Employer/Applications.tsx
import React, { useState } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Link } from "react-router-dom";  // ✅ add this


import { 
  Search, 
  Filter, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';




const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'applied', label: 'Applied' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hired', label: 'Hired' },
];


export function Applications() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    under_review: 0,
    shortlisted: 0,
    hired: 0
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (jobId) setJobFilter(jobId);
    fetchJobs();
  }, [searchParams]);

  // Fetch applications whenever filters change (with debounce for search)
  useEffect(() => {
    // Skip debounce on initial load
    if (isInitialLoad) {
      fetchApplications(true);
      setIsInitialLoad(false);
      return;
    }

    const delayedFetch = setTimeout(() => {
      fetchApplications(false); // Don't show skeleton on filter changes
    }, 500);

    return () => clearTimeout(delayedFetch);
  }, [jobFilter, statusFilter, searchTerm]);

  const fetchApplications = async (showLoader = false) => {
    try {
      // Only show skeleton on initial load
      if (showLoader) setLoading(true);
      
      const params = new URLSearchParams();
      if (jobFilter) params.append('jobId', jobFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/applications/employer?${params.toString()}`);
      setApplications(response.data.applications || []);
      
      // Calculate stats
      const apps = response.data.applications || [];
      setStats({
        total: apps.length,
        applied: apps.filter((app: any) => app.status === 'applied').length,
        under_review: apps.filter((app: any) => app.status === 'under_review').length,
        shortlisted: apps.filter((app: any) => app.status === 'shortlisted').length,
        hired: apps.filter((app: any) => app.status === 'hired').length,
      });
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to fetch applications');
      setApplications([]);
      setStats({ total: 0, applied: 0, under_review: 0, shortlisted: 0, hired: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/employer/my-jobs');
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setJobs([]);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      applied: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-purple-100 text-purple-800',
    };
    
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    const updateStatus = async () => {
      try {
        await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
        toast.success(`Application status updated to ${newStatus.replace('_', ' ')}`);
        fetchApplications(false); // Refresh without showing skeleton
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to update application status');
      }
    };

    updateStatus();
  };

  const jobOptions = [
    { value: '', label: 'All Jobs' },
    ...jobs.map((job: any) => ({ value: job.id, label: job.title }))
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Applications</h1>
        <p className="text-sm sm:text-base text-gray-600">Review and manage job applications from candidates</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.applied}</p>
            <p className="text-xs sm:text-sm text-gray-600">New</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.under_review}</p>
            <p className="text-xs sm:text-sm text-gray-600">Reviewing</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.shortlisted}</p>
            <p className="text-xs sm:text-sm text-gray-600">Shortlisted</p>
          </div>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.hired}</p>
            <p className="text-xs sm:text-sm text-gray-600">Hired</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            options={jobOptions}
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            placeholder="Filter by job"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status"
          />
        </div>
      </Card>

      {/* Applications List */}
      <div className="space-y-3 sm:space-y-4">
        {applications.map((application: any) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{application.first_name} {application.last_name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">Applied for: {application.job_title}</p>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(application.applied_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${getStatusBadge(application.status)}`}>
                    {application.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-gray-700 text-xs sm:text-sm line-clamp-2">{application.cover_note || 'No cover note provided'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center min-w-0">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{application.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                    {application.phone || 'Not provided'}
                  </div>
                </div>

                {application.summary && (
                  <div className="mb-3">
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3">{application.summary}</p>
                  </div>
                )}
              </div>

              {/* Actions - Responsive */}
              <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 lg:flex-col lg:items-stretch">
                <Link to={`/employer/applications/${application.id}?jobId=${application.job_id}`}>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm w-full">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>

                {application.resume_url ? (
                  <a
                    href={
                      application.resume_url.startsWith("http")
                        ? application.resume_url
                        : application.resume_url.startsWith("/")
                        ? `https://api.bahathjobz.com${application.resume_url}`
                        : `https://api.bahathjobz.com/${application.resume_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm w-full">
                      <Download className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  </a>
                ) : (
                  <Button variant="ghost" size="sm" disabled className="text-xs sm:text-sm">
                    <Download className="h-4 w-4 mr-1" />
                    No Resume
                  </Button>
                )}
                {application.status === 'applied' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleStatusChange(application.id, 'under_review')}
                    className="text-xs sm:text-sm"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                )}
                {application.status === 'under_review' && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleStatusChange(application.id, 'shortlisted')}
                      className="text-xs sm:text-sm text-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Shortlist
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleStatusChange(application.id, 'rejected')}
                      className="text-xs sm:text-sm text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {application.status === 'shortlisted' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleStatusChange(application.id, 'hired')}
                    className="text-xs sm:text-sm text-purple-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Hire
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {applications.length === 0 && !loading && (
        <Card className="text-center py-8 sm:py-12">
          <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-sm text-gray-600 mb-4">Applications will appear here when candidates apply for your jobs</p>
        </Card>
      )}
    </div>
  );
}