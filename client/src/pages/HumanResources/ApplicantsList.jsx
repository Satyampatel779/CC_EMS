import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const statusOptions = [
  "Conduct-Interview",
  "Rejected",
  "Pending",
  "Interview Completed",
  "Not Specified"
];

export const ApplicantsList = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `/api/applicant/all`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const data = await res.json();
        if (data.success) {
          setApplicants(data.data);
        } else {
          setError(data.message || "Failed to fetch applicants");
        }
      } catch (err) {
        setError("Error fetching applicants");
      }
      setLoading(false);
    };
    fetchApplicants();
  }, []);

  if (loading) return <div>Loading applicants...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Applicants List</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant) => (
            <tr key={applicant._id}>
              <td className="border px-4 py-2">{applicant.firstname} {applicant.lastname}</td>
              <td className="border px-4 py-2">{applicant.email}</td>
              <td className="border px-4 py-2">{applicant.appliedrole}</td>
              <td className="border px-4 py-2">{applicant.recruitmentstatus}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                  onClick={() => navigate(`/HR/applicants/${applicant._id}`)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};