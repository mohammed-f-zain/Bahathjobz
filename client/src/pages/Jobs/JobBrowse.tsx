import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { useAuth } from "../../contexts/AuthContext";
import {
  Search,
  MapPin,
  Building2,
  Bookmark,
  Briefcase,
  RefreshCcw,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  industryOptions,
} from "../../utils/options";
import logoMulticolor from "../../image/logo-multicolor.png";

const workTypeOptions = [
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
];

const seniorityOptions = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "executive", label: "Executive" },
];

// Color constants
const COLORS = {
  dark: '#1b3c53',
  medium: '#234c6a',
  light: '#456882',
  bg: '#e3e3e3',
  white: '#ffffff',
  text: '#1f2937',
  textLight: '#6b7280',
};

export function JobBrowse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12, // Changed to 12
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    industry: "",
    workType: "",
    seniority: "",
  });
  const [searchInputValue, setSearchInputValue] = useState("");
  const [locationInputValue, setLocationInputValue] = useState("");
  const [openFilters, setOpenFilters] = useState({
    industries: false,
    workTypes: false,
    seniorities: false,
  });

  const toggleFilter = (filterName: keyof typeof openFilters) => {
    setOpenFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    const locationParam = params.get("location") || "";
    const newFilters = {
      search: search,
      location: locationParam,
      industry: params.get("industry") || "",
      workType: params.get("work_type") || "",
      seniority: params.get("seniority") || "",
    };

    setFilters(newFilters);
    setSearchInputValue(search);
    setLocationInputValue(locationParam);
    fetchJobs(newFilters, pagination);
  }, [location.search]);

  useEffect(() => {
    fetchJobs();
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    if (user) {
      fetchUserEngagement();
    }
  }, [user]);

  const fetchUserEngagement = async () => {
    try {
      const likedRes = await api.get("/liked-jobs");
      const savedRes = await api.get("/saved-jobs");

      setLikedIds((likedRes.data.likedJobs || []).map((j: any) => j.id));
      setSavedIds((savedRes.data.savedJobs || []).map((j: any) => j.id));
    } catch (err) {
      console.error("Failed to fetch engagement data", err);
    }
  };

  const fetchJobs = async (
    currentFilters = filters,
    currentPagination = pagination
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", currentPagination.page.toString());
      params.append("limit", currentPagination.limit.toString());

      if (currentFilters.search) params.append("search", currentFilters.search);
      if (currentFilters.location)
        params.append("location", currentFilters.location);
      if (currentFilters.industry)
        params.append("industry", currentFilters.industry);
      if (currentFilters.workType)
        params.append("work_type", currentFilters.workType);
      if (currentFilters.seniority)
        params.append("seniority", currentFilters.seniority);

      const response = await api.get(`/jobs?${params.toString()}`);
      setJobs(response.data.jobs || []);
      setPagination(response.data.pagination || currentPagination);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("Failed to fetch jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEngagement = async (jobId: string, type: "like" | "favorite") => {
    if (!user) {
      toast.error("Please login to engage with jobs");
      navigate("/login");
      return;
    }

    try {
      await api.post(`/jobs/${jobId}/engage`, { type });
      toast.success(`Job ${type}d!`);
      fetchJobs();
    } catch (error) {
      console.error(`Failed to ${type} job:`, error);
      toast.error(`Failed to ${type} job`);
    }

    if (type === "like") {
      const alreadyLiked = likedIds.includes(jobId);
      setLikedIds((prev) =>
        alreadyLiked ? prev.filter((id) => id !== jobId) : [...prev, jobId]
      );
    } else {
      const alreadySaved = savedIds.includes(jobId);
      setSavedIds((prev) =>
        alreadySaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]
      );
    }
  };


  const getWorkTypeBadge = (workType: string) => {
    const badges = {
      remote: "bg-green-100 text-green-800",
      onsite: "bg-blue-100 text-blue-800",
      hybrid: "bg-purple-100 text-purple-800",
    };
    return (
      badges[workType as keyof typeof badges] || "bg-gray-100 text-gray-800"
    );
  };

  const getSeniorityBadge = (seniority: string) => {
    const badges = {
      entry: "bg-green-100 text-green-800",
      mid: "bg-blue-100 text-blue-800",
      senior: "bg-purple-100 text-purple-800",
      executive: "bg-red-100 text-red-800",
    };
    return (
      badges[seniority as keyof typeof badges] || "bg-gray-100 text-gray-800"
    );
  };

  const formatSalary = (
    min?: number,
    max?: number,
    currency: string = "USD"
  ) => {
    if (!min && !max) return null;
    const currencySymbols: Record<string, string> = {
      AFN: "؋",
      AMD: "֏",
      AZN: "₼",
      BHD: ".د.ب",
      EUR: "€",
      GEL: "₾",
      IQD: "ع.د",
      IRR: "﷼",
      ILS: "₪",
      JOD: "ينار",
      KWD: "ك",
      LBP: "ل.ل",
      SYP: "£S",
      AED: "د.إ",
      OMR: "ر.ع",
      QAR: "ر.ق",
      SAR: "SR",
      YER: "﷼",
    };

    const symbol = currencySymbols[currency] || currency;

    if (min && max)
      return `${symbol} ${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    if (min) return `${symbol} ${min.toLocaleString()}+`;
    return `Up to ${symbol} ${max?.toLocaleString()}`;
  };

  const handleFilterChange = (
    category: "industry" | "workType" | "seniority",
    value: string
  ) => {
    setFilters((prev) => {
      // If the same value is clicked, deselect it (set to empty)
      const newValue = prev[category] === value ? "" : value;
      return {
        ...prev,
        [category]: newValue,
      };
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      location: "",
      industry: "",
      workType: "",
      seniority: "",
    };
    setFilters(clearedFilters);
    setSearchInputValue("");
    setLocationInputValue("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchJobs(clearedFilters, { ...pagination, page: 1 });
  };

  const handleSearch = () => {
    const updatedFilters = {
      ...filters,
      search: searchInputValue.trim(),
      location: locationInputValue.trim(),
    };
    setFilters(updatedFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchJobs(updatedFilters, { ...pagination, page: 1 });
  };

  function CompanyLogo({ logo, name }: { logo?: string; name: string }) {
    const [imgError, setImgError] = useState(false);

    return (
      <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-blue-100">
        {logo && !imgError ? (
          <img
            src={logo}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Building2 className="h-6 w-6 text-blue-600" />
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e3e3e3]">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative h-[40vh] flex items-center"
        style={{
          background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.medium} 50%, ${COLORS.light} 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Browse Jobs
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Discover opportunities that match your skills and interests
            </p>

            {/* Search Box - Half on bg, half on white */}
            <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl border-2 border-gray-300 py-3 px-4 sm:px-6 w-full flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full md:w-auto relative">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      SEARCH FOR JOB TITLE OR KEYWORDS
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Try &quot;accountant&quot;"
                        value={searchInputValue}
                        onChange={(e) => setSearchInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="w-full pr-4 py-3 border-r-0 md:border-r-2 border-gray-300 focus:outline-none placeholder:italic text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="flex-1 w-full md:w-auto relative">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      LOCATION
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Try &quot;Qatar&quot;"
                        value={locationInputValue}
                        onChange={(e) => setLocationInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="w-full pr-4 py-3 focus:outline-none placeholder:italic text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="flex items-center w-full md:w-auto justify-center md:justify-start">
                    <button
                      onClick={handleSearch}
                      className="w-12 h-12 rounded-full flex items-center justify-center p-0 hover:opacity-80 transition-opacity cursor-pointer"
                      style={{ backgroundColor: COLORS.dark }}
                    >
                      <Search className="h-6 w-6 text-white" />
                    </button> 
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section - Filters (30%) */}
          <div className="w-full lg:w-[30%]">
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: COLORS.dark }}>
                  Search Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                  title="Clear all filters"
                >
                  <RefreshCcw className="h-5 w-5" style={{ color: COLORS.dark }} />
                </button>
              </div>

              {/* Industries Filter */}
              <div className="mb-4">
                <button
                  onClick={() => toggleFilter("industries")}
                  className="w-full bg-[#E3E3E3] rounded-[4rem] p-4 flex items-center justify-between transition-all duration-200 hover:bg-[#d4d4d4]"
                  style={{ color: COLORS.dark }}
                >
                  <h3 className="font-bold">Industries</h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${
                      openFilters.industries ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFilters.industries && (
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {industryOptions
                      .filter((opt) => opt.value !== "")
                      .map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                        >
                          <input
                            type="radio"
                            name="industry"
                            checked={filters.industry === option.value}
                            onChange={() =>
                              handleFilterChange("industry", option.value)
                            }
                            className="w-4 h-4 mr-3"
                            style={{
                              accentColor: COLORS.dark,
                            }}
                          />
                          <span style={{ color: COLORS.dark }}>
                            {option.label}
                          </span>
                        </label>
                      ))}
                  </div>
                )}
              </div>

              {/* Work Types Filter */}
              <div className="mb-4">
                <button
                  onClick={() => toggleFilter("workTypes")}
                  className="w-full bg-[#E3E3E3] rounded-[4rem] p-4 flex items-center justify-between transition-all duration-200 hover:bg-[#d4d4d4]"
                  style={{ color: COLORS.dark }}
                >
                  <h3 className="font-bold">Work Types</h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${
                      openFilters.workTypes ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFilters.workTypes && (
                  <div className="mt-2 space-y-2">
                    {workTypeOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      >
                        <input
                          type="radio"
                          name="workType"
                          checked={filters.workType === option.value}
                          onChange={() =>
                            handleFilterChange("workType", option.value)
                          }
                          className="w-4 h-4 mr-3"
                          style={{
                            accentColor: COLORS.dark,
                          }}
                        />
                        <span style={{ color: COLORS.dark }}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience Level Filter */}
              <div className="mb-4">
                <button
                  onClick={() => toggleFilter("seniorities")}
                  className="w-full bg-[#E3E3E3] rounded-[4rem] p-4 flex items-center justify-between transition-all duration-200 hover:bg-[#d4d4d4]"
                  style={{ color: COLORS.dark }}
                >
                  <h3 className="font-bold">Experience Level</h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${
                      openFilters.seniorities ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFilters.seniorities && (
                  <div className="mt-2 space-y-2">
                    {seniorityOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      >
                        <input
                          type="radio"
                          name="seniority"
                          checked={filters.seniority === option.value}
                          onChange={() =>
                            handleFilterChange("seniority", option.value)
                          }
                          className="w-4 h-4 mr-3"
                          style={{
                            accentColor: COLORS.dark,
                          }}
                        />
                        <span style={{ color: COLORS.dark }}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Jobs (70%) */}
          <div className="w-full lg:w-[70%]">
            {/* Showing count */}
            <div className="flex justify-end mb-6">
              <p className="text-md text-gray-600">
                SHOWING {" "}
                <span className="font-bold">{Math.min(pagination.page * pagination.limit, pagination.total)} OF {pagination.total}</span>
              </p>
            </div>

            {/* Jobs Grid - 2 cards per row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {jobs.map((job: any) => (
                <div
                  key={job.id}
                  className="group relative"
                >
                  <div className="min-h-[500px] p-6 border-2 border-gray-300 hover:border-[#456882] hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden bg-white rounded-lg hover:rounded-br-[4rem] shadow-sm flex flex-col">
                    {/* Logo that slides on hover */}
                    <div className="absolute bottom-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-8 translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0 pointer-events-none z-0">
                      <img
                        src={logoMulticolor}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Job Content */}
                    <div className="relative z-10 flex flex-col flex-1">
                      {/* Logo and Title */}
                      <div className="flex items-center space-x-3 mb-4">
                        <CompanyLogo
                          logo={job.company_logo}
                          name={job.company_name}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#456882] transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                          <p className="text-base text-gray-600 line-clamp-1">
                            {job.company_name}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-base text-gray-600 mb-3">
                        <MapPin className="h-5 w-5 mr-1 transition-colors group-hover:text-[#1292bf]" />
                        <span className="line-clamp-1">{job.location}</span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 mb-4 line-clamp-2 text-base flex-1">
                        {job.description}
                      </p>

                      {/* Salary */}
                      <div className="mb-4">
                        {formatSalary(job.salary_min, job.salary_max, job.currency) ? (
                          <p className="text-base font-medium" style={{ color: COLORS.dark }}>
                            {formatSalary(job.salary_min, job.salary_max, job.currency)}
                          </p>
                        ) : (
                          <p className="text-base font-medium" style={{ color: COLORS.dark }}>
                            Salary not specified
                          </p>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getWorkTypeBadge(
                            job.work_type
                          )}`}
                        >
                          {job.work_type.charAt(0).toUpperCase() +
                            job.work_type.slice(1)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getSeniorityBadge(
                            job.seniority
                          )}`}
                        >
                          {job.seniority.charAt(0).toUpperCase() +
                            job.seniority.slice(1)}{" "}
                          Level
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {job.industry}
                        </span>
                        {job.visa_eligible && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Visa Eligible
                          </span>
                        )}
                      </div>

                      {/* Learn More Button */}
                      <Link
                        to={`/jobs/${job.id}`}
                        className="mt-auto self-start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-[4rem] transition-all duration-300 group/btn"
                          style={{
                            borderColor: COLORS.dark,
                            backgroundColor: COLORS.white,
                            color: COLORS.dark,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.dark;
                            e.currentTarget.style.color = COLORS.white;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.white;
                            e.currentTarget.style.color = COLORS.dark;
                          }}
                        >
                          <span className="font-medium text-base">View Details</span>
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:-rotate-[30deg]" />
                        </button>
                      </Link>

                      {/* Bookmark button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEngagement(job.id, "favorite");
                        }}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded transition-colors z-20"
                      >
                        <Bookmark
                          className={`h-5 w-5 ${
                            savedIds.includes(job.id)
                              ? "text-blue-500 fill-current"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No jobs found */}
            {jobs.length === 0 && !loading && (
              <Card className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button variant="blue" onClick={clearFilters}>Clear Filters</Button>
              </Card>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
