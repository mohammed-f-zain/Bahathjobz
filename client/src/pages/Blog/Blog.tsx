import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { User, ArrowRight, Clock, FileText } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const COLORS = {
  dark: '#1b3c53',      // Dark navy blue
  medium: '#234c6a',    // Medium blue
  light: '#456882',     // Light blue
  bg: '#e3e3e3',        // Light gray background
  white: '#ffffff',
  text: '#1f2937',
  textLight: '#6b7280',
};

type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  featured_image?: string;
  author: string;
  readTime?: string;
  slug: string;
  published_at?: string;
  created_at?: string;
};

const categories = [
  "All",
  "Career Tips",
  "Remote Work",
  "Career Growth",
  "Technology",
  "Personal Branding",
  "Career Change",
];

export function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]); // re-fetch only when category changes

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "All") {
        params.append("category", selectedCategory);
      }

      const response = await api.get(`/blog?${params.toString()}`);
      console.log("Blog fetch response:", response);
      setPosts(response.data.posts || []);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch blog posts:", error);
      toast.error("Failed to fetch blog posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImage = (category: string) => {
    const images: Record<string, string> = {
      "Career Tips":
        "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
      "Remote Work":
        "https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=800",
      "Career Growth":
        "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800",
      Technology:
        "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
      "Personal Branding":
        "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800",
      "Career Change":
        "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
    };
    return (
      images[category] ||
      "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl p-12 mb-16 text-white shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.medium} 50%, ${COLORS.light} 100%)`
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">BAHATH JOBZ Blog</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Career insights, job search tips, and industry trends to help you succeed
            </p>
          </div>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                  ? "bg-[#456882] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Post */}
      {selectedCategory === "All" && posts.length > 0 && (
        <Card className="mb-8 overflow-hidden max-w-6xl mx-auto mb-16">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={`${import.meta.env.VITE_URL}${posts[0].featured_image}` || getDefaultImage(posts[0].category)}
                alt={posts[0].title}
                className="w-full h-32 md:h-[250px] object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {posts[0].category}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {posts[0].title}
              </h2>
              <p className="text-gray-600 mb-6">{posts[0].excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {posts[0].author}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {posts[0].readTime}
                  </span>
                </div>
                <Link to={`/blog/${posts[0].slug}`} className="inline-block">
                  <Button>
                    Read More <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-16">
        {posts.slice(selectedCategory === "All" ? 1 : 0).map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={`${import.meta.env.VITE_URL}${post.featured_image}` || getDefaultImage(post.category)}
              alt={post.title}
              className="w-full h-48 object-cover"
            />

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {post.category}
                </span>
                <span className="text-xs text-gray-500">{post.readTime}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {post.author}
                  </span>
                </div>
                <Link to={`/blog/${post.slug}`} className="inline-block">
                  <Button variant="ghost" size="sm">
                    Read More
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No Posts */}
      {posts.length === 0 && !loading && (
        <Card className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No blog posts found
          </h3>
          <p className="text-gray-600">
            No published blog posts available at the moment.
          </p>
        </Card>
      )}

      {/* Newsletter Signup */}
      {/* <Card className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div className="text-center p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h3>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter for the latest career tips and job
            market insights
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </Card> */}
    </div>
  );
}
