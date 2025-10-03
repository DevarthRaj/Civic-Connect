import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAllComplaints } from "../../services/complaintService";

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    highPriority: 0,
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const complaints = await getAllComplaints();

        const total = complaints.length;
        const pending = complaints.filter(c => c.status === "pending").length;
        const resolved = complaints.filter(c => c.status === "resolved").length;
        const highPriority = complaints.filter(c => c.priority === "High").length;

        setStats({ total, pending, resolved, highPriority });
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Officer Dashboard
      </Typography>

      {/* Stats Section */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">Total Complaints</Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">Pending</Typography>
            <Typography variant="h4" color="orange">
              {stats.pending}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">Resolved</Typography>
            <Typography variant="h4" color="green">
              {stats.resolved}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">High Priority</Typography>
            <Typography variant="h4" color="red">
              {stats.highPriority}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/officer/complaints")}
        >
          View Complaints
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/officer/reports")}
        >
          View Department Reports
        </Button>
      </Box>
    </Box>
  );
};

export default OfficerDashboard;
