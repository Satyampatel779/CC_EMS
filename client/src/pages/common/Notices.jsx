import React, { useEffect, useState } from "react";
import axios from "axios";

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readStatus, setReadStatus] = useState({}); // { noticeId: true/false }

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with your actual API base URL and auth token logic
        const res = await axios.get("/api/notice/all/");
        // Combine both department and employee notices
        const allNotices = [
          ...(res.data.data?.department_notices || []),
          ...(res.data.data?.employee_notices || []),
        ];
        setNotices(allNotices);
      } catch (err) {
        setError("Failed to fetch notices");
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const handleMarkRead = (id) => {
    setReadStatus((prev) => ({ ...prev, [id]: true }));
  };

  if (loading) return <div>Loading notices...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Company Notices</h2>
      {notices.length === 0 ? (
        <div>No notices found.</div>
      ) : (
        <ul className="space-y-4">
          {notices.map((notice) => (
            <li
              key={notice._id}
              className={`border rounded p-4 shadow-sm ${readStatus[notice._id] ? "bg-gray-100" : "bg-white"}`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{notice.title}</h3>
                <span className={`text-xs px-2 py-1 rounded ${readStatus[notice._id] ? "bg-green-200 text-green-800" : "bg-blue-200 text-blue-800"}`}>
                  {readStatus[notice._id] ? "Read" : "Unread"}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                {new Date(notice.createdAt || notice.created_at).toLocaleString()}
              </div>
              <div className="mb-2">{notice.content}</div>
              {!readStatus[notice._id] && (
                <button
                  className="text-sm text-blue-600 underline"
                  onClick={() => handleMarkRead(notice._id)}
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notices;
