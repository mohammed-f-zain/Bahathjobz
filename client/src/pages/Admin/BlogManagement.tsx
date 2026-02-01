import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  FileText,
  Calendar,
  User,
  TrendingUp,
  Heart,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: 'All Posts' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'featured', label: 'Featured' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Career Tips', label: 'Career Tips' },
  { value: 'Remote Work', label: 'Remote Work' },
  { value: 'Career Growth', label: 'Career Growth' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Personal Branding', label: 'Personal Branding' },
  { value: 'Career Change', label: 'Career Change' },
  { value: 'Interview Tips', label: 'Interview Tips' },
  { value: 'Industry Insights', label: 'Industry Insights' },
];

export function BlogManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    popularPosts: [],
    categoryStats: []
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchPosts();
    fetchAnalytics();
  }, [statusFilter, categoryFilter, pagination.page]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (pagination.page === 1) {
        fetchPosts();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);


  const fetchPosts = async () => {
  try {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', pagination.page.toString());
    params.append('limit', pagination.limit.toString());

    // ✅ Handle filters
    if (statusFilter === 'published') params.append('status', 'published');
    if (statusFilter === 'draft') params.append('status', 'draft');
    if (statusFilter === 'featured') params.append('featured', 'true'); // ✅ NEW
    if (categoryFilter) params.append('category', categoryFilter);
    if (searchTerm) params.append('search', searchTerm);

    const response = await api.get(`/blog/admin/posts?${params.toString()}`);
    let postsData = response.data.posts || [];

    // ✅ Client-side fallback filtering in case backend doesn't support featured
    if (statusFilter === 'featured') {
      postsData = postsData.filter((post: any) => post.is_featured === true || post.isFeatured === true);
    }

    setPosts(postsData);
    setPagination(response.data.pagination || pagination);
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    toast.error('Failed to fetch blog posts');
    setPosts([]);
  } finally {
    setLoading(false);
  }
};


  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/blog/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch blog analytics:', error);
      toast.error('Failed to fetch blog analytics');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      await api.delete(`/blog/admin/posts/${postId}`);
      toast.success('Blog post deleted successfully');
      fetchPosts();
      fetchAnalytics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete blog post');
    }
  };

  const getStatusBadge = (post: any) => {
    return (post.isPublished || post.is_published)
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (post: any) => {
    return (post.isPublished || post.is_published) ? 'PUBLISHED' : 'DRAFT';
  };

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
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
          <p className="text-gray-600">Create and manage blog posts for the platform</p>
        </div>
        <Link to="/admin/blog/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{analytics.totalPosts}</p>
            <p className="text-sm text-gray-600">Total Posts</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{analytics.publishedPosts}</p>
            <p className="text-sm text-gray-600">Published</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{analytics.draftPosts}</p>
            <p className="text-sm text-gray-600">Drafts</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{analytics.totalViews}</p>
            <p className="text-sm text-gray-600">Total Views</p>
          </div>
        </Card>
        {/* <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{analytics.totalLikes}</p>
            <p className="text-sm text-gray-600">Total Likes</p>
          </div>
        </Card> */}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search posts..."
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
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Filter by category"
          />
          {/* <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button> */}
        </div>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post: any) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.title}</h3>
                      <p className="text-sm text-gray-600">by {post.author}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(post)}`}>
                          {getStatusText(post)}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {post.category}
                        </span>
                        {(post.isFeatured || post.is_featured) && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            FEATURED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-gray-700 text-sm line-clamp-2">{post.excerpt}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {post.views} views
                  </div>
                  {/* <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {post.likes} likes
                  </div> */}
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {Math.ceil((post.content || '').length / 1000)} min read
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {(post.isPublished || post.is_published) && (
                  <Link to={`/blog/${post.slug}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                )}
                <Link to={`/admin/blog/edit/${post.id}`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <Card className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter || categoryFilter ? 'No posts match your current filters' : 'Start by creating your first blog post'}
          </p>
          <Link to="/admin/blog/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {posts.length === 0 ? 'Create First Post' : 'Create New Post'}
            </Button>
          </Link>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} posts
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