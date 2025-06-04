import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const statusOptions = [
  "Conduct-Interview",
  "Rejected",
  "Pending",
  "Interview Completed",
  "Not Specified"
];

export const ApplicantProfile = () => {
  const { applicantId } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicant = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/applicant/${applicantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setApplicant(data.data);
          setStatus(data.data.recruitmentstatus);
        } else {
          setError(data.message || "Failed to fetch applicant");
        }
      } catch (err) {
        setError("Error fetching applicant");
      }
      setLoading(false);
    };
    fetchApplicant();
  }, [applicantId]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    setUpdateMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/applicant/update-applicant`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          applicantID: applicantId,
          UpdatedData: { recruitmentstatus: status }
        })
      });
      const data = await res.json();
      if (data.success) {
        setApplicant(data.data);
        setUpdateMsg("Status updated successfully");
      } else {
        setUpdateMsg(data.message || "Failed to update status");
      }
    } catch (err) {
      setUpdateMsg("Error updating status");
    }
    setUpdating(false);
  };

  if (loading) return <div>Loading applicant...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!applicant) return <div>No applicant found.</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button className="mb-4 text-blue-600" onClick={() => navigate(-1)}>&larr; Back</button>
      <h2 className="text-2xl font-bold mb-2">Applicant Profile</h2>
      <div className="mb-4">
        <div><b>Name:</b> {applicant.firstname} {applicant.lastname}</div>
        <div><b>Email:</b> {applicant.email}</div>
        <div><b>Contact:</b> {applicant.contactnumber}</div>
        <div><b>Applied Role:</b> {applicant.appliedrole}</div>
        <div><b>Status:</b> {applicant.recruitmentstatus}</div>
        <div className="mt-4">
          <label className="mr-2 font-semibold">Update Status:</label>
          <select value={status} onChange={handleStatusChange} className="border px-2 py-1">
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button
            className="ml-2 bg-green-600 text-white px-3 py-1 rounded"
            onClick={handleUpdateStatus}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </div>
        {updateMsg && <div className="mt-2 text-blue-700">{updateMsg}</div>}
      </div>
    </div>
  );
};