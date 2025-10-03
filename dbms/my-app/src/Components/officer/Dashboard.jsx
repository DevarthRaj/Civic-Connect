import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { officerService } from "../../services/officerService";

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    highPriority: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await officerService.getComplaintStats();
        setStats({
          total: statsData.total,
          pending: statsData.pending,
          in_progress: statsData.in_progress,
          resolved: statsData.resolved,
          highPriority: statsData.high_priority
        });
      } catch (error) {
        console.error("Error fetching complaint stats:", error);
      }
    };

    fetchStats();
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
            <Typography variant="h6">In Progress</Typography>
            <Typography variant="h4" color="blue">
              {stats.in_progress}
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
