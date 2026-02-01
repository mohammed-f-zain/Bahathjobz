// src/pages/Employer/CVSearch.tsx
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Select } from "../../components/UI/Select";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {  industryOptions, currentPositionOptions } from "../../utils/options";


const locationOptions = [
  { value: "", label: "All Locations" },
  { value: "San Francisco", label: "San Francisco, CA" },
  { value: "New York", label: "New York, NY" },
  { value: "Austin", label: "Austin, TX" },
  { value: "Remote", label: "Remote" },
];

const educationOptions = [
  { value: "", label: "All Education Levels" },
  { value: "High School", label: "High School" },
  { value: "Associate", label: "Associate Degree" },
  { value: "Bachelor", label: "Bachelor's Degree" },
  { value: "Master", label: "Master's Degree" },
  { value: "PhD", label: "PhD" },
];

// residence visa , work visa , family visa , visit visa
const visaStatusOptions = [
  { value: "", label: "All Visa Status" },
  { value: "residence visa", label: "residence visa" },
  { value: "work visa", label: "work visa" },
  { value: "family visa", label: "family visa" },
  { value: "visit visa", label: "visit visa" },

];



export function CVSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [educationFilter, setEducationFilter] = useState("");
  const [visaStatusFilter, setVisaStatusFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [currentPositionFilter, setCurrentPositionFilter] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCandidates();
    }, 500); // Debounce requests

    return () => {
      clearTimeout(handler);
    };
  }, [
    searchTerm,
    locationFilter,
    educationFilter,
    visaStatusFilter,
    industryFilter,
    currentPositionFilter,
    skillsFilter,
    experienceFilter,
    pagination.page,
  ]);

  // Reset to page 1 when filters (but not pagination) change
  useEffect(() => {
    const handler = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((p) => ({ ...p, page: 1 }));
      }
    }, 400); // Slightly less than search debounce

    return () => clearTimeout(handler);
  }, [
    searchTerm,
    locationFilter,
    educationFilter,
    visaStatusFilter,
    industryFilter,
    currentPositionFilter,
    skillsFilter,
    experienceFilter,
  ]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      if (searchTerm) params.append("search", searchTerm);
      if (locationFilter) params.append("location", locationFilter);
      if (educationFilter) params.append("education", educationFilter);
      if (visaStatusFilter) params.append("visaStatus", visaStatusFilter);
      if (industryFilter) params.append("industries", industryFilter);
      if (currentPositionFilter) params.append("currentPosition", currentPositionFilter);
      if (skillsFilter) params.append("skills", skillsFilter);
      if (experienceFilter) params.append("experience", experienceFilter);

      const response = await api.get(
        `/profiles/job-seekers/search?${params.toString()}`
      );
      setCandidates(response.data.profiles || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
      toast.error("Failed to fetch candidates");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const getVisaStatusBadge = (visaStatus: string) => {
    const badges = {
      Citizen: "bg-green-100 text-green-800",
      "Green Card": "bg-blue-100 text-blue-800",
      H1B: "bg-purple-100 text-purple-800",
      L1: "bg-orange-100 text-orange-800",
      "F1 (OPT)": "bg-yellow-100 text-yellow-800",
    };
    return badges[visaStatus as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

const parseSkills = (skills: any): string[] => {
  if (!skills) return [];

  // If already array
  if (Array.isArray(skills)) return skills;

  // If it's a string
  if (typeof skills === "string") {
    try {
      // Try parse JSON first
      const parsed = JSON.parse(skills);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Fallback: split by comma
      return skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  return [];
};

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CV Search</h1>
        <p className="text-gray-600">
          Search and discover talented candidates for your open positions
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="mb-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by skills, experience, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>           
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
            <p className="text-sm text-gray-600">
              {pagination.total} candidates found
            </p>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <Select
                options={educationOptions}
                value={educationFilter}
                onChange={(e) => setEducationFilter(e.target.value)}
                placeholder="Education Level"
              />
              <Select
                options={visaStatusOptions}
                value={visaStatusFilter}
                onChange={(e) => setVisaStatusFilter(e.target.value)}
                placeholder="Visa Status"
              />
               <Select
                options={industryOptions}
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                placeholder="All Industries"
              />
              <Select
                options={currentPositionOptions}
                value={currentPositionFilter}
                onChange={(e) => setCurrentPositionFilter(e.target.value)}
                placeholder="Current Position"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Candidate List */}
      <div className="space-y-6">
  {candidates.map((candidate: any) => (
    <Card
      key={candidate.id}
      className="hover:shadow-lg transition-shadow border border-gray-200 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        {/* Left: Avatar + Name */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {candidate.avatar ? (
              <img
                src={candidate.avatar}
                alt={`${candidate.firstName} ${candidate.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {candidate.firstName} {candidate.lastName}
            </h3>
            {candidate.currentPosition && (
              <p className="text-sm text-gray-600">{candidate.currentPosition}</p>
            )}
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              {candidate.location && (
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {candidate.location}
                </span>
              )}
              {candidate.availability && (
                <span className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {candidate.availability}
                </span>
              )}
              {candidate.nationality && (
                <span className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  {candidate.nationality}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Visa Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getVisaStatusBadge(
            candidate.visaStatus
          )}`}
        >
          {candidate.visaStatus || "Not Provided"}
        </span>
      </div>

      {/* Summary */}
      {candidate.summary && (
        <p className="text-gray-700 mt-4 line-clamp-3">
          {candidate.summary}
        </p>
      )}

      {/* Education & Experience */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm text-blue-900">
        {candidate.education && (
          <div className="flex items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg shadow-sm">
            <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
            <span className="font-medium">{candidate.education}</span>
          </div>
        )}

        {candidate.experience && (
          <div className="flex items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg shadow-sm">
            <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
            <span className="font-medium">{candidate.experience}</span>
          </div>
        )}
        {candidate.industries && candidate.industries.length > 0 && (
    <>
      {candidate.industries.map((industries: string, index: number) => (
        <div
          key={index}
          className="flex items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg shadow-sm"
        >
          <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
          <span className="font-medium">{industries}</span>
        </div>
      ))}
    </>
  )}
  </div>


      {/* Skills */}
      {candidate.skills && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {parseSkills(candidate.skills).map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer: Contact & Actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mt-6 pt-4 border-t border-gray-200">
        {/* Contact Info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {(candidate.personalEmail || candidate.email) && (
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${candidate.personalEmail || candidate.email}`}
              className="flex items-center hover:text-blue-600"
            >
              <Mail className="h-4 w-4 mr-1" />
              {candidate.personalEmail || candidate.email}
            </a>
          )}
          {candidate.phone && (
            <a
              href={`tel:${candidate.phone}`}
              className="flex items-center hover:text-blue-600"
            >
              <Phone className="h-4 w-4 mr-1" />
              {candidate.phone}
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {candidate.portfolioUrl && (
            <a href={candidate.portfolioUrl} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="sm">
                <Globe className="h-4 w-4 mr-1" /> Portfolio
              </Button>
            </a>
          )}
          {candidate.linkedinUrl && (
            <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" /> LinkedIn
              </Button>
            </a>
          )}
          {candidate.resumeUrl ? (
            <a 
              href={
                candidate.resumeUrl.startsWith("http")
                  ? candidate.resumeUrl
                  : candidate.resumeUrl.startsWith("/")
                  ? `https://api.bahathjobz.com${candidate.resumeUrl}`
                  : `https://api.bahathjobz.com/${candidate.resumeUrl}`
              }
              target="_blank" 
              rel="noreferrer"
            >
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" /> Resume
              </Button>
            </a>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4 mr-1" /> No Resume
            </Button>
          )}
          <Link to={`/employer/contact/${candidate.id}`} state={{ candidate }}>
            <Button size="sm">
              <Mail className="h-4 w-4 mr-1" /> Contact
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  ))}
</div>

      {/* No candidates */}
      {candidates.length === 0 && !loading && (
        <Card className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No candidates found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters
          </p>
          <Button
            onClick={() => {
              setSearchTerm("");
              setLocationFilter("");
              setEducationFilter("");
              setVisaStatusFilter("");
              setSkillsFilter("");
              setExperienceFilter("");
              setIndustryFilter("");
              setCurrentPositionFilter("");
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} candidates
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