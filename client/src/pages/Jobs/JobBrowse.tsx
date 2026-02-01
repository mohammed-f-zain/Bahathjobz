import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Select } from "../../components/UI/Select";
import { useAuth } from "../../contexts/AuthContext";
import {
  Search,
  MapPin,
  Building2,
  Heart,
  Bookmark,
  Eye,
  Filter,
  DollarSign,
  Briefcase,
} from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  countryOptions,
  industryOptions,
  currentPositionOptions,
} from "../../utils/options";

// const industryOptions = [
//   { value: '', label: 'All Industries' },
//   { value: 'Technology', label: 'Technology' },
//   { value: 'Healthcare', label: 'Healthcare' },
//   { value: 'Finance', label: 'Finance' },
//   { value: 'Education', label: 'Education' },
//   { value: 'Marketing & Advertising', label: 'Marketing & Advertising' },
//   { value: 'Manufacturing', label: 'Manufacturing' },
//   { value: 'Retail', label: 'Retail' },
// ];

const workTypeOptions = [
  { value: "", label: "All Work Types" },
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
];

const seniorityOptions = [
  { value: "", label: "Experience Levels" },
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "executive", label: "Executive" },
];

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
    limit: 20,
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
  const [showFilters, setShowFilters] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    const newFilters = {
      search: search,
      location: params.get("location") || "",
      industry: params.get("industry") || "",
      workType: params.get("work_type") || "",
      seniority: params.get("seniority") || "",
    };

    console.log("Filters from URL:", newFilters);

    setFilters(newFilters);
    setSearchInputValue(search);
    fetchJobs(newFilters, pagination);
  }, [location.search]);

  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     if (searchInputValue !== filters.search) {
  //       setFilters((prev) => ({ ...prev, search: searchInputValue }));
  //       setPagination((prev) => ({ ...prev, page: 1 })); // reset page on new search
  //     }
  //   }, 700);

  //   return () => clearTimeout(handler);
  // }, [searchInputValue, filters.search]);

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
      console.log("Fetching jobs with filters:", currentFilters);
      console.log("Current pagination:", currentPagination);

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

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
      // Optionally refresh the job list to update engagement counts
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

  const formatSalary = (
    min?: number,
    max?: number,
    currency: string = "USD"
  ) => {
    if (!min && !max) return "Salary not specified";
    const currencySymbols: Record<string, string> = {
      AFN: "؋", // Afghanistan
      AMD: "֏", // Armenia
      AZN: "₼", // Azerbaijan
      BHD: ".د.ب", // Bahrain
      EUR: "€", // Cyprus
      GEL: "₾", // Georgia
      IQD: "ع.د", // Iraq
      IRR: "﷼", // Iran
      ILS: "₪", // Israel / Palestine
      JOD: "ينار", // Jordan
      KWD: "ك", // Kuwait
      LBP: "ل.ل", // Lebanon
      SYP: "£S", // Syria
      AED: "د.إ", // UAE
      OMR: "ر.ع", // Oman
      QAR: "ر.ق", // Qatar
      SAR: "SR", // Saudi Arabia
      YER: "﷼",
      // Yemen

      // add more currencies as needed
    };

    const symbol = currencySymbols[currency] || currency;

    if (min && max)
      return `${symbol} ${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    if (min) return `${symbol} ${min.toLocaleString()}+`;
    return `Up to ${symbol} ${max?.toLocaleString()}`;
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

  function CompanyLogo({ logo, name }: { logo?: string; name: string }) {
    const [imgError, setImgError] = useState(false);

    return (
      <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-blue-100">
        {logo && !imgError ? (
          <img
            src={logo}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)} // fallback if broken
          />
        ) : (
          <Building2 className="h-6 w-6 text-blue-600" />
        )}
      </div>
    );
  }

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto mb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
        <p className="text-gray-600">
          Discover opportunities that match your skills and interests
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            {/* Left: Toggle Filters */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>

            {/* Right: Apply Filters + Job Count */}
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600">
                {pagination.total} jobs found
              </p>
              <Button
                onClick={() => {
                  const updatedFilters = {
                    ...filters,
                    search: searchInputValue.trim(),
                  };
                  setFilters(updatedFilters);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                  fetchJobs(updatedFilters, { ...pagination, page: 1 });
                }}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const clearedFilters = {
                    search: "",
                    location: "",
                    industry: "",
                    workType: "",
                    seniority: "",
                  };
                  setFilters(clearedFilters);
                  setSearchInputValue("");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                  fetchJobs(clearedFilters, { ...pagination, page: 1 });
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <Select
                options={industryOptions}
                value={filters.industry}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, industry: e.target.value }))
                }
                placeholder="All Industries"
              />

              <Select
                options={workTypeOptions}
                value={filters.workType}
                onChange={(e: any) =>
                  setFilters((prev) => ({
                    ...prev,
                    workType: e.target.value || e.value,
                  }))
                }
              />

              <Select
                options={seniorityOptions}
                value={filters.seniority}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, seniority: e.target.value }))
                }
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for jobs, companies, keywords..."
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, location: e.target.value }))
                }
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4 max-w-6xl mx-auto mb-16">
        {jobs.map((job: any) => (
          <Card
            key={job.id}
            className="hover:shadow-md transition-shadow cursor-pointer relative"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {/* <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      {job.company_logo ? (
                        <img src={job.company_logo} alt={job.company_name} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <Building2 className="h-6 w-6 text-blue-600" />
                      )}
                </div> */}
                    <div className="flex items-center space-x-3">
                      <CompanyLogo
                        logo={job.company_logo}
                        name={job.company_name}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {job.company_name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEngagement(job.id, "like");
                      }}
                      className="p-2 transition-colors relative z-10"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          likedIds.includes(job.id)
                            ? "text-red-500 fill-current"
                            : "text-gray-400"
                        }`}
                      />
                    </button> */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEngagement(job.id, "favorite");
                      }}
                      className="p-2 transition-colors relative z-10"
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

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {job.description}
                </p>

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

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center text-blue-600 font-medium">
                      {/* <DollarSign className="h-4 w-4 mr-1" /> */}
                      {formatSalary(
                        job.salary_min,
                        job.salary_max,
                        job.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                to={`/jobs/${job.id}`}
                className="absolute inset-0 z-0"
              ></Link>
            </div>
          </Card>
        ))}

        {jobs.length === 0 && !loading && (
          <Card className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button
              onClick={() =>
                setFilters({
                  search: "",
                  location: "",
                  industry: "",
                  workType: "",
                  seniority: "",
                })
              }
            >
              Clear Filters
            </Button>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} jobs
            </p>
            <div className="flex items-center space-x-2">
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
              <span className="px-3 py-1 text-sm">
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
          </div>
        </Card>
      )}
    </div>
  );
}
