import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { Loading } from "../../../components/common/loading.jsx";
import { fetchInterviewInsights, updateInterviewInsight } from "../../../redux/Slices/InterviewInsightsSlice";

// Memoized selectors to prevent unnecessary re-renders
const selectInterviewInsightsState = createSelector(
  [(state) => state.interviewInsightsReducer],
  (interviewInsights) => interviewInsights || {
    insights: [],
    loading: false,
    error: null,
    statistics: {
      totalInterviews: 0,
      completedInterviews: 0,
      averageRating: 0,
      topPerformers: [],
    }
  }
);

export const InterviewInsightsPage = () => {
  const dispatch = useDispatch();
  const interviewInsightsState = useSelector(selectInterviewInsightsState);
  const { insights: interviews, loading, error, statistics } = interviewInsightsState;
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [insight, setInsight] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(fetchInterviewInsights());
  }, [dispatch]);

  const handleEditClick = (interview) => {
    setSelectedInterview(interview);
    setInsight(interview.feedback || "");
    setEditDialogOpen(true);
  };
  const handleSaveInsight = async () => {
    if (selectedInterview) {
      try {
        await dispatch(updateInterviewInsight({
          id: selectedInterview._id,
          insightData: { feedback: insight }
        })).unwrap();
        setEditDialogOpen(false);
        setSelectedInterview(null);
        setInsight("");
      } catch (error) {
        console.error("Failed to update insight:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  return (
    <div className="p-6">
      <Box className="mb-6">        <div className="flex items-center gap-3 mb-4">
          <img src="/../../src/assets/HR-Dashboard/interview-insights.png" alt="Interview" className="w-8 h-8" />
          <Typography variant="h4" component="h2" className="font-bold">
            Interview Feedback & Insights
          </Typography>
        </div>
        
        {statistics && (
          <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Paper className="p-4 text-center">
              <Typography variant="h6" color="primary">
                {statistics.totalInterviews || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Interviews
              </Typography>
            </Paper>
            <Paper className="p-4 text-center">
              <Typography variant="h6" color="success.main">
                {statistics.completedInterviews || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </Paper>
            <Paper className="p-4 text-center">
              <Typography variant="h6" color="warning.main">
                {statistics.pendingInterviews || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </Paper>
            <Paper className="p-4 text-center">
              <Typography variant="h6" color="info.main">
                {statistics.averageRating || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Rating
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Candidate</TableCell>
              <TableCell>Interviewer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Feedback</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {interviews.map((interview) => (
              <TableRow key={interview._id}>
                <TableCell>{interview.applicant?.firstname} {interview.applicant?.lastname}</TableCell>
                <TableCell>{interview.interviewer?.firstname} {interview.interviewer?.lastname}</TableCell>
                <TableCell>{interview.interviewdate ? new Date(interview.interviewdate).toLocaleDateString() : "-"}</TableCell>
                <TableCell>
                  <Chip 
                    label={interview.status || 'Unknown'} 
                    color={getStatusColor(interview.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{interview.feedback || <span className="text-gray-400">No feedback</span>}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleEditClick(interview)}>
                    {interview.feedback ? "Edit Insight" : "Add Insight"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedInterview?.feedback ? "Edit Interview Insight" : "Add Interview Insight"}
        </DialogTitle>
        <DialogContent>
          <Box className="mt-2">
            <Typography variant="body2" color="text.secondary" className="mb-2">
              Candidate: {selectedInterview?.applicant?.firstname} {selectedInterview?.applicant?.lastname}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-4">
              Interview Date: {selectedInterview?.interviewdate ? new Date(selectedInterview.interviewdate).toLocaleDateString() : "Not scheduled"}
            </Typography>
          </Box>
          <TextField
            label="Feedback / Insight"
            multiline
            minRows={4}
            value={insight}
            onChange={e => setInsight(e.target.value)}
            fullWidth
            autoFocus
            placeholder="Add your feedback and insights about this interview..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveInsight} variant="contained" disabled={!insight.trim()}>
            Save Insight
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
