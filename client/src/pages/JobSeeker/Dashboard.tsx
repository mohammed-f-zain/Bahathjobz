import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Heart,
  Bookmark,
  Eye,
  TrendingUp,
  MapPin,
  Clock,
  Building2,
  User
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export function Dashboard() {
  const [stats, setStats] = useState({
    applications: 0,
    likes: 0,
    favorites: 0,
    profileViews: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel for faster loading
      const [applicationsResponse, likedJobsResponse, savedJobsResponse] = await Promise.all([
        api.get('/applications/my-applications'),
        api.get('/liked-jobs'),
        api.get('/saved-jobs')
      ]);

      setRecentApplications(applicationsResponse.data.applications.slice(0, 5));
      
      const likedJobs = likedJobsResponse.data.likedJobs || [];
      const savedJobs = savedJobsResponse.data.savedJobs || [];

      setStats({
        applications: applicationsResponse.data.applications.length,
        likes: likedJobs.length,
        favorites: savedJobs.length,
        profileViews: 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="h-6 sm:h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-10 sm:h-12 bg-gray-200 rounded"></div>
              </div>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's your job search overview.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="order-2 sm:order-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Applications</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.applications}</p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full order-1 sm:order-2">
              <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="order-2 sm:order-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Saved Jobs</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.favorites}</p>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-full order-1 sm:order-2">
              <Bookmark className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Applications */}
        <Card>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Applications</h3>
            <Link to="/applications">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentApplications.length > 0 ? recentApplications.map((application: any) => (
              <div key={application.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{application.job_title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{application.company_name}</p>
                  </div>
                  <span className={`px-2 py-0.5 sm:py-1 text-xs rounded-full flex-shrink-0 ${getStatusBadge(application.status)}`}>
                    {application.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{application.job_location || 'Location not specified'}</span>
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    {new Date(application.applied_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 sm:py-8">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No applications yet</p>
                <Link to="/jobs">
                  <Button variant="outline" size="sm" className="mt-2 text-xs sm:text-sm">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
          <div className="space-y-2 sm:space-y-3">
            <Link to="/jobs" className="block">
              <div className="flex items-center p-2.5 sm:p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="font-medium text-gray-900 text-sm sm:text-base">Browse Jobs</span>
              </div>
            </Link>
            <Link to="/profile" className="block">
              <div className="flex items-center p-2.5 sm:p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="font-medium text-gray-900 text-sm sm:text-base">Update Profile</span>
              </div>
            </Link>
            <Link to="/saved-jobs" className="block">
              <div className="flex items-center p-2.5 sm:p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="font-medium text-gray-900 text-sm sm:text-base">Saved Jobs</span>
              </div>
            </Link>
            <Link to="/applications" className="block">
              <div className="flex items-center p-2.5 sm:p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="font-medium text-gray-900 text-sm sm:text-base">My Applications</span>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}