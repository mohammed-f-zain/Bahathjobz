import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Select } from "../../components/UI/Select";
import api from "../../utils/api"; // axios instance
import {
  Search,
  Filter,
  Building2,
  MapPin,
  DollarSign,
  Heart,
  Eye,
} from "lucide-react";

const industryOptions = [
  { value: "", label: "All Industries" },
  { value: "Technology", label: "Technology" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Finance", label: "Finance" },
  { value: "Marketing & Advertising", label: "Marketing & Advertising" },
];

const workTypeOptions = [
  { value: "", label: "All Work Types" },
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
];

export function LikedJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState("");

  // Fetch liked jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/liked-jobs");

        // Flatten response
        const formattedJobs =
          res.data?.likedJobs?.map((item: any) => ({
            likedId: item.id,
            ...item.job,
            company_name: item.job?.company?.name || "Unknown Company",
            company_logo: item.job?.company?.logo || "",
          })) || [];

        setJobs(formattedJobs);
      } catch (error) {
        console.error("Failed to fetch liked jobs:", error);
      }
    };
    fetchJobs();
  }, []);


// Remove job from liked list (using jobId, not likedId)
const handleUnlike = async (jobId: string) => {
  try {
    await api.delete(`/liked-jobs/${jobId}`); // backend expects jobId
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
  } catch (err) {
    console.error("Error removing liked job:", err);
  }
};

// Apply to a job
const handleApply = async (jobId: string) => {
  try {
    await api.post("/job-applications", { jobId }); // <-- backend must accept this
    alert("✅ Successfully applied for this job!");
    // Optional: you could track applied jobs in state
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, applied: true } : job
      )
    );
  } catch (err) {
    console.error("❌ Error applying for job:", err);
    alert("⚠️ Failed to apply. Please try again.");
  }
};



  const formatSalary = (min: number, max: number) => {
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
  };

  // Apply filters
  const filteredJobs = Array.isArray(jobs)
    ? jobs.filter((job) => {
        const matchesSearch =
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesIndustry = !industryFilter || job.industry === industryFilter;
        const matchesWorkType =
          !workTypeFilter ||
          job.work_type?.toLowerCase() === workTypeFilter.toLowerCase();

        return matchesSearch && matchesIndustry && matchesWorkType;
      })
    : [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Liked Jobs</h1>
        <p className="text-gray-600">Jobs you've shown interest in by liking them</p>
      </div>

      {/* Stats Card */}
      <Card className="mb-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Heart className="h-8 w-8 text-red-500 mr-2" />
            <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
          </div>
          <p className="text-gray-600">Jobs you've liked</p>
        </div>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search liked jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            options={industryOptions}
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            placeholder="Filter by industry"
          />
          <Select
            options={workTypeOptions}
            value={workTypeFilter}
            onChange={(e) => setWorkTypeFilter(e.target.value)}
            placeholder="Filter by work type"
          />
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
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
                      <p className="text-sm text-gray-600">{job.company_name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {job.work_type && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            {job.work_type}
                          </span>
                        )}
                        {job.seniority && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {job.seniority}
                          </span>
                        )}
                        {job.industry && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {job.industry}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* <Heart className="h-5 w-5 text-red-500 fill-current" /> */}
                </div>

                <div className="mb-3">
                  <p className="text-gray-700 text-sm line-clamp-2">{job.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  {job.salary_min && job.salary_max && (
                    <div className="flex items-center">
                      {/* <DollarSign className="h-4 w-4 mr-1" /> */}
                      {formatSalary(job.salary_min, job.salary_max)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <Link to={`/jobs/${job.id}`} target="_blank">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Job
                  </Button>
                </Link>
                {/* <Button variant="ghost" size="sm" onClick={() => handleUnlike(job.likedId)}>
                  <Heart className="h-4 w-4 mr-1 text-red-500" />
                  Unlike
                </Button> */}
                <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnlike(job.id)} 
              >
                <Heart className="h-4 w-4 mr-1 text-red-500" />
                Unlike
              </Button>
                {/* <Button size="sm">Apply Now</Button> */}
                <Button
  size="sm"
  onClick={() => handleApply(job.id)}
  disabled={job.applied} // disable if already applied
>
  {job.applied ? "Applied" : "Apply Now"}
</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && jobs.length > 0 && (
        <Card className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No jobs match your filters
          </h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
          <Button
            onClick={() => {
              setSearchTerm("");
              setIndustryFilter("");
              setWorkTypeFilter("");
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {jobs.length === 0 && (
        <Card className="text-center py-12">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No liked jobs yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start browsing jobs and like the ones you're interested in
          </p>
          <Link to="/jobs">
            <Button>Browse Jobs</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
