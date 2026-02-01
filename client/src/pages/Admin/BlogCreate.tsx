import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { ArrowLeft, Save, Eye, Upload, FileText } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

export function BlogCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Career Tips',
    isPublished: false,
    isFeatured: false,
  });
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a JPEG, PNG, or GIF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('File size must be less than 5MB');
        return;
      }
      setFeaturedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.excerpt.trim()) {
      toast.error('Excerpt is required');
      return;
    }

    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      toast.error('Content is required');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, String(value));
      });

      if (featuredImage) {
        submitData.append('featuredImage', featuredImage);
      }

      await api.post('/blog/admin/posts', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Blog post created successfully!');
      navigate('/admin/blog');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    const draftData = { ...formData, isPublished: false };
    setFormData(draftData);
    
    // Trigger form submission with draft status
    const form = document.getElementById('blog-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  const textContent = formData.content.replace(/<[^>]*>/g, '');
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/admin/blog')}
        className="inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-3 py-1.5 text-sm mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Blog Management
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Blog Post</h1>
        <p className="text-gray-600">Write and publish engaging content for your audience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <Input
                    label="Post Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter an engaging title for your blog post"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write a brief excerpt that summarizes your post (150-200 characters)"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">{formData.excerpt.length} characters</p>
                  </div>
                  <Select
                    label="Category"
                    name="category"
                    options={categoryOptions}
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Featured Image (Optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      {featuredImage && (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {featuredImage.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Post Content <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                </div>
                {previewMode ? (
                  <div className="min-h-[400px] p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                    </div>
                  </div>
                ) : (
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={handleContentChange}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                        ['link', 'image'],
                        ['clean']
                      ],
                    }}
                    style={{ height: '400px', marginBottom: '40px' }}
                  />
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {textContent.length} characters • {readTime} min read
                </p>
              </div>

              {/* Publishing Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Publish immediately (make visible to public)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Feature this post (show prominently on blog page)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/admin/blog')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={loading}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Creating...' : formData.isPublished ? 'Publish Post' : 'Create Post'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Publishing Guide</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p>Write an engaging title that captures attention</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p>Create a compelling excerpt for social sharing</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p>Use HTML tags for rich formatting</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p>Add a featured image to increase engagement</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p>Choose the most relevant category</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">SEO Tips</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <p>Include relevant keywords in your title</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <p>Write meta-friendly excerpts (150-160 chars)</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <p>Use headings (h2, h3) to structure content</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <p>Aim for 800+ words for better ranking</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Content Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Word Count</span>
                <span className="font-medium">{wordCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Character Count</span>
                <span className="font-medium">{textContent.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Read Time</span>
                <span className="font-medium">{readTime} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Excerpt Length</span>
                <span className={`font-medium ${formData.excerpt.length > 200 ? 'text-red-600' : 'text-green-600'}`}>
                  {formData.excerpt.length}/200
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}