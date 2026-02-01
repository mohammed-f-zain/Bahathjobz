import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { MultiSelect } from '../../components/UI/MultiSelect';
import { Building2, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { countryOptions, industryOptions, currentPositionOptions } from "../../utils/options";

// const industryOptions = [
//   { value: 'Technology', label: 'Technology' },
//   { value: 'Healthcare', label: 'Healthcare' },
//   { value: 'Finance', label: 'Finance' },
//   { value: 'Education', label: 'Education' },
//   { value: 'Marketing & Advertising', label: 'Marketing & Advertising' },
//   { value: 'Manufacturing', label: 'Manufacturing' },
//   { value: 'Retail', label: 'Retail' },
// ];

const work_typeOptions = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];

const seniorityOptions = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'executive', label: 'Executive' },
];

const educationOptions = [
  { value: 'High School', label: 'High School' },
  { value: 'Associate Degree', label: 'Associate Degree' },
  { value: "Bachelor's Degree", label: "Bachelor's Degree" },
  { value: "Master's Degree", label: "Master's Degree" },
  { value: 'PhD', label: 'PhD' },
];

const currencyOptions = [
                  { value: 'QAR', label: 'QAR' },
                  { value: 'USD', label: 'USD' },
                  { value: 'AFN', label: 'AFN' },
                  { value: 'AMD', label: 'AMD' },
                  { value: 'AZN', label: 'AZN' },
                  { value: 'BHD', label: 'BHD' },
                  { value: 'EUR', label: 'EUR' },
                  { value: 'GEL', label: 'GEL' },
                  { value: 'IQD', label: 'IQD' },
                  { value: 'IRR', label: 'IRR' },
                  { value: 'ILS', label: 'ILS' },
                  { value: 'JOD', label: 'JOD' },
                  { value: 'KWD', label: 'KWD' },
                  { value: 'LBP', label: 'LBP' },
                  { value: 'SYP', label: 'SYP' },
                  { value: 'AED', label: 'AED' },
                  { value: 'OMR', label: 'OMR' },
                  { value: 'SAR', label: 'SAR' },
                  { value: 'YER', label: 'YER' },
                  { value: 'EUR', label: 'EUR' },
                  { value: 'GBP', label: 'GBP' },
];

export function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    location: '',
    work_type: 'remote',
    industry: 'Academic Institutions',
    education: "Bachelor's Degree",
    visa_eligible: false,
    seniority: 'mid',
    salary_min: '',
    salary_max: '',
    currency: 'USD',
    deadline: '',
    send_email_notification: false,
    notification_interests: [] as string[],
  });

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setCompanyLoading(true);
      const response = await api.get('/companies/me');
      setCompany(response.data);
    } catch (error) {
      console.error('Failed to fetch company profile:', error);
      setCompany(null);
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Job title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Job description is required');
      return;
    }
    if (formData.description.trim().length < 100) {
      toast.error('Job description must be at least 100 characters');
      return;
    }
    if (!formData.responsibilities.trim()) {
      toast.error('Job responsibilities are required');
      return;
    }
    if (formData.responsibilities.trim().length < 100) {
      toast.error('Job responsibilities must be at least 100 characters');
      return;
    }
    if (!formData.requirements.trim()) {
      toast.error('Job requirements are required');
      return;
    }
    if (formData.requirements.trim().length < 100) {
      toast.error('Job requirements must be at least 100 characters');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Job location is required');
      return;
    }
    if (!formData.deadline.trim()) {
      toast.error('Application deadline is required');
      return;
    }

    // Validate email notification interests if enabled
    if (formData.send_email_notification && formData.notification_interests.length === 0) {
      toast.error('Please select at least one interest for email notifications');
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        ...formData,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
        notification_interests: formData.send_email_notification ? formData.notification_interests : undefined,
      };

      await api.post('/jobs', jobData);

      toast.success('Job posted successfully! It will be reviewed by our team.');
      navigate('/employer/jobs');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to post job. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (companyLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Company Profile Required
          </h3>
          <p className="text-gray-600 mb-4">
            You need to create and get approval for your company profile before
            posting jobs.
          </p>
          <Button onClick={() => navigate('/employer/profile')}>
            Create Company Profile
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/employer')}
        className="inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-3 py-1.5 text-sm "
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
        <p className="text-gray-600">
          Create an attractive job posting to find the perfect candidate
        </p>
      </div>

      {/* {company && !company.isApproved && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Building2 className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-yellow-800">
                Company Approval Pending
              </p>
              <p className="text-sm text-yellow-700">
                Your company profile is under review. You can create job drafts,
                but they won't be published until your company is approved.
              </p>
            </div>
          </div>
        </Card>
      )}

      {company && company.isApproved && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Company Approved</p>
              <p className="text-sm text-green-700">
                Your company profile is approved. You can post jobs that will be
                visible after review.
              </p>
            </div>
          </div>
        </Card>
      )} */}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Job Title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Frontend Developer"
                required
              />
              <Input
                label="Location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., San Francisco, CA"
                required
              />
            </div>
          </div>

          {/* Job Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Job Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Minimum 100 characters)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the role and what the candidate will be doing... (Minimum 100 characters)"
                  required
                />
                {formData.description.length > 0 && formData.description.length < 100 && (
                  <p className="text-sm text-red-600 mt-1">
                    {100 - formData.description.length} more characters required (minimum 100)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsibilities <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Minimum 100 characters)</span>
                </label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List the key responsibilities for this role... (Minimum 100 characters)"
                  required
                />
                {formData.responsibilities.length > 0 && formData.responsibilities.length < 100 && (
                  <p className="text-sm text-red-600 mt-1">
                    {100 - formData.responsibilities.length} more characters required (minimum 100)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Minimum 100 characters)</span>
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List the skills, experience, and qualifications required... (Minimum 100 characters)"
                  required
                />
                {formData.requirements.length > 0 && formData.requirements.length < 100 && (
                  <p className="text-sm text-red-600 mt-1">
                    {100 - formData.requirements.length} more characters required (minimum 100)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits (Optional)
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the benefits and perks offered..."
                />
              </div>
            </div>
          </div>

          {/* Job Specifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Job Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Work Type"
                name="work_type"
                options={work_typeOptions}
                value={formData.work_type}
                onChange={handleChange}
                required
              />
              <Select label="Industries" name="industry" options={industryOptions} value={formData.industry} onChange={handleChange} required />
              <Select
                label="Education Level"
                name="education"
                options={educationOptions}
                value={formData.education}
                onChange={handleChange}
                required
              />
              <Select
                label="Seniority Level"
                name="seniority"
                options={seniorityOptions}
                value={formData.seniority}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                name="visa_eligible"
                checked={formData.visa_eligible}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                This position is eligible for visa sponsorship
              </label>
            </div>
          </div>

          {/* Compensation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Compensation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Minimum Salary"
                name="salary_min"
                type="number"
                value={formData.salary_min}
                onChange={handleChange}
                placeholder="80000"
              />
              <Input
                label="Maximum Salary"
                name="salary_max"
                type="number"
                value={formData.salary_max}
                onChange={handleChange}
                placeholder="120000"
              />
              <Select
                label="Currency"
                name="currency"
                options={currencyOptions}
                value={formData.currency}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Information
            </h3>
            <Input
              label="Application Deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Notification Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Email Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="send_email_notification"
                  checked={formData.send_email_notification}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Send email notifications to job seekers with matching interests
                </label>
              </div>
              
              {formData.send_email_notification && (
                <div className="mt-4 pl-6 border-l-4 border-blue-500">
                  <MultiSelect
                    label="Select Interests to Notify"
                    name="notification_interests"
                    options={industryOptions}
                    value={formData.notification_interests}
                    onChange={(selectedInterests) => {
                      setFormData((prev) => ({ ...prev, notification_interests: selectedInterests }));
                    }}
                    placeholder="Select industries for this job..."
                    required={formData.send_email_notification}
                    maxHeight="250px"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Job seekers who have selected these interests will receive an email notification about this job posting.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button variant="ghost" onClick={() => navigate('/employer')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting Job...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}