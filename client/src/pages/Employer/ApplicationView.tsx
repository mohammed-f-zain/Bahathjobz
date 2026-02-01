// src/pages/Employer/ApplicationView.tsx
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams,Link } from "react-router-dom";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Mail, Phone, Calendar, Download, User,ArrowLeft  } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export function ApplicationView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        if (!jobId) {
          toast.error("Missing jobId");
          setLoading(false);
          return;
        }

        // 🔥 fetch all applications for this job
        const response = await api.get(`/applications/employer?jobId=${jobId}`);
        const apps = response.data.applications || [];
        const app = apps.find((a: any) => a.id === id);

        if (!app) {
          toast.error("Application not found");
        }
        setApplication(app || null);
      } catch (error) {
        console.error("Error fetching application", error);
        toast.error("Failed to load application");
      } finally {
        setLoading(false);
      }
    };

    if (id && jobId) fetchApplication();
  }, [id, jobId]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!application) return <p className="p-6">Application not found</p>;

  return (
    <div className="p-6">
       {/* Back to Applications Button */}
        <Link to="/employer/applications/">
        <Button size="sm" className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Applications
        </Button>
      </Link>
      {/* <Link to="/employer/applications/">
        <Button size="sm" variant="outline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Applications
        </Button>
      </Link> */}
      
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {application.first_name} {application.last_name}
            </h1>
            <p className="text-gray-600">Applied for: {application.job_title}</p>
            <p className="text-sm text-gray-500">
              <Calendar className="inline-block h-4 w-4 mr-1" />
              {new Date(application.applied_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-gray-700">
          <p>
            <Mail className="inline-block h-4 w-4 mr-2" />
            {application.email}
          </p>
          <p>
            <Phone className="inline-block h-4 w-4 mr-2" />
            {application.phone || "Not provided"}
          </p>

          {application.cover_note && (
            <div>
              <h2 className="text-lg font-semibold">Cover Note</h2>
              <p className="mt-1">{application.cover_note}</p>
            </div>
          )}

          {application.summary && (
            <div>
              <h2 className="text-lg font-semibold">Summary</h2>
              <p className="mt-1">{application.summary}</p>
            </div>
          )}

         {application.resume_url ? (
            <a
              href={
                application.resume_url.startsWith("http")
                  ? application.resume_url
                  : application.resume_url.startsWith("/")
                  ? `https://api.bahathjobz.com${application.resume_url}`
                  : `https://api.bahathjobz.com/${application.resume_url}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 mt-4"
              >
                <Download className="h-4 w-4" />
                Resume
              </Button>
            </a>
          ) : (
            <Button
              size="sm"
              disabled
              className="bg-gray-300 text-gray-600 cursor-not-allowed flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              No Resume
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}