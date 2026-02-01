// src/pages/ContactView.tsx
import React from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Card } from "../../components/UI/Card";
import {
  Mail,
  Phone,
  Calendar,
  User,
  GraduationCap,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import { Button } from "../../components/UI/Button";

export function ContactView() {
  const { id } = useParams();
  const location = useLocation();
  const candidate = (location.state as any)?.candidate;

  if (!candidate) {
    return <p className="p-6 text-gray-600">❌ Candidate not found</p>;
  }
  function isCurrentlyWorking(value: any) {
  return value === true || value === "true" || value === 1;
}

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Link to="/employer/cv-search">
        <Button
          size="sm"
          className="inline-flex items-center font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 px-3 py-1.5 text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to CV Search
        </Button>
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <Card className="p-6 md:col-span-1 flex flex-col items-center text-center shadow-lg">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-200 mb-4 bg-gray-50 ">
            {candidate.avatar ? (
              <img
                src={candidate.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-gray-400 m-auto" />
            )}
          </div>

          <h1 className="text-xl font-bold capitalize">
            {candidate.firstName || "New"} {candidate.lastName || "User"}
          </h1>
          <p className="text-gray-600">{candidate.location || "Location N/A"}</p>
          <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            {candidate.createdAt
              ? new Date(candidate.createdAt).toLocaleDateString()
              : "Date not available"}
          </p>
          
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card className="p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <p className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {candidate.email || "Not provided"}
              </p>
              <p className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {candidate.phone || "Not provided"}
              </p>
            </div>
          </Card>

          {/* Education & Experience */}
          {(candidate.education || candidate.experience) && (
            <Card className="p-6 shadow-md">
              <h2 className="text-lg font-semibold mb-4">Background</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {candidate.education && (
                  <p className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    {candidate.education}
                  </p>
                )}
                {candidate.experience && (
                  <p className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {candidate.experience}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Summary */}
          {candidate.summary && (
            <Card className="p-6 shadow-md">
              <h2 className="text-lg font-semibold mb-2">Summary</h2>
              <div
                className="text-gray-600 leading-relaxed prose max-w-none"
                dangerouslySetInnerHTML={{ __html: candidate.summary }}
              />
            </Card>
          )}

        {/* Career History */}
        {candidate.careerHistory?.length > 0 && (
          <Card className="p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4">Career History</h2>
            <div className="flex flex-wrap gap-6">
              {candidate.careerHistory.map((job: any, index: number) => (
                <div
                  key={index}
                  className="flex-1 min-w-[200px] border p-4 rounded-lg shadow-sm bg-white"
                >
                  <p>
                    <span className="font-semibold">Company Name:</span> {job.company || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Work Type:</span> {job.title || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Position:</span> {job.position || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Location:</span> {job.location || "N/A"}
                  </p>
                  <p>
                    {job.from_date
                      ? new Date(job.from_date).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })
                      : "Start N/A"}{" "}
                    -{" "}
                    {job.currentlyWorking
                      ? "Present"
                      : job.to_date
                      ? new Date(job.to_date).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })
                      : "Present"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}


          {/* Skills */}
{candidate.skills && candidate.skills.length > 0 && (
  <Card className="p-6 shadow-md">
    <h2 className="text-lg font-semibold mb-2">Skills</h2>
    <div className="flex flex-wrap gap-2">
      {(Array.isArray(candidate.skills)
        ? candidate.skills
        : (candidate.skills || "").split(",")
      ).map((skill: string, i: number) => (
        <span
          key={i}
          className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 text-sm rounded-full font-medium shadow-sm hover:scale-105 transition"
        >
          {skill.trim()}
        </span>
      ))}
    </div>
  </Card>
)}
        </div>
      </div>
    </div>
  );
}

export default ContactView;
