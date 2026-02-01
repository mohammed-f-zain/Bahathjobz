import React from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  Briefcase, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  Plus,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export function EmployerDashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch jobs and applications in parallel for faster loading
      const [jobsResponse, applicationsResponse] = await Promise.all([
        api.get('/jobs/employer/my-jobs'),
        api.get('/applications/employer')
      ]);
      
      const jobsData = jobsResponse.data;
      setStats(jobsData.stats || stats);
      setRecentJobs(jobsData.jobs.slice(0, 3) || []);
      setRecentApplications(applicationsResponse.data.applications.slice(0, 3) || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    const badges = {
      applied: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-purple-100 text-purple-800',
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
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employer Dashboard</h1>
          <p className="text-gray-600">Manage your job posts and track hiring progress</p>
        </div>
        <Link to="/employer/post-job">
          {/* <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button> */}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card> */}

        {/* <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagements</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Heart className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Job Posts</h3>
            <Link to="/employer/jobs">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentJobs.map((job: any) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors relative">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{job.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${job.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {job.is_approved ? 'ACTIVE' : 'PENDING'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {job.application_count || 0} applications
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {job.view_count || 0} views
                    </span>
                  </div>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Link to={`/jobs/${job.id}`} className="absolute inset-0"></Link>
              </div>
            ))}
            {recentJobs.length === 0 && (
              <div className="text-center py-8">
                <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No jobs posted yet</p>
                <Link to="/employer/post-job">
                  <Button variant="outline" size="sm" className="mt-2">
                    Post Your First Job
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Applications */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
            <Link to="/employer/applications">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentApplications.map((application: any) => (
              <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{application.first_name} {application.last_name}</h4>
                    <p className="text-sm text-gray-600">{application.job_title}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getApplicationStatusBadge(application.status)}`}>
                    {application.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Applied {new Date(application.applied_at).toLocaleDateString()}
                  </span>
                  {/* <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View Profile</Button>
                    <Button size="sm">Review</Button>
                  </div> */}
                </div>
              </div>
            ))}
            {recentApplications.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No applications yet</p>
                <Link to="/employer/applications">
                  <Button variant="outline" size="sm" className="mt-2">
                    View All Applications
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}