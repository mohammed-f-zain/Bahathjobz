import React from 'react';
import { Card } from '../../components/UI/Card';
import { 
  Users, 
  Building2, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';


export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
      // Fallback to mock data
      setAnalytics({
        totalUsers: 45623,
        totalEmployers: 2456,
        totalJobs: 8934,
        totalApplications: 12456,
        pendingApprovals: 23,
        dailyActivity: [
          { date: '2025-01-01', count: 120 },
          { date: '2025-01-02', count: 145 },
          { date: '2025-01-03', count: 132 },
          { date: '2025-01-04', count: 167 },
          { date: '2025-01-05', count: 189 },
          { date: '2025-01-06', count: 201 },
          { date: '2025-01-07', count: 234 },
        ],
        monthlyActivity: [
          { month: '2024-02', count: 1200 },
          { month: '2024-03', count: 1450 },
          { month: '2024-04', count: 1680 },
          { month: '2024-05', count: 1890 },
          { month: '2024-06', count: 2100 },
          { month: '2025-01', count: 2340 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-2/3 sm:w-1/3"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load analytics</h3>
          <p className="text-gray-600 mb-4">Unable to fetch analytics data</p>
          {/* <Button onClick={fetchAnalytics}>Retry</Button> */}
        </Card>
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Monitor platform activity and manage the BAHATH JOBZ ecosystem</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="order-2 sm:order-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Job Seekers</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{analytics.totalUsers.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                +12.5%
              </p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full order-1 sm:order-2">
              <Users className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="order-2 sm:order-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Employers</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{analytics.totalEmployers.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                +8.3%
              </p>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-full order-1 sm:order-2">
              <Building2 className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="order-2 sm:order-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{analytics.totalJobs.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                +15.2%
              </p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-full order-1 sm:order-2">
              <Briefcase className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="order-2 sm:order-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Applications</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{analytics.totalApplications.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                +22.1%
              </p>
            </div>
            <div className="bg-orange-100 p-2 sm:p-3 rounded-full order-1 sm:order-2">
              <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending Approvals</p>
              <p className="text-2xl font-bold text-yellow-900">{analytics.pendingApprovals || 23}</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Approved Today</p>
              <p className="text-2xl font-bold text-green-900">47</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">New Jobs Today</p>
              <p className="text-2xl font-bold text-blue-900">126</p>
            </div>
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Active Sessions</p>
              <p className="text-2xl font-bold text-purple-900">1,234</p>
            </div>
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
        </Card>
      </div> */}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="overflow-hidden">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Weekly Activity</h3>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[300px]">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" name="New Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Monthly Growth</h3>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[300px]">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={3} name="Monthly Users" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}