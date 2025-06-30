import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { HandleGetHRDepartments, HandlePostHRDepartments } from "../../redux/Thunks/HRDepartmentPageThunk";
import { apiService } from "../../redux/apis/apiService";
import { 
  Settings, 
  Building2, 
  Globe, 
  Mail, 
  FileText, 
  Save, 
  Plus, 
  Edit, 
  Trash2,
  Users,
  Shield,
  Database,
  Palette,
  Bell,
  Lock
} from "lucide-react";

export const HRSettingsPage = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const departments = useSelector((state) => state.HRDepartmentPageReducer.data || []);

  // Company Info State
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    description: "",
    OrganizationURL: "",
    OrganizationMail: "",
    policies: ""
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("company");

  // Fetch organization info on mount
  useEffect(() => {
    setLoading(true);
    apiService.get("/api/v1/organization/info", { withCredentials: true })
      .then(res => {
        if (res.data.success && res.data.data) {
          setCompanyInfo({ ...res.data.data });
        }
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load organization info"
        });
      })
      .finally(() => setLoading(false));
    dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }));
  }, [dispatch, toast]);

  // Handle company info form changes
  const handleChange = (e) => {
    setCompanyInfo({ ...companyInfo, [e.target.name]: e.target.value });
  };

  // Submit company info update
  const handleCompanyInfoSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    apiService.put("/api/v1/organization/update", companyInfo, { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          toast({
            title: "Success",
            description: "Company info updated successfully"
          });
        }
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update company info"
        });
      })
      .finally(() => setLoading(false));
  };

  const settingsTabs = [
    { id: "company", label: "Company Info", icon: Building2 },
    { id: "departments", label: "Departments", icon: Users },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "system", label: "System", icon: Database }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Settings & Configuration
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Manage your organization settings and preferences
            </p>
          </div>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-2 border border-white/20 dark:border-slate-700/30 shadow-xl">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {/* Company Info Tab */}
        {activeTab === "company" && (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Building2 className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanyInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Name</label>
                    <Input
                      name="name"
                      value={companyInfo.name}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      className="bg-white/50 dark:bg-slate-700/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Email</label>
                    <Input
                      name="OrganizationMail"
                      value={companyInfo.OrganizationMail}
                      onChange={handleChange}
                      placeholder="company@example.com"
                      className="bg-white/50 dark:bg-slate-700/50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Website</label>
                  <Input
                    name="OrganizationURL"
                    value={companyInfo.OrganizationURL}
                    onChange={handleChange}
                    placeholder="https://company.com"
                    className="bg-white/50 dark:bg-slate-700/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Description</label>
                  <Textarea
                    name="description"
                    value={companyInfo.description}
                    onChange={handleChange}
                    placeholder="Describe your company"
                    className="bg-white/50 dark:bg-slate-700/50 min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Policies</label>
                  <Textarea
                    name="policies"
                    value={companyInfo.policies}
                    onChange={handleChange}
                    placeholder="Enter company policies and guidelines"
                    className="bg-white/50 dark:bg-slate-700/50 min-h-[120px]"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Departments Tab */}
        {activeTab === "departments" && (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Users className="w-5 h-5" />
                  Department Management
                </div>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Department
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {departments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{dept.name || dept.departmentname}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{dept.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{dept.employees?.length || 0} employees</Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other tabs - placeholder content */}
        {activeTab !== "company" && activeTab !== "departments" && (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">
                {settingsTabs.find(tab => tab.id === activeTab)?.label} Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">
                  <FileText className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  Coming Soon
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {settingsTabs.find(tab => tab.id === activeTab)?.label} settings will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
