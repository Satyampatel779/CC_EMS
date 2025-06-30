import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar,
  Download,
  Save,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusOptions = [
  "Conduct-Interview",
  "Rejected",
  "Pending", 
  "Interview Completed",
  "Not Specified"
];

const statusColors = {
  "Conduct-Interview": "bg-blue-100 text-blue-800 border-blue-200",
  "Rejected": "bg-red-100 text-red-800 border-red-200",
  "Pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Interview Completed": "bg-green-100 text-green-800 border-green-200",
  "Not Specified": "bg-gray-100 text-gray-800 border-gray-200"
};

export const ApplicantProfile = () => {
  const { applicantId } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchApplicant();
  }, [applicantId]);

  const fetchApplicant = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("HRtoken");
      const res = await fetch(`/api/applicant/${applicantId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        setApplicant(data.data);
        setStatus(data.data.recruitmentstatus || "Not Specified");
        toast({
          title: "Success",
          description: "Applicant data loaded successfully",
        });
      } else {
        setError(data.message || "Failed to fetch applicant");
        toast({
          title: "Error",
          description: data.message || "Failed to fetch applicant",
          variant: "destructive"
        });
      }
    } catch (err) {
      setError("Error fetching applicant");
      toast({
        title: "Error",
        description: "Error fetching applicant",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    setUpdateMsg("");
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("HRtoken");
      const res = await fetch(`/api/applicant/update/${applicantId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ recruitmentstatus: status })
      });
      const data = await res.json();
      if (data.success) {
        setUpdateMsg("Status updated successfully!");
        setApplicant(prev => ({ ...prev, recruitmentstatus: status }));
        toast({
          title: "Success",
          description: "Status updated successfully!",
        });
      } else {
        setUpdateMsg(data.message || "Failed to update status");
        toast({
          title: "Error",
          description: data.message || "Failed to update status",
          variant: "destructive"
        });
      }
    } catch (err) {
      setUpdateMsg("Error updating status");
      toast({
        title: "Error",
        description: "Error updating status",
        variant: "destructive"
      });
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applicant...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
        <Card className="max-w-md mx-auto mt-20">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={fetchApplicant} className="flex-1">
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/HR/dashboard/recruitment")}
                className="flex-1"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/HR/dashboard/recruitment")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applicants
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Applicant Profile
            </h1>
            <p className="text-gray-600">View and manage applicant information</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <Badge className={`${statusColors[applicant.recruitmentstatus] || statusColors["Not Specified"]} border`}>
                  {applicant.recruitmentstatus || "Not Specified"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Full Name</label>
                      <p className="text-gray-900 font-medium">
                        {applicant.fname || applicant.firstname} {applicant.lname || applicant.lastname}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{applicant.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{applicant.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                    <Briefcase className="w-5 h-5 text-gray-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Applied Position</label>
                      <p className="text-gray-900">{applicant.position || applicant.appliedrole || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Application Date</label>
                      <p className="text-gray-900">{new Date(applicant.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {applicant.department && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                      <Briefcase className="w-5 h-5 text-gray-600" />
                      <div>
                        <label className="text-sm font-medium text-gray-700">Department</label>
                        <p className="text-gray-900">{applicant.department}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {(applicant.experience || applicant.skills || applicant.education) && (
                <div className="mt-6 p-4 rounded-lg bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-3">Additional Information</h3>
                  <div className="space-y-2">
                    {applicant.experience && (
                      <p className="text-sm"><span className="font-medium">Experience:</span> {applicant.experience}</p>
                    )}
                    {applicant.skills && (
                      <p className="text-sm"><span className="font-medium">Skills:</span> {applicant.skills}</p>
                    )}
                    {applicant.education && (
                      <p className="text-sm"><span className="font-medium">Education:</span> {applicant.education}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Resume Section */}
              {applicant.resume && (
                <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-blue-900">Resume Available</h3>
                        <p className="text-sm text-blue-700">Click to download applicant's resume</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Management Sidebar */}
        <div>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Status Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Recruitment Status
                </label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleUpdateStatus}
                disabled={updating || status === applicant.recruitmentstatus}
                className="w-full gap-2"
              >
                {updating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {updating ? "Updating..." : "Update Status"}
              </Button>

              {updateMsg && (
                <div className={`p-3 rounded-lg text-sm ${
                  updateMsg.includes("successfully") 
                    ? "bg-green-100 text-green-800 border border-green-200" 
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}>
                  {updateMsg}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2">
                <Mail className="w-4 h-4" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Interview
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <FileText className="w-4 h-4" />
                Add Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
