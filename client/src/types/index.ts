export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'employer' | 'job_seeker';
  avatar?: string;
  phone?: string;
  createdAt: string;
  isActive: boolean;
  interests?: string[];
  interests_selected?: boolean;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  banner?: string;
  tagline?: string;
  description?: string;
  industry: string;
  website?: string;
  location: string;
  contactEmail: string;
  contactPhone?: string;
  isApproved: boolean;
  employerId: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits?: string;
  location: string;
  workType: 'onsite' | 'remote' | 'hybrid';
  industry: string;
  education: string;
  visaEligible: boolean;
  seniority: 'entry' | 'mid' | 'senior' | 'executive';
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  isApproved: boolean;
  isActive: boolean;
  companyId: string;
  employerId: string;
  createdAt: string;
  deadline?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobSeekerId: string;
  coverNote?: string;
  status: 'applied' | 'under_review' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
  updatedAt: string;
}

export interface JobSeeker {
  id: string;
  userId: string;
  summary?: string;
  availability: string;
  education: string;
  experience: string;
  skills: string[];
  resumeUrl?: string;
  location: string;
  visaStatus: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
}

export interface Engagement {
  id: string;
  jobId: string;
  userId: string;
  type: 'like' | 'comment' | 'favorite' | 'interest';
  content?: string; // for comments
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'job_update' | 'engagement' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface Analytics {
  totalUsers: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  dailyActivity: { date: string; count: number }[];
  monthlyActivity: { month: string; count: number }[];
}