import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Users, 
  Filter, 
  Eye, 
  Edit, 
  Grid,
  List,
  FileText,
  Calendar,
  Download
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

export const ApplicantsList = () => {
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchApplicants();
  }, []);

  useEffect(() => {
    filterApplicants();
  }, [applicants, searchTerm, statusFilter]);

  const fetchApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("HRtoken");
      const res = await fetch(`/api/applicant/all`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        setApplicants(data.data || []);
        toast({
          title: "Success",
          description: `Loaded ${data.data?.length || 0} applicants`,
        });
      } else {
        setError(data.message || "Failed to fetch applicants");
        toast({
          title: "Error",
          description: data.message || "Failed to fetch applicants",
          variant: "destructive"
        });
      }
    } catch (err) {
      setError("Error fetching applicants");
      toast({
        title: "Error",
        description: "Error fetching applicants",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const filterApplicants = () => {
    let filtered = applicants;

    if (searchTerm) {
      filtered = filtered.filter(applicant =>
        applicant.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(applicant => 
        applicant.recruitmentstatus === statusFilter
      );
    }

    setFilteredApplicants(filtered);
  };

  const handleViewApplicant = (applicant) => {
    setSelectedApplicant(applicant);
    setIsViewDialogOpen(true);
  };

  const handleEditApplicant = (applicantId) => {
    navigate(`/HR/dashboard/applicant/${applicantId}`);
  };

  const exportToCSV = () => {
    const csvData = filteredApplicants.map(applicant => ({
      Name: `${applicant.fname} ${applicant.lname}`,
      Email: applicant.email,
      Phone: applicant.phone,
      Position: applicant.position || 'N/A',
      Status: applicant.recruitmentstatus,
      'Applied Date': new Date(applicant.createdAt).toLocaleDateString()
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'applicants-list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applicants...</p>
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
            <Button onClick={fetchApplicants} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Applicants Management
            </h1>
            <p className="text-gray-600">Manage and review job applicants</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Applicants</p>
                  <p className="text-2xl font-bold text-gray-900">{applicants.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applicants.filter(a => a.recruitmentstatus === "Pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applicants.filter(a => a.recruitmentstatus === "Conduct-Interview").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applicants.filter(a => a.recruitmentstatus === "Interview Completed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="mb-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search applicants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="gap-2"
              >
                <List className="w-4 h-4" />
                Table
              </Button>
              
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-2"
              >
                <Grid className="w-4 h-4" />
                Grid
              </Button>

              <Button
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Applicants ({filteredApplicants.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredApplicants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No applicants found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "No applicants have been added yet"}
              </p>
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplicants.map((applicant) => (
                    <TableRow key={applicant._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {applicant.fname || applicant.firstname} {applicant.lname || applicant.lastname}
                      </TableCell>
                      <TableCell>{applicant.email}</TableCell>
                      <TableCell>{applicant.phone}</TableCell>
                      <TableCell>{applicant.position || applicant.appliedrole || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[applicant.recruitmentstatus] || statusColors["Not Specified"]} border`}>
                          {applicant.recruitmentstatus || "Not Specified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(applicant.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewApplicant(applicant)}
                            className="gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEditApplicant(applicant._id)}
                            className="gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApplicants.map((applicant) => (
                <Card key={applicant._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {applicant.fname || applicant.firstname} {applicant.lname || applicant.lastname}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{applicant.email}</p>
                      </div>
                      <Badge className={`${statusColors[applicant.recruitmentstatus] || statusColors["Not Specified"]} border`}>
                        {applicant.recruitmentstatus || "Not Specified"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm"><span className="font-medium">Phone:</span> {applicant.phone}</p>
                      <p className="text-sm"><span className="font-medium">Position:</span> {applicant.position || applicant.appliedrole || 'N/A'}</p>
                      <p className="text-sm"><span className="font-medium">Applied:</span> {new Date(applicant.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewApplicant(applicant)}
                        className="flex-1 gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditApplicant(applicant._id)}
                        className="flex-1 gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Applicant Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedApplicant && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-gray-900">{selectedApplicant.fname || selectedApplicant.firstname} {selectedApplicant.lname || selectedApplicant.lastname}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedApplicant.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedApplicant.phone}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Position</label>
                    <p className="text-gray-900">{selectedApplicant.position || selectedApplicant.appliedrole || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Badge className={`${statusColors[selectedApplicant.recruitmentstatus] || statusColors["Not Specified"]} border`}>
                      {selectedApplicant.recruitmentstatus || "Not Specified"}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Applied Date</label>
                    <p className="text-gray-900">{new Date(selectedApplicant.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {selectedApplicant.resume && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Resume</label>
                  <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600">Resume file available</p>
                    <Button size="sm" variant="outline" className="mt-2 gap-2">
                      <Download className="w-4 h-4" />
                      Download Resume
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEditApplicant(selectedApplicant._id);
                  }}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Applicant
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};