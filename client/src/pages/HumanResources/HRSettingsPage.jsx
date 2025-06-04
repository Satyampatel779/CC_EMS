import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HandleGetHRDepartments, HandlePostHRDepartments } from "../../redux/Thunks/HRDepartmentPageThunk";
import { apiService } from "../../redux/apis/apiService";

export const HRSettingsPage = () => {
  // Company Info State
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    description: "",
    OrganizationURL: "",
    OrganizationMail: "",
    policies: ""
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const dispatch = useDispatch();
  const departments = useSelector((state) => state.HRDepartmentPageReducer.data || []);

  // Fetch organization info on mount
  useEffect(() => {
    setLoading(true);
    apiService.get("/api/v1/organization/info", { withCredentials: true })
      .then(res => {
        if (res.data.success && res.data.data) {
          setCompanyInfo({ ...res.data.data });
        }
      })
      .catch(() => setErrorMsg("Failed to load organization info"))
      .finally(() => setLoading(false));
    dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }));
  }, [dispatch]);

  // Handle company info form changes
  const handleChange = (e) => {
    setCompanyInfo({ ...companyInfo, [e.target.name]: e.target.value });
  };
  // Submit company info update
  const handleCompanyInfoSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    apiService.put("/api/v1/organization/update", companyInfo, { withCredentials: true })
      .then(res => {
        if (res.data.success) setSuccessMsg("Company info updated successfully");
        else setErrorMsg(res.data.message || "Update failed");
      })
      .catch(() => setErrorMsg("Failed to update company info"))
      .finally(() => setLoading(false));
  };

  // Handle new department creation
  const [newDept, setNewDept] = useState({ name: "", description: "" });
  const handleDeptChange = (e) => setNewDept({ ...newDept, [e.target.name]: e.target.value });
  const handleDeptSubmit = (e) => {
    e.preventDefault();
    dispatch(HandlePostHRDepartments({ apiroute: "CREATE", data: newDept }));
    setNewDept({ name: "", description: "" });
  };
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <img src="/../../src/assets/HR-Dashboard/settings.png" alt="Settings" className="w-8 h-8" />
        <h2 className="text-2xl font-bold">Organization Settings</h2>
      </div>
      <form onSubmit={handleCompanyInfoSubmit} className="space-y-4 bg-white p-4 rounded shadow mb-8">
        <h3 className="font-semibold text-lg mb-2">Company Info</h3>
        <Input name="name" value={companyInfo.name} onChange={handleChange} placeholder="Company Name" required />
        <Textarea name="description" value={companyInfo.description} onChange={handleChange} placeholder="Description" required />
        <Input name="OrganizationURL" value={companyInfo.OrganizationURL} onChange={handleChange} placeholder="Company URL" required />
        <Input name="OrganizationMail" value={companyInfo.OrganizationMail} onChange={handleChange} placeholder="Company Email" required />
        <Textarea name="policies" value={companyInfo.policies || ""} onChange={handleChange} placeholder="Company Policies (optional)" />
        <Button type="submit" disabled={loading}>Update Company Info</Button>
        {successMsg && <div className="text-green-600">{successMsg}</div>}
        {errorMsg && <div className="text-red-600">{errorMsg}</div>}
      </form>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="font-semibold text-lg mb-2">Departments</h3>
        <form onSubmit={handleDeptSubmit} className="flex gap-2 mb-4">
          <Input name="name" value={newDept.name} onChange={handleDeptChange} placeholder="Department Name" required />
          <Input name="description" value={newDept.description} onChange={handleDeptChange} placeholder="Description" required />
          <Button type="submit">Add</Button>
        </form>
        <ul className="list-disc pl-5">
          {departments.map((dept) => (
            <li key={dept._id} className="mb-1">{dept.name} - {dept.description}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
