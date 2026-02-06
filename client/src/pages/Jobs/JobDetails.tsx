import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import {
  MapPin,
  Building2,
  Heart,
  Bookmark,
  Share2,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { JobSeeker } from '../../types';

export function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [jobSeekerProfile, setJobSeekerProfile] = useState<JobSeeker | null>(null);

  const getBackLink = () => {
    switch (user?.role) {
      case 'super_admin':
        return '/admin/jobs';
      case 'employer':
        return '/employer/jobs';
      default:
        return '/jobs';
    }
  };

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      fetchUserEngagement();
    }
    if (user && user.role === 'job_seeker') {
      fetchJobSeekerProfile();
    }
  }, [user, id]);
  const fetchJobSeekerProfile = async () => {
    try {
      const res = await api.get('/profiles/job-seeker/me');
      if (res.data.profile) {
        setJobSeekerProfile(res.data.profile);
      }
    } catch (err) {
      // This is not a critical error, so we don't need to show a toast
      console.error('Failed to fetch job seeker profile', err);
    }
  };
  const fetchUserEngagement = async () => {
    try {
      const savedRes = await api.get("/saved-jobs");
      const savedJobIds = (savedRes.data.savedJobs || []).map((j: any) => j.id);
      setSavedIds(savedJobIds);
    } catch (err) {
      console.error("Failed to fetch engagement data", err);
    }
  };

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${id}`);
      console.log('Job fetched:>>>>>>>>', response.data);
      setJob(response.data);
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (user.role !== 'job_seeker') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }
    if (!jobSeekerProfile) {
      toast.error('Please complete your profile before applying.');
      // navigate('/profile/jobseeker-profile');
      return;
    }

    try {
      setApplying(true);
      await api.post(`/jobs/${id}/apply`, { coverNote });
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      setCoverNote('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleEngagement = async (type: 'like' | 'favorite' | 'interest') => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (type === 'favorite') {
      const alreadySaved = savedIds.includes(id!);
      if (alreadySaved) {
        setSavedIds(prev => prev.filter(jobId => jobId !== id));
      } else {
        setSavedIds(prev => [...prev, id!]);
      }
    }

    try {
      await api.post(`/jobs/${id}/engage`, { type });
      toast.success(`Job ${type}d!`);
      fetchJob(); // Refresh job data to update engagement counts
    } catch (error) {
      console.error(`Failed to ${type} job:`, error);
      toast.error(`Failed to ${type} job`);
      // Revert optimistic update on error
      if (type === 'favorite') {
        const alreadySaved = savedIds.includes(id!);
        if (alreadySaved) {
          setSavedIds(prev => [...prev, id!]);
        } else {
          setSavedIds(prev => prev.filter(jobId => jobId !== id));
        }
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: job.title,
      text: `Check out this job: ${job.title} at ${job.company_name}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing job:', error);
      toast.error('Could not share job.');
    }
  };

  const formatSalary = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    const currencySymbols: Record<string, string> = {
      AFN: '؋',    // Afghanistan
      AMD: '֏',    // Armenia
      AZN: '₼',    // Azerbaijan
      BHD: '.د.ب', // Bahrain
      EUR: '€',    // Cyprus
      GEL: '₾',    // Georgia
      IQD: 'ع.د',  // Iraq
      IRR: '﷼',    // Iran
      ILS: '₪',    // Israel / Palestine
      JOD: 'ينار', // Jordan
      KWD: 'ك',    // Kuwait
      LBP: 'ل.ل',  // Lebanon
      SYP: '£S',   // Syria
      AED: 'د.إ',  // UAE
      OMR: 'ر.ع',  // Oman
      QAR: 'ر.ق',  // Qatar
      SAR: 'SR',   // Saudi Arabia
      YER: '﷼',
      // Yemen

      // add more currencies as needed
    };

    const symbol = currencySymbols[currency] || currency;

    if (min && max) return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    if (min) return `${symbol}${min.toLocaleString()}+`;
    return `Up to ${symbol}${max?.toLocaleString()}`;
  };

  const getWorkTypeBadge = (workType: string) => {
    const badges = {
      remote: 'bg-green-100 text-green-800',
      onsite: 'bg-blue-100 text-blue-800',
      hybrid: 'bg-purple-100 text-purple-800',
    };
    return badges[workType as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getSeniorityBadge = (seniority: string) => {
    const badges = {
      entry: 'bg-green-100 text-green-800',
      mid: 'bg-blue-100 text-blue-800',
      senior: 'bg-purple-100 text-purple-800',
      executive: 'bg-red-100 text-red-800',
    };
    return badges[seniority as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded mb-6 w-1/4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Job not found</h3>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* <button
        onClick={() => navigate('/employer/jobs')}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </button> */}
      <Link to={getBackLink()} className="inline-flex items-center justify-center font-medium transition-colors border border-[#456882] rounded-full text-[#456882] hover:bg-[#456882]/10 focus:ring-[#456882] px-3 py-1.5 text-sm mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Link>

      {/* Job Header */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              {job.company_logo ? (
                <img src={job.company_logo} alt={job.company_name} className="w-16 h-16 object-cover rounded-lg" />
              ) : (
                <Building2 className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
              <div className="flex items-center space-x-3 text-gray-600 mb-2">
                <span className="font-medium">{job.company_name}</span>
                {job.company_website && (
                  <a
                    href={job.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEngagement('like')}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              {/* <Heart className="h-5 w-5" /> */}
            </button>
            {user?.role === 'job_seeker' && (
              <button
                onClick={() => handleEngagement('favorite')}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Bookmark className={`h-5 w-5 ${savedIds.includes(id!) ? 'text-blue-500 fill-current' : ''}`} />
              </button>
            )}
            <button onClick={handleShare} className="p-2 text-gray-400 hover:text-green-500 transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className={`px-3 py-1 text-sm rounded-full ${getWorkTypeBadge(job.work_type)}`}>
            {job.work_type.charAt(0).toUpperCase() + job.work_type.slice(1)}
          </span>
          <span className={`px-3 py-1 text-sm rounded-full ${getSeniorityBadge(job.seniority)}`}>
            {job.seniority.charAt(0).toUpperCase() + job.seniority.slice(1)} Level
          </span>
          <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
            {job.industry}
          </span>
          {job.visa_eligible && (
            <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
              Visa Eligible
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center text-lg font-semibold text-gray-900">
              {/* <DollarSign className="h-5 w-5 mr-1" /> */}
              {formatSalary(job.salary_min, job.salary_max, job.currency)}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {user?.role === 'job_seeker' && (
              <>
                {/* <Button
                  variant="outline"
                  onClick={() => handleEngagement('interest')}
                >
                  Mark Interest
                </Button> */}
                <Button onClick={() => setShowApplyModal(true)}>
                  Apply Now
                </Button>
              </>
            )}
            {!user && (
              <Button variant="search" onClick={() => navigate('/auth/login')}>
                Sign In to Apply
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
            <div className="prose max-w-none">
              <div className="text-gray-700">
                {job.responsibilities.split('\n').map((item: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
            <div className="prose max-w-none">
              <div className="text-gray-700">
                {job.requirements.split('\n').map((item: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {job.benefits && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
              <div className="prose max-w-none">
                <div className="text-gray-700">
                  {job.benefits.split('\n').map((item: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Job Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Education</span>
                <span className="font-medium">{job.education}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Experience</span>
                <span className="font-medium">{job.seniority} Level</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Work Type</span>
                <span className="font-medium capitalize">{job.work_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Industry</span>
                <span className="font-medium ml-14">{job.industry}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Company Info</h3>
            <div className="space-y-3">
              <div>
                {/* <span className="text-gray-600">Company Name</span> */}
                <p className="text-sm text-gray-700 mt-1">{job.company?.name || 'Not available'}</p>
              </div>
              <div>
                {/* <span className="text-gray-600">About</span> */}
                <p className="text-sm text-gray-700 mt-1">{job.company?.description || 'Not available'}</p>
              </div>

            </div>
          </Card>

          {/* Similar Jobs */}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for {job.title}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Note (Optional)
              </label>
              <textarea
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell the employer why you're interested in this role..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowApplyModal(false)}
                disabled={applying}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}