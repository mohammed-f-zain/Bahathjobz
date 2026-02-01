import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Building2, Upload, Save, Globe, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { countryOptions, industryOptions, currentPositionOptions } from "../../utils/options";

// const industryOptions = [
//   { value: '', label: 'Select Industry' },
//   { value: 'Technology', label: 'Technology' },
//   { value: 'Healthcare', label: 'Healthcare' },
//   { value: 'Finance', label: 'Finance' },
//   { value: 'Education', label: 'Education' },
//   { value: 'Marketing & Advertising', label: 'Marketing & Advertising' },
//   { value: 'Manufacturing', label: 'Manufacturing' },
//   { value: 'Retail', label: 'Retail' },
// ];

export function CompanyProfile() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [company, setCompany] = useState({
    name: '',
    tagline: '',
    description: '',
    industry: 'Technology',
    website: '',
    location: '',
    contact_email: '',
    contact_phone: '',
    is_approved: false,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [hasCompany, setHasCompany] = useState(false);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
  try {
    setFetchLoading(true);
    const response = await api.get('/companies/me');
    const companyData = response.data;

    setCompany(companyData);
    setHasCompany(true);

    // ✅ Use backend-provided URLs for preview
    if (companyData.logo) {
      setLogoPreview(companyData.logo);
    }
    if (companyData.banner) {
      setBannerPreview(companyData.banner);
    }

  } catch (error) {
    console.error('Failed to fetch company profile:', error);
    setHasCompany(false);
  } finally {
    setFetchLoading(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompany(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      console.log(file,">>>>>>file")
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a JPEG, PNG, or GIF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error('File size must be less than 10MB');
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if logo and banner are provided
    if (!hasCompany) {
    if (!logoFile) {
      toast.error('Logo is required');
      return;
    }
    if (!bannerFile) {
      toast.error('Banner is required');
      return;
    }
  }


    setLoading(true);

    try {
      const formData = new FormData();

      // Add company data
      Object.entries(company).forEach(([key, value]) => {
        if (key !== 'is_approved') {
          formData.append(key, String(value));
        }
      });

      // Add files if selected
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      if (hasCompany) {
        await api.put('/companies/me', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Company profile updated successfully!');
      } else {
        await api.post('/companies', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Company profile created successfully! It will be reviewed by our team.');
        setHasCompany(true);
      }

      // Refresh company data
      fetchCompanyProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save company profile');
    } finally {
      setLoading(false);
    }
  };


  if (fetchLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  console.log(logoPreview,">>>>>>logo")

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Profile</h1>
        <p className="text-gray-600">
          {hasCompany ? 'Manage your company information and branding' : 'Create your company profile to start posting jobs'}
        </p>
      </div>

      {hasCompany && company ? (
        company.is_approved ? (
          <Card className="mb-6 bg-green-50 border-green-200">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">Company Approved</p>
                <p className="text-sm text-green-700">
                  Your company profile has been approved and is visible to job seekers.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Building2 className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-yellow-800">Approval Pending</p>
                <p className="text-sm text-yellow-700">
                  Your company profile is under review. You can edit it, but it won't be visible until approved.
                </p>
              </div>
            </div>
          </Card>
        )
      ) : null}


      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Logo */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Logo</h3>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Building2 className="h-12 w-12 text-blue-600" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Logo (JPEG, PNG, GIF)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {logoFile && (
                  <p className="text-sm text-green-600 mt-1">Selected: {logoFile.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Company Banner */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Banner</h3>
            <div>
               <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mb-4">
                {bannerPreview && (
                  <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover rounded-lg" />
                )}
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Banner (JPEG, PNG, GIF - Recommended: 1200x300px)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {bannerFile && (
                <p className="text-sm text-green-600 mt-1">Selected: {bannerFile.name}</p>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                name="name"
                value={company.name}
                onChange={handleChange}
                placeholder="Your company name"
              />
               <Select label="Industries" name="industry" options={industryOptions} value={company.industry} onChange={handleChange} required />
              
            </div>
            <div className="mt-4">
              <Input
                label="Tagline"
                name="tagline"
                value={company.tagline}
                onChange={handleChange}
                placeholder="A brief tagline that describes your company"
              />
            </div>
          </div>

          {/* Company Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Description</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Your Company <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={company.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your company, its mission, values, and what makes it unique..."
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Location"
                name="location"
                value={company.location}
                onChange={handleChange}
                placeholder="City, State/Country"
              />
              <Input
                label="Website"
                name="website"
                type="url"
                value={company.website}
                onChange={handleChange}
                placeholder="https://yourcompany.com"
              />
              <Input
                label="Contact Email"
                name="contact_email"
                type="email"
                value={company.contact_email}
                onChange={handleChange}
                placeholder="contact@yourcompany.com"
              />
              <Input
                label="Contact Phone"
                name="contact_phone"
                type="tel"
                value={company.contact_phone}
                onChange={handleChange}
                placeholder="+1-555-123-4567"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="submit" disabled={loading} className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : hasCompany ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
