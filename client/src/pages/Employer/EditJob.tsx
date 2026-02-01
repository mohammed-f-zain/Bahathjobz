import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Select } from "../../components/UI/Select";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import { countryOptions, industryOptions, currentPositionOptions } from "../../utils/options";

// const industryOptions = [
//   { value: "Technology", label: "Technology" },
//   { value: "Healthcare", label: "Healthcare" },
//   { value: "Finance", label: "Finance" },
//   { value: "Education", label: "Education" },
//   { value: "Marketing & Advertising", label: "Marketing & Advertising" },
//   { value: "Manufacturing", label: "Manufacturing" },
//   { value: "Retail", label: "Retail" },
// ];

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

const educationOptions = [
  { value: "High School", label: "High School" },
  { value: "Associate Degree", label: "Associate Degree" },
  { value: "Bachelor's Degree", label: "Bachelor's Degree" },
  { value: "Master's Degree", label: "Master's Degree" },
  { value: "PhD", label: "PhD" },
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

export default function EditJob() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    location: "",
    workType: "remote",
    industry: "Technology",
    education: "Bachelor's Degree",
    visaEligible: false,
    seniority: "mid",
    salary_min: "",
    salary_max: "",
    currency: "USD",
    deadline: "",
  });

  // Fetch job data
  // Fetch job data
useEffect(() => {
  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/${jobId}`);
      const job = res.data;

      setFormData({
        title: job.title || "",
        description: job.description || "",
        responsibilities: job.responsibilities || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        location: job.location || "",
        workType: job.work_type || "remote",   // ✅ map snake_case -> camelCase
        industry: job.industry || "Technology",
        education: job.education || "Bachelor's Degree",
        visaEligible: job.visa_eligible || false, // ✅ map snake_case
        seniority: job.seniority || "mid",
        salary_min: job.salary_min || "",
        salary_max: job.salary_max || "",
        currency: job.currency || "USD",
        deadline: job.deadline ? job.deadline.split("T")[0] : "",
      });
    } catch (error) {
      console.error("Failed to fetch job:", error);
      toast.error("Failed to fetch job details");
    } finally {
      setFetchLoading(false);
    }
  };

  if (jobId) fetchJob();
}, [jobId]);

  // useEffect(() => {
  //   const fetchJob = async () => {
  //     try {
  //       const res = await api.get(`/jobs/${jobId}`);
  //       setFormData({
  //         ...res.data,
  //         deadline: res.data.deadline
  //           ? res.data.deadline.split("T")[0]
  //           : "",
  //       });
  //     } catch (error) {
  //       console.error("Failed to fetch job:", error);
  //       toast.error("Failed to fetch job details");
  //     } finally {
  //       setFetchLoading(false);
  //     }
  //   };

  //   if (jobId) fetchJob();
  // }, [jobId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
  title: formData.title,
  description: formData.description,
  responsibilities: formData.responsibilities,
  requirements: formData.requirements,
  benefits: formData.benefits,
  location: formData.location,
  work_type: formData.workType,       // ✅ map camelCase -> snake_case
  industry: formData.industry,
  education: formData.education,
  visa_eligible: formData.visaEligible, // ✅ map camelCase
  seniority: formData.seniority,
  salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
  salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
  currency: formData.currency,
  deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
};

      // const payload = {
      //   ...formData,
      //   salary_min: formData.salary_min
      //     ? parseInt(formData.salary_min)
      //     : undefined,
      //   salary_max: formData.salary_max
      //     ? parseInt(formData.salary_max)
      //     : undefined,
      //   deadline: formData.deadline
      //     ? new Date(formData.deadline).toISOString()
      //     : null,
      // };

      const res = await api.put(`/jobs/${jobId}`, payload);
      toast.success(res.data.message || "Job updated successfully");
      navigate("/employer/jobs");
    } catch (error: any) {
      console.error("Failed to update job:", error);
      toast.error(
        error.response?.data?.message || "Failed to update job"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <p className="p-6">Loading job details...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/employer/jobs")}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My Jobs
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Edit Job
        </h1>
        <p className="text-gray-600">
          Update your job posting details
        </p>
      </div>

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
                required
              />
              <Input
                label="Location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Job Details */}
          {/* <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Job Details
            </h3>
            <div className="space-y-4">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Describe the role and what the candidate will be doing..."
                required
              />
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="List the key responsibilities..."
                required
              />
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="List the required skills and qualifications..."
                required
              />
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Describe the benefits and perks offered..."
              />
            </div>
          </div> */}
          {/* Job Details */}
<div>
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    Job Details
  </h3>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Job Description <span className="text-red-500">*</span>
      </label>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Describe the role and what the candidate will be doing..."
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Responsibilities <span className="text-red-500">*</span>
      </label>
      <textarea
        name="responsibilities"
        value={formData.responsibilities}
        onChange={handleChange}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="List the key responsibilities for this role..."
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Requirements <span className="text-red-500">*</span>
      </label>
      <textarea
        name="requirements"
        value={formData.requirements}
        onChange={handleChange}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="List the skills, experience, and qualifications required..."
        required
      />
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
                name="workType"
                options={workTypeOptions}
                value={formData.workType}
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
                name="visaEligible"
                checked={formData.visaEligible}
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
              />
              <Input
                label="Maximum Salary"
                name="salary_max"
                type="number"
                value={formData.salary_max}
                onChange={handleChange}
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

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate("/employer/jobs")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-1" />
              {loading ? "Updating..." : "Update Job"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
