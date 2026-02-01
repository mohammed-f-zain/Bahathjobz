// src/pages/JobSeeker/ViewApplication.tsx

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Loader2, ArrowLeft } from "lucide-react";
import { Building2 } from "lucide-react";


interface Company {
  name: string;
  logo: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  location: string;
  work_type: string;
  industry: string;
  education: string;
  visa_eligible: boolean;
  seniority: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  company: Company;
}

interface Application {
  id: string;
  cover_note: string;
  status: string;
  applied_at: string;
  job_title: string;
  job_location: string;
  company_name: string;
  company_logo: string;
  job: Job;
}

const ViewApplication: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        console.log("Fetching application from API:", `/applications/${id}`);
        const res = await api.get(`/applications/${id}`);
        console.log("API Response:", res.data);
        setApplication(res.data.application);
      } catch (error) {
        console.error("Error fetching application:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApplication();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6 text-center text-gray-600">
        Application not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Link to="/applications">
        <Button  className="inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-3 py-1.5 text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </Button>
      </Link>

      {/* Application Info */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg border bg-blue-50 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-blue-600" />
                </div>
                        {/* <img
            src={application.company_logo}
            alt={application.company_name}
            className="w-14 h-14 object-cover rounded-lg border"
          /> */}
          <div>
            <h2 className="text-xl font-semibold">{application.job_title}</h2>
            <p className="text-gray-600">{application.company_name}</p>
            <p className="text-sm text-gray-500">{application.job_location}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span className="capitalize">{application.status}</span>
          </p>
          <p>
            <span className="font-medium">Applied At:</span>{" "}
            {new Date(application.applied_at).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Cover Note:</span> {application.cover_note}
          </p>
        </div>
      </Card>

      {/* Job Details */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Job Details</h3>
        <p><span className="font-medium">Description:</span> {application.job.description}</p>
        <p><span className="font-medium">Responsibilities:</span> {application.job.responsibilities}</p>
        <p><span className="font-medium">Requirements:</span> {application.job.requirements}</p>
        <p><span className="font-medium">Benefits:</span> {application.job.benefits}</p>
        <p><span className="font-medium">Work Type:</span> {application.job.work_type}</p>
        <p><span className="font-medium">Industry:</span> {application.job.industry}</p>
        <p><span className="font-medium">Education:</span> {application.job.education}</p>
        <p><span className="font-medium">Seniority:</span> {application.job.seniority}</p>
        <p>
          <span className="font-medium">Salary:</span>{" "}
          {application.job.salary_min} - {application.job.salary_max} {application.job.currency}
        </p>
      </Card>
    </div>
  );
};

export default ViewApplication;
