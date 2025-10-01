import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Paper,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Assignment as ComplaintIcon,
  HourglassEmpty as InProgressIcon,
  CheckCircle as ResolvedIcon,
  Add as AddIcon,
  List as ListIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

// Mock data - in a real app, this would come from an API
const mockComplaints = [
  { id: 1, category: 'Garbage Collection', status: 'In Progress', date: '2023-10-15', description: 'Garbage not collected for 3 days' },
  { id: 2, category: 'Road Repair', status: 'Resolved', date: '2023-10-10', description: 'Pothole on Main Street' },
  { id: 3, category: 'Water Supply', status: 'Pending', date: '2023-10-05', description: 'Low water pressure' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    pending: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        // In a real app, this would be an actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Calculate stats
        const total = mockComplaints.length;
        const inProgress = mockComplaints.filter(c => c.status === 'In Progress').length;
        const resolved = mockComplaints.filter(c => c.status === 'Resolved').length;
        const pending = mockComplaints.filter(c => c.status === 'Pending').length;
        
        setStats({ total, inProgress, resolved, pending });
        setRecentComplaints(mockComplaints.slice(0, 3));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', borderLeft: `4px solid ${color}`, boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const QuickAction = ({ icon, title, description, buttonText, onClick, color = 'primary' }) => (
    <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            color: `${color}.contrastText`,
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1, mb: 2 }}>
        {description}
      </Typography>
      <Box sx={{ mt: 'auto' }}>
        <Button
          variant="contained"
          color={color}
          startIcon={buttonText === 'File Complaint' ? <AddIcon /> : <ListIcon />}
          onClick={onClick}
          fullWidth
        >
          {buttonText}
        </Button>
      </Box>
    </Paper>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Welcome back! Here's an overview of your complaints and quick actions.
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Complaints"
              value={stats.total}
              icon={<ComplaintIcon />}
              color="#3f51b5"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              icon={<InProgressIcon />}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Resolved"
              value={stats.resolved}
              icon={<ResolvedIcon />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending"
              value={stats.pending}
              icon={<InProgressIcon />}
              color="#f44336"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <QuickAction
            icon={<AddIcon />}
            title="File a New Complaint"
            description="Report a new issue or concern to the authorities."
            buttonText="File Complaint"
            onClick={() => navigate('/file-complaint')}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <QuickAction
            icon={<ListIcon />}
            title="View My Complaints"
            description="Check the status of your submitted complaints."
            buttonText="View Complaints"
            onClick={() => navigate('/my-complaints')}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Recent Complaints */}
      <Box sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Recent Complaints</Typography>
          <Button 
            color="primary" 
            onClick={() => navigate('/my-complaints')}
            size="small"
          >
            View All
          </Button>
        </Box>
        
        {recentComplaints.length > 0 ? (
          <Paper elevation={2}>
            {recentComplaints.map((complaint, index) => (
              <React.Fragment key={complaint.id}>
                <Box 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                  onClick={() => navigate(`/complaint/${complaint.id}`)}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {complaint.category}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {complaint.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(complaint.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Box
                      component="span"
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 'medium',
                        backgroundColor: 
                          complaint.status === 'Resolved' 
                            ? 'success.light' 
                            : complaint.status === 'In Progress'
                            ? 'warning.light'
                            : 'info.light',
                        color: 
                          complaint.status === 'Resolved' 
                            ? 'success.dark' 
                            : complaint.status === 'In Progress'
                            ? 'warning.dark'
                            : 'info.dark',
                      }}
                    >
                      {complaint.status}
                    </Box>
                  </Box>
                </Box>
                {index < recentComplaints.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Paper>
        ) : (
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ color: 'text.secondary', mb: 1 }}>
              <ErrorIcon fontSize="large" />
            </Box>
            <Typography color="textSecondary">
              You haven't filed any complaints yet.
            </Typography>
            <Button 
              variant="text" 
              color="primary" 
              onClick={() => navigate('/file-complaint')}
              sx={{ mt: 1 }}
            >
              File your first complaint
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
