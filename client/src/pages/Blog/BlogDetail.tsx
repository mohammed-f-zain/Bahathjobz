import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  ArrowLeft, User, Clock, Share2, Heart, Bookmark, Eye, MessageCircle
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);


  let backPath = "/blog";
  if (location.pathname.startsWith("/employer/blog")) {
    backPath = "/employer/blog";
  } else if (location.pathname.startsWith("/admin/blog")) {
    backPath = "/admin/blog";
  }

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blog/${slug}`);
      const postData = response.data;
      setPost(postData);

      // Fetch related posts by category
      const relatedResponse = await api.get(`/blog?category=${postData.category}&limit=3`);
      setRelatedPosts(
        relatedResponse.data.posts
          .filter((p: any) => p.slug !== slug)
          .slice(0, 2)
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch blog post');
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImage = (category: string) => {
    const images: Record<string, string> = {
      'Update Tech-5': 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Career Tips': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Remote Work': 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=800',
    };
    return images[category] || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!post)
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <h3 className="text-lg font-semibold">Blog post not found</h3>
          <Link to={backPath} className="inline-flex items-center justify-center font-medium transition-colors border border-[#456882] rounded-full text-[#456882] hover:bg-[#456882]/10 focus:ring-[#456882] px-3 py-1.5 text-sm mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Card>
      </div>
    );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">

        <Link to={backPath} className="inline-flex items-center justify-center font-medium transition-colors border border-[#456882] rounded-full text-[#456882] hover:bg-[#456882]/10 focus:ring-[#456882] px-3 py-1.5 text-sm mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        <Card className="mb-8">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {post.category}
          </span>
          <h1 className="text-4xl font-bold text-gray-900 my-6">{post.title}</h1>

          <div className="w-full flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{post.author}</p>
                <p className="text-sm text-gray-600">Author</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {post.readTime}
              </span>
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {post.views || 0} views
              </span>
            </div>

            {/* <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  {post.likes || 0}
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div> */}
          </div>

          <img
            src={ post.featured_image !== null ? `${import.meta.env.VITE_URL}${post.featured_image}` : getDefaultImage(post.category)}
            alt={post.title}
            className="w-full h-64 md:h-80 object-cover rounded-lg"
          />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card>
              {/* <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} /> */}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: post.content.replace(/\n/g, "<br/>"),
                }}
              />
            </Card>

            {/* <Card className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Comments ({post.blog_comments?.length || 0})
                </h3>

                <div className="mb-8">
                  <textarea
                    placeholder="Share your thoughts..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex justify-end mt-3">
                    <Button size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {post.blog_comments?.map((comment: any) => (
                    <div key={comment.id} className="flex space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.author_name}</span>
                          <span className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {(!post.blog_comments || post.blog_comments.length === 0) && (
                    <div className="text-center py-8">
                      <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No comments yet. Be the first to comment!</p>
                    </div>
                  )}
                </div>
              </Card> */}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <Card>
                <h4 className="font-semibold text-gray-900 mb-4">Article Stats</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Views
                    </span>
                    <span className="font-medium">{post.views || 0}</span>
                  </div>
                  {/* <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Heart className="h-4 w-4 mr-2" />
                        Likes
                      </span>
                      <span className="font-medium">{post.likes || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Comments
                      </span>
                      <span className="font-medium">{post.blog_comments?.length || 0}</span>
                    </div> */}
                </div>
              </Card>

              <Card>
                <h4 className="font-semibold text-gray-900 mb-4">Related Articles</h4>
                <div className="space-y-4">
                  {relatedPosts.map((related: any) => (
                    <Link key={related.id} to={`/blog/${related.slug}`} className="block group">
                      <div className="flex space-x-3">
                        <img
                          src={ related.featured_image !== null ? `${import.meta.env.VITE_URL}${related.featured_image}` : getDefaultImage(related.category)}
                          alt={related.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {related.title}
                          </h5>
                          <p className="text-sm text-gray-500 mt-1">{related.readTime}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {relatedPosts.length === 0 && (
                    <div className="text-gray-500">No related articles found</div>
                  )}
                </div>
              </Card>

              {/* <Card className="bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Stay Updated</h4>
                  <p className="text-sm text-gray-600 mb-4">Get the latest career tips and job market insights delivered to your inbox.</p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <Button size="sm" className="w-full">Subscribe</Button>
                  </div>
                </Card> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
