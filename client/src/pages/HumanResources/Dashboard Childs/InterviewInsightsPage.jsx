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
  };  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-red-600 dark:text-red-400 bg-white dark:bg-neutral-900">{error}</div>;
  return (
    <div className="p-6 bg-white dark:bg-neutral-900 min-h-full">
      <Box className="mb-6">        <div className="flex items-center gap-3 mb-4">
          <img src="/../../src/assets/HR-Dashboard/interview-insights.png" alt="Interview" className="w-8 h-8 dark:brightness-0 dark:invert" />
          <Typography variant="h4" component="h2" className="font-bold text-gray-900 dark:text-neutral-100">
            Interview Feedback & Insights
          </Typography>
        </div>
        
        {statistics && (          <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Paper className="p-4 text-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
              <Typography variant="h6" color="primary" className="text-blue-600 dark:text-blue-400">
                {statistics.totalInterviews || 0}
              </Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-neutral-400">
                Total Interviews
              </Typography>
            </Paper>
            <Paper className="p-4 text-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
              <Typography variant="h6" className="text-green-600 dark:text-green-400">
                {statistics.completedInterviews || 0}
              </Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-neutral-400">
                Completed
              </Typography>
            </Paper>
            <Paper className="p-4 text-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
              <Typography variant="h6" className="text-yellow-600 dark:text-yellow-400">
                {statistics.pendingInterviews || 0}
              </Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-neutral-400">
                Pending
              </Typography>
            </Paper>
            <Paper className="p-4 text-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
              <Typography variant="h6" className="text-cyan-600 dark:text-cyan-400">
                {statistics.averageRating || 0}
              </Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-neutral-400">
                Avg Rating
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>      <TableContainer component={Paper} className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-50 dark:bg-neutral-700">
              <TableCell className="text-gray-900 dark:text-neutral-100 font-medium">Candidate</TableCell>
              <TableCell className="text-gray-900 dark:text-neutral-100 font-medium">Interviewer</TableCell>
              <TableCell className="text-gray-900 dark:text-neutral-100 font-medium">Date</TableCell>
              <TableCell className="text-gray-900 dark:text-neutral-100 font-medium">Status</TableCell>
              <TableCell className="text-gray-900 dark:text-neutral-100 font-medium">Feedback</TableCell>
              <TableCell className="text-gray-900 dark:text-neutral-100 font-medium">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {interviews.map((interview) => (
              <TableRow key={interview._id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 border-gray-200 dark:border-neutral-600">
                <TableCell className="text-gray-800 dark:text-neutral-200">{interview.applicant?.firstname} {interview.applicant?.lastname}</TableCell>
                <TableCell className="text-gray-800 dark:text-neutral-200">{interview.interviewer?.firstname} {interview.interviewer?.lastname}</TableCell>
                <TableCell className="text-gray-800 dark:text-neutral-200">{interview.interviewdate ? new Date(interview.interviewdate).toLocaleDateString() : "-"}</TableCell>
                <TableCell>
                  <Chip 
                    label={interview.status || 'Unknown'} 
                    color={getStatusColor(interview.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell className="text-gray-800 dark:text-neutral-200">{interview.feedback || <span className="text-gray-400 dark:text-neutral-500">No feedback</span>}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleEditClick(interview)} className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                    {interview.feedback ? "Edit Insight" : "Add Insight"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer><Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
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
