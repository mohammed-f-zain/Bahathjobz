import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Briefcase, 
  Users, 
  TrendingUp, 
  MapPin, 
  Building2, 
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  ChevronDown
} from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';

// ✅ Always use import.meta.env for Vite projects
const API_URL = import.meta.env.VITE_API_URL;

// Modern Color Palette from Color Hunt
const COLORS = {
  dark: '#1b3c53',      // Dark navy blue
  medium: '#234c6a',    // Medium blue
  light: '#456882',     // Light blue
  bg: '#e3e3e3',        // Light gray background
  white: '#ffffff',
  text: '#1f2937',
  textLight: '#6b7280',
};

type Job = {
  id: number;
  title: string;
  description: string;
  location: string;
  company_name: string;
  company_logo?: string;
  created_at: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  work_type?: string;
};

export function Home() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    activeJobs: 0,
    jobSeekers: 0,
    companies: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(1),
        limit: String(6),
        ...(search && { search }),
        ...(location && { location }),
      });

      const res = await fetch(`${API_URL}/jobs?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setJobs(data.jobs || []);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    navigate(`/jobs?search=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`);
  };

  const scrollToJobs = () => {
    const jobsSection = document.getElementById('featured-jobs');
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/stats`);
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        setStats({
          activeJobs: 10000,
          jobSeekers: 50000,
          companies: 2500,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats({
        activeJobs: 10000,
        jobSeekers: 50000,
        companies: 2500,
      });
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchStats();
    setIsVisible(true);
  }, []);

  // Animated counter component
  const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      const stepDuration = duration / steps;

      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }, [value]);

    return (
      <span>
        {count.toLocaleString()}{suffix}
      </span>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      {/* Hero Section with Animated Background */}
      <section 
        className="relative overflow-hidden text-white py-20 sm:py-24 lg:py-32 min-h-[90vh] flex items-center"
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.medium} 50%, ${COLORS.light} 100%)`
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"
            style={{ backgroundColor: COLORS.light }}
          />
          <div 
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow-delayed"
            style={{ backgroundColor: COLORS.medium }}
          />
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse-slow"
            style={{ backgroundColor: COLORS.white }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-block mb-6 animate-fade-in">
              <div 
                className="flex items-center justify-center gap-2 backdrop-blur-md px-5 py-2.5 rounded-full border shadow-lg"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                }}
              >
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">Your Career Journey Starts Here</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-delayed">
              Find Your Dream Job with{' '}
              <span 
                className="bg-clip-text text-transparent animate-gradient"
                style={{ 
                  backgroundImage: `linear-gradient(to right, ${COLORS.white}, ${COLORS.bg}, ${COLORS.white})`,
                  backgroundSize: '200% 200%'
                }}
              >
                BAHATH JOBZ
              </span>
            </h1>
            
            <p 
              className="text-lg sm:text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-delayed-2"
              style={{ color: 'rgba(255, 255, 255, 0.95)' }}
            >
              Connect with top employers and discover opportunities that match your skills and aspirations.
              Your next career move is just a click away.
            </p>
            
            {/* Enhanced Modern Search Bar */}
            <div 
              className="backdrop-blur-xl rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center max-w-5xl mx-auto shadow-2xl border animate-fade-in-delayed-3"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(69, 104, 130, 0.3)'
              }}
            >
              <div 
                className="flex-1 flex items-center px-4 py-3 md:py-2 rounded-xl md:rounded-l-xl md:rounded-r-none border focus-within:ring-2 transition-all duration-300"
                style={{ 
                  backgroundColor: 'rgba(227, 227, 227, 0.5)',
                  borderColor: 'rgba(69, 104, 130, 0.3)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = COLORS.medium;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.medium}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(227, 227, 227, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(69, 104, 130, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Search className="h-5 w-5 mr-3 flex-shrink-0" style={{ color: COLORS.light }} />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-transparent placeholder-gray-500 focus:outline-none text-base sm:text-lg font-medium"
                  style={{ color: '#1f2937' }}
                />
              </div>
              
              <div className="border-t md:border-t-0 md:border-l my-2 md:my-0 md:mx-2" style={{ borderColor: COLORS.bg }} />
              
              <div 
                className="flex items-center px-4 py-3 md:py-2 rounded-xl md:rounded-r-xl md:rounded-l-none border focus-within:ring-2 transition-all duration-300"
                style={{ 
                  backgroundColor: 'rgba(227, 227, 227, 0.5)',
                  borderColor: 'rgba(69, 104, 130, 0.3)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = COLORS.medium;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.medium}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(227, 227, 227, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(69, 104, 130, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <MapPin className="h-5 w-5 mr-3 flex-shrink-0" style={{ color: COLORS.light }} />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full md:w-48 bg-transparent placeholder-gray-500 focus:outline-none text-base sm:text-lg font-medium"
                  style={{ color: '#1f2937' }}
                />
              </div>
              
              <div 
                className="ml-0 md:ml-4 mt-3 md:mt-0 w-full md:w-auto"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.dark} 100%)`,
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.medium} 100%)`;
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.dark} 100%)`;
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
              >
                <Button 
                  onClick={handleSearch}
                  className="px-6 md:px-8 py-3 md:py-3.5 text-base sm:text-lg font-semibold text-white w-full rounded-xl border-0 bg-transparent shadow-none"
                >
                  Search Jobs
                  <ArrowRight className="ml-2 h-5 w-5 inline" />
                </Button>
              </div>
            </div>

            {/* Scroll Down Button */}
            <div className="flex justify-center mt-16 animate-bounce-slow">
              <button
                onClick={scrollToJobs}
                className="group flex flex-col items-center gap-2 transition-colors duration-300"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = COLORS.white}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
                aria-label="Scroll to jobs"
              >
                <span className="text-sm font-medium mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore Jobs
                </span>
                <div 
                  className="w-12 h-12 rounded-full backdrop-blur-sm border-2 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  }}
                >
                  <ChevronDown className="h-6 w-6" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Animation */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center group animate-fade-in-up">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300"
                style={{ background: `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.dark} 100%)` }}
              >
                <Briefcase className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3"
                style={{ color: COLORS.medium }}
              >
                <AnimatedCounter value={stats.activeJobs || 10000} />+
              </h3>
              <p className="text-base sm:text-lg font-medium" style={{ color: COLORS.textLight }}>Active Jobs</p>
            </div>

            <div className="text-center group animate-fade-in-up-delayed">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300"
                style={{ background: `linear-gradient(135deg, ${COLORS.light} 0%, ${COLORS.medium} 100%)` }}
              >
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3"
                style={{ color: COLORS.light }}
              >
                <AnimatedCounter value={stats.jobSeekers || 50000} />+
              </h3>
              <p className="text-base sm:text-lg font-medium" style={{ color: COLORS.textLight }}>Job Seekers</p>
            </div>

            <div className="text-center group animate-fade-in-up-delayed-2">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300"
                style={{ background: `linear-gradient(135deg, ${COLORS.bg} 0%, ${COLORS.light} 100%)` }}
              >
                <Building2 className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: COLORS.dark }} />
              </div>
              <h3 
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3"
                style={{ color: COLORS.dark }}
              >
                <AnimatedCounter value={stats.companies || 2500} />+
              </h3>
              <p className="text-base sm:text-lg font-medium" style={{ color: COLORS.textLight }}>Companies</p>
            </div>

            <div className="text-center group animate-fade-in-up-delayed-3">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300"
                style={{ background: `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.light} 100%)` }}
              >
                <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3"
                style={{ color: COLORS.medium }}
              >
                95%
              </h3>
              <p className="text-base sm:text-lg font-medium" style={{ color: COLORS.textLight }}>Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section id="featured-jobs" className="py-16 sm:py-20" style={{ backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: COLORS.medium }} />
              <span 
                className="font-semibold uppercase tracking-wide text-xs sm:text-sm"
                style={{ color: COLORS.medium }}
              >
                Featured Opportunities
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ color: COLORS.dark }}>
              Discover Your Next Career Move
            </h2>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto" style={{ color: COLORS.textLight }}>
              Explore handpicked job opportunities from top companies
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-64 animate-pulse rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${COLORS.bg}, ${COLORS.white})` }}
                />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {jobs.map((job, index) => (
                <div
                  key={job.id}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link to={`/jobs/${job.id}`} className="block h-full">
                    <div
                      className="h-full p-5 sm:p-6 hover:shadow-2xl transition-all duration-300 border-2 cursor-pointer relative overflow-hidden rounded-lg"
                      style={{ 
                        backgroundColor: COLORS.white,
                        borderColor: COLORS.bg
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.currentTarget.style.borderColor = COLORS.medium;
                        e.currentTarget.style.transform = 'translateY(-8px)';
                      }}
                      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.currentTarget.style.borderColor = COLORS.bg;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Card className="h-full p-0 border-0 shadow-none bg-transparent">
                      {/* Gradient overlay on hover */}
                      <div 
                        className="absolute inset-0 transition-all duration-500"
                        style={{ 
                          background: `linear-gradient(135deg, transparent 0%, ${COLORS.light}20 100%)`,
                          opacity: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0';
                        }}
                      />
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            {job.company_logo ? (
                              <img
                                src={job.company_logo}
                                alt={job.company_name}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 group-hover:shadow-lg transition-all duration-300 flex-shrink-0"
                                style={{ borderColor: COLORS.bg }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = COLORS.medium;
                                }}
                              />
                            ) : (
                              <div 
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                                style={{ background: `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.light} 100%)` }}
                              >
                                <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 
                                className="font-bold text-base sm:text-lg mb-1 transition-colors line-clamp-1"
                                style={{ color: COLORS.dark }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = COLORS.medium;
                                }}
                              >
                                {job.title}
                              </h3>
                              <p className="text-xs sm:text-sm font-medium line-clamp-1" style={{ color: COLORS.textLight }}>
                                {job.company_name}
                              </p>
                            </div>
                          </div>
                        </div>

                        {job.description && (
                          <p className="text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: COLORS.textLight }}>
                            {job.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                          <span 
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                            style={{ 
                              backgroundColor: `${COLORS.bg}`,
                              color: COLORS.dark,
                              borderColor: COLORS.bg
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = COLORS.light;
                              e.currentTarget.style.color = COLORS.white;
                            }}
                          >
                            <MapPin className="h-3 w-3 mr-1.5" />
                            <span className="truncate max-w-[120px] sm:max-w-none">{job.location}</span>
                          </span>
                          {job.work_type && (
                            <span 
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                              style={{ 
                                backgroundColor: `${COLORS.medium}20`,
                                color: COLORS.dark,
                                borderColor: COLORS.medium
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${COLORS.medium}40`;
                              }}
                            >
                              {job.work_type}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t transition-colors" style={{ borderColor: COLORS.bg }}>
                          {(job.salary_min || job.salary_max) && (
                            <span className="font-bold text-sm sm:text-lg" style={{ color: COLORS.medium }}>
                              {job.currency || '$'}
                              {job.salary_min?.toLocaleString()}
                              {job.salary_max && ` - ${job.currency || '$'}${job.salary_max.toLocaleString()}`}
                            </span>
                          )}
                          <div className="flex items-center gap-2 transition-colors" style={{ color: COLORS.light }}>
                            <span className="text-xs font-medium">View Details</span>
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                      </Card>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto mb-4" style={{ color: COLORS.light }} />
              <p className="text-lg" style={{ color: COLORS.textLight }}>No jobs found. Try adjusting your search.</p>
            </div>
          )}

          <div className="text-center mt-8 sm:mt-12 animate-fade-in">
            <Link to="/jobs">
              <div
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.dark} 100%)`
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.light} 100%)`;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.dark} 100%)`;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Button 
                  size="lg" 
                  className="text-white border-0 bg-transparent shadow-none hover:text-white"
                  style={{ color: '#ffffff' }}
                >
                  View All Jobs
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 inline" />
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section 
        className="relative py-16 sm:py-20 lg:py-24 text-white overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.medium} 50%, ${COLORS.light} 100%)`
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 rounded-full filter blur-3xl animate-pulse-slow opacity-20"
            style={{ backgroundColor: COLORS.white }}
          />
          <div 
            className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 rounded-full filter blur-3xl animate-pulse-slow-delayed opacity-20"
            style={{ backgroundColor: COLORS.bg }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="inline-block mb-6">
              <Target className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 animate-pulse" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Ready to Start Your Career Journey?
            </h2>
            
            <p 
              className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed"
              style={{ color: 'rgba(255, 255, 255, 0.95)' }}
            >
              Join thousands of professionals who found their dream jobs through BAHATH JOBZ.
              Your success story begins today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link to="/auth/register?role=job_seeker" className="w-full sm:w-auto group">
                <div
                  className="w-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl inline-flex items-center justify-center"
                  style={{ 
                    backgroundColor: COLORS.white,
                    color: COLORS.dark
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.backgroundColor = COLORS.bg;
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.backgroundColor = COLORS.white;
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="w-full border-0 bg-transparent shadow-none hover:bg-transparent"
                    style={{ color: COLORS.dark }}
                  >
                    <span style={{ color: COLORS.dark }}>I'm Looking for a Job</span>
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 inline" style={{ color: COLORS.dark }} />
                  </Button>
                </div>
              </Link>
              
              <Link to="/auth/register?role=employer" className="w-full sm:w-auto group">
                <div
                  className="w-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl inline-flex items-center justify-center"
                  style={{ 
                    backgroundColor: COLORS.white,
                    color: COLORS.dark
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.backgroundColor = COLORS.bg;
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.backgroundColor = COLORS.white;
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="w-full border-0 bg-transparent shadow-none hover:bg-transparent"
                    style={{ color: COLORS.dark }}
                  >
                    <span style={{ color: COLORS.dark }}>I'm Hiring</span>
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 inline" style={{ color: COLORS.dark }} />
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
