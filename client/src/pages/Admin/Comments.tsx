import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Search, Filter, CheckCircle, XCircle, Eye, MessageCircle, User, Flag } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'rejected', label: 'Rejected' },
];

export function Comments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    flagged: 0,
  });

  useEffect(() => {
    fetchComments();
  }, [statusFilter, searchTerm]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/engagements`);
      let allEngagements = response.data.engagements || [];

      // filter only comments
      let commentsData = allEngagements.filter((e: any) => e.type === 'comment');

      // apply local search filter
      if (searchTerm) {
        commentsData = commentsData.filter(
          (c: any) =>
            c.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // apply local status filter
      if (statusFilter) {
        commentsData = commentsData.filter((c: any) => c.status === statusFilter);
      }

      setComments(commentsData);

      // calculate stats
      setStats({
        total: commentsData.length,
        pending: commentsData.filter((c: any) => c.status === 'pending').length,
        approved: commentsData.filter((c: any) => c.status === 'approved').length,
        flagged: commentsData.filter((c: any) => c.status === 'flagged').length,
      });
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Failed to fetch comments');
      setComments([]);
      setStats({ total: 0, pending: 0, approved: 0, flagged: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId: string) => {
    try {
      await api.patch(`/admin/engagements/${commentId}/status`, { status: 'approved' });
      toast.success('Comment approved successfully');
      fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve comment');
    }
  };

  const handleReject = async (commentId: string) => {
    try {
      await api.patch(`/admin/engagements/${commentId}/status`, { status: 'rejected' });
      toast.success('Comment rejected successfully');
      fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject comment');
    }
  };

  const handleFlag = async (commentId: string) => {
    try {
      await api.patch(`/admin/engagements/${commentId}/status`, { status: 'flagged' });
      toast.success('Comment flagged successfully');
      fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to flag comment');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      flagged: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800',
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Comment Moderation</h1>
          <p className="text-gray-600">Review and moderate user comments on job postings</p>
        </div>
        {/* <Button>
          <MessageCircle className="h-4 w-4 mr-2" />
          Export Report
        </Button> */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Comments</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending Review</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
            <p className="text-sm text-gray-600">Flagged</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status"
          /> */}
          {/* <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button> */}
        </div>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment: any) => (
          <Card key={comment.id} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {comment.user?.first_name} {comment.user?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{comment.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                <a href={`/jobs/${comment.job_id}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Job
                  </Button>
                </a>
              </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">{comment.content || 'No content'}</p>
              <div className="text-sm text-gray-500">
                <p>
                  On: <span className="font-medium">{comment.job?.title}</span> at{' '}
                  <span className="font-medium">{comment.job?.company?.name}</span>
                </p>
                <p>Posted: {new Date(comment.created_at).toLocaleString()}</p>
              </div>
            </div>

            {/* <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <a href={`/jobs/${comment.job_id}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Job
                  </Button>
                </a>
              </div>
              <div className="flex items-center space-x-2">
                {(!comment.status || comment.status === 'pending') && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApprove(comment.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReject(comment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4 text-red-600 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {comment.status === 'approved' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFlag(comment.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Flag className="h-4 w-4 text-red-600 mr-1" />
                    Flag
                  </Button>
                )}
              </div>
            </div> */}
          </Card>
        ))}

        {comments.length === 0 && !loading && (
          <Card className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No comments found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter
                ? 'No comments match your current filters'
                : 'No comments have been posted yet'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
