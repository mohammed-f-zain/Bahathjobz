import React from 'react';
import { Card } from '../../components/UI/Card';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Building2,
  Calendar,
  DollarSign,
  Eye,
  MessageCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const monthlyData = [
  { month: 'Jan', users: 1200, jobs: 340, applications: 890 },
  { month: 'Feb', users: 1450, jobs: 420, applications: 1120 },
  { month: 'Mar', users: 1680, jobs: 380, applications: 1340 },
  { month: 'Apr', users: 1890, jobs: 510, applications: 1580 },
  { month: 'May', users: 2100, jobs: 590, applications: 1820 },
  { month: 'Jun', users: 2340, jobs: 640, applications: 2100 },
];

const industryData = [
  { name: 'Technology', value: 45, color: '#3B82F6' },
  { name: 'Healthcare', value: 20, color: '#10B981' },
  { name: 'Finance', value: 15, color: '#F59E0B' },
  { name: 'Marketing', value: 12, color: '#EF4444' },
  { name: 'Other', value: 8, color: '#8B5CF6' },
];

const locationData = [
  { location: 'San Francisco', jobs: 1234, applications: 3456 },
  { location: 'New York', jobs: 987, applications: 2890 },
  { location: 'Remote', jobs: 2345, applications: 5678 },
  { location: 'Los Angeles', jobs: 654, applications: 1890 },
  { location: 'Austin', jobs: 432, applications: 1234 },
];

export function Analytics() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive insights into platform performance and user behavior</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">$2.4M</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +18.2% from last month
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">45,623</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12.5% from last month
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Job Postings</p>
              <p className="text-3xl font-bold text-gray-900">8,934</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +15.2% from last month
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">94.2%</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +2.1% from last month
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} name="Users" />
              <Line type="monotone" dataKey="jobs" stroke="#10B981" strokeWidth={3} name="Jobs" />
              <Line type="monotone" dataKey="applications" stroke="#F59E0B" strokeWidth={3} name="Applications" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={industryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {industryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Location Analytics */}
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={locationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="jobs" fill="#3B82F6" name="Jobs" />
            <Bar dataKey="applications" fill="#10B981" name="Applications" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Daily Active Users</span>
              <span className="font-semibold">12,345</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Session Duration</span>
              <span className="font-semibold">8m 32s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Page Views</span>
              <span className="font-semibold">234,567</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bounce Rate</span>
              <span className="font-semibold">23.4%</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. Applications per Job</span>
              <span className="font-semibold">14.2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time to Fill</span>
              <span className="font-semibold">18 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Job View Rate</span>
              <span className="font-semibold">89.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Application Rate</span>
              <span className="font-semibold">12.7%</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Recurring Revenue</span>
              <span className="font-semibold">$234K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Lifetime Value</span>
              <span className="font-semibold">$1,245</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Churn Rate</span>
              <span className="font-semibold">2.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold">4.7%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}