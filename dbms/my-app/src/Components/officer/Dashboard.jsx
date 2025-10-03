import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Button
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  HourglassEmpty as InProgressIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAllComplaints } from "../../services/complaintService";


const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    pending: 0,
    highPriority: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const complaints = await getAllComplaints();

        const total = complaints.length;
        const inProgress = complaints.filter(c => c.status === "In Progress").length;
        const resolved = complaints.filter(c => c.status === "Resolved").length;
        const pending = complaints.filter(c => c.status === "Pending").length;
        const highPriority = complaints.filter(c => c.priority === "High").length;

        setStats({ total, inProgress, resolved, pending, highPriority });
        setRecentComplaints(complaints.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching officer dashboard:", err);
        setError("Failed to load officer dashboard data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const statCards = [
    { title: "Total Complaints", value: stats.total, icon: <AssignmentIcon fontSize="large" />, color: "#1976d2" },
    { title: "In Progress", value: stats.inProgress, icon: <InProgressIcon fontSize="large" />, color: "#ff9800" },
    { title: "Resolved", value: stats.resolved, icon: <CheckCircleIcon fontSize="large" />, color: "#4caf50" },
    { title: "Pending", value: stats.pending, icon: <PendingIcon fontSize="large" />, color: "#f57c00" },
    { title: "High Priority", value: stats.highPriority, icon: <WarningIcon fontSize="large" />, color: "#d32f2f" },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Officer Dashboard
      </Typography>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                "&:hover": { transform: "translateY(-5px)", transition: "0.3s" },
              }}
            >
              <Box
                sx={{
                  backgroundColor: `${stat.color}22`,
                  borderRadius: "50%",
                  width: 60,
                  height: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stat.title}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Complaints */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Complaints</Typography>
              <Button size="small" onClick={() => navigate("/officer/complaints")}>
                View All
              </Button>
            </Box>
            {recentComplaints.length > 0 ? (
              recentComplaints.map((c, i) => (
                <Box key={c.id} sx={{ py: 1.5 }}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle2">#{c.id} - {c.category}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(c.dateCreated).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" noWrap>{c.description}</Typography>
                  {i < recentComplaints.length - 1 && <Divider sx={{ mt: 1 }} />}
                </Box>
              ))
            ) : (
              <Typography color="textSecondary">No complaints found</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
