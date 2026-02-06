// src/pages/JobSeeker/Applications.tsx
import React, { useState, useEffect } from "react";
import api from "../../utils/api"; 
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Select } from "../../components/UI/Select";
import { Link } from "react-router-dom";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Briefcase,
  MapPin,
  DollarSign,
  Building2,  
} from "lucide-react";

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'applied', label: 'Applied' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hired', label: 'Hired' },
];

export default function Applications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/applications/my-applications");
        setApplications(res.data.applications || []);
      } catch (error) {
        console.error("❌ Failed to fetch applications:", error);
      }
    };
    fetchApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      responded: "bg-green-100 text-green-800",
      hired: "bg-green-200 text-green-900",
      rejected: "bg-red-100 text-red-800",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job_location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ✅ Export PDF only
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("My Job Applications Report", 14, 10);

    const tableData = filteredApplications.map((app) => [
      app.job_title,
      app.company_name,
      app.job_location,
      app.status,
      new Date(app.applied_at).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [["Job Title", "Company", "Location", "Status", "Applied On"]],
      body: tableData,
    });

    doc.save("applications_report.pdf");
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            My Applications
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Track your job applications and statuses</p>
        </div>
        <Button variant="blue" onClick={exportPDF} className="w-full sm:w-auto">
          <Briefcase className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {applications.length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Total</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">
              {applications.filter((a) => a.status === "pending").length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Pending</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {applications.filter((a) => a.status === "in_progress").length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">In Progress</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {applications.filter((a) => a.status === "hired").length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Hired</p>
          </div>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {applications.filter((a) => a.status === "rejected").length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status"
          />         
        </div>
      </Card>

      {/* Applications List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredApplications.map((app) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{app.job_title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{app.company_name}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 sm:py-1 text-xs rounded-full flex-shrink-0 lg:hidden ${getStatusBadge(app.status)}`}
                    >
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-2">
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                      <span className="truncate max-w-[120px] sm:max-w-none">{app.job_location}</span>
                    </span>
                    {app.job && (
                      <span className="flex items-center">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        {app.job.salary_min} - {app.job.salary_max}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                      {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 lg:flex-col lg:items-end">
                <span
                  className={`px-2 py-1 text-xs rounded-full hidden lg:inline-block ${getStatusBadge(app.status)}`}
                >
                  {app.status.toUpperCase()}
                </span>
                <Link to={`/applications/${app.id}`} target="_blank">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                    <Eye className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </Link>
                {app.status === "pending" && (
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                    <Clock className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Waiting</span>
                  </Button>
                )}
                {app.status === "hired" && (
                  <Button variant="ghost" size="sm" className="text-green-600 text-xs sm:text-sm">
                    <CheckCircle className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Hired</span>
                  </Button>
                )}
                {app.status === "rejected" && (
                  <Button variant="ghost" size="sm" className="text-red-600 text-xs sm:text-sm">
                    <AlertCircle className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Rejected</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <Card className="text-center py-8 sm:py-12">
          <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            No applications found
          </h3>
          <p className="text-sm text-gray-600">
            {applications.length === 0
              ? "You have not applied to any jobs yet"
              : "Try adjusting your search or filters"}
          </p>
        </Card>
      )}
    </div>
  );
}
