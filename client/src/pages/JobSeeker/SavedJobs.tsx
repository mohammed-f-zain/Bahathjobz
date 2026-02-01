import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api"; // axios instance
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Select } from "../../components/UI/Select";
import {
  Search,
  Filter,
  Building2,
  MapPin,
  Clock,
  Bookmark,
  Heart,
  Briefcase,
  Eye,
} from "lucide-react";
import { countryOptions, industryOptions, currentPositionOptions } from "../../utils/options";

const typeOptions = [
  { value: "", label: "All Saved Jobs" },
  { value: "favorite", label: "Liked Jobs" },
  { value: "bookmark", label: "Bookmarked Jobs" },
];

// const industryOptions = [
//   { value: "", label: "All Industries" },
//   { value: "Technology", label: "Technology" },
//   { value: "Healthcare", label: "Healthcare" },
//   { value: "Finance", label: "Finance" },
//   { value: "Marketing & Advertising", label: "Marketing & Advertising" },
//   { value: "Manufacturing", label: "Manufacturing" },
// ];

export function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Fetch Bookmarked Jobs
        const savedRes = await api.get("/saved-jobs");
        const saved = (savedRes.data.savedJobs || []).map((job: any) => ({
          ...job,
          type: "bookmark",
          savedAt: job.savedAt || job.createdAt || new Date().toISOString(),
        }));

        // Fetch Liked Jobs
        const likedRes = await api.get("/liked-jobs");
        const liked = (likedRes.data.likedJobs || []).map((job: any) => ({
          ...job,
          type: "favorite",
          savedAt: job.likedAt || job.createdAt || new Date().toISOString(),
        }));

        // Merge both lists
        setSavedJobs([...saved, ...liked]);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      }
    };
    fetchJobs();
  }, []);

  // Remove a saved/liked job
  const handleRemove = async (jobId: string, type: string) => {
    try {
      if (type === "bookmark") {
        await api.delete(`/saved-jobs/${jobId}`);
      } else if (type === "favorite") {
        await api.delete(`/liked-jobs/${jobId}`);
      }
      setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error("Error removing job:", err);
    }
  };

  const getWorkTypeBadge = (work_type: string) => {
    const badges = {
      remote: "bg-green-100 text-green-800",
      onsite: "bg-blue-100 text-blue-800",
      hybrid: "bg-purple-100 text-purple-800",
    };
    return badges[work_type as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  const getSeniorityBadge = (seniority: string) => {
    const badges = {
      entry: "bg-green-100 text-green-800",
      mid: "bg-blue-100 text-blue-800",
      senior: "bg-purple-100 text-purple-800",
      executive: "bg-red-100 text-red-800",
    };
    return badges[seniority as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (min == null && max == null) return "Not disclosed";
    if (min != null && max != null) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min != null) return `From $${min.toLocaleString()}`;
    if (max != null) return `Up to $${max.toLocaleString()}`;
    return "Not disclosed";
  };

  // Apply filters
  const filteredJobs = savedJobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || job.type === typeFilter;
    const matchesIndustry = !industryFilter || job.industry === industryFilter;

    return matchesSearch && matchesType && matchesIndustry;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
        <p className="text-gray-600">Jobs you've liked or bookmarked for later review</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{savedJobs.length}</p>
            <p className="text-sm text-gray-600">Total Saved</p>
          </div>
        </Card>
        {/* <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {savedJobs.filter((job) => job.type === "favorite").length}
            </p>
            <p className="text-sm text-gray-600">Liked Jobs</p>
          </div>
        </Card> */}
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {savedJobs.filter((job) => job.type === "bookmark").length}
            </p>
            <p className="text-sm text-gray-600">Bookmarked</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search saved jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* <Select
            options={typeOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            placeholder="Filter by type"
          /> */}
          <Select
            options={industryOptions}
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            placeholder="Filter by industry"
          />
          {/* <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button> */}
        </div>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.company}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getWorkTypeBadge(job.work_type)}`}>
                          {job.work_type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getSeniorityBadge(job.seniority)}`}>
                          {job.seniority} Level
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {job.industry}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* <div className="flex items-center space-x-2">
                    {job.type === "favorite" ? (
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                    ) : (
                      <Bookmark className="h-5 w-5 text-blue-500 fill-current" />
                    )}
                  </div> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Saved {new Date(job.savedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Job
                  </Button>
                </a>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(job.id, job.type)}>
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty states */}
      {filteredJobs.length === 0 && savedJobs.length > 0 && (
        <Card className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs match your filters</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
          <Button
            onClick={() => {
              setSearchTerm("");
              setTypeFilter("");
              setIndustryFilter("");
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {savedJobs.length === 0 && (
        <Card className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
          <p className="text-gray-600 mb-4">Start browsing jobs and save the ones you're interested in</p>
          <Link to="/jobs">
            <Button>Browse Jobs</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
