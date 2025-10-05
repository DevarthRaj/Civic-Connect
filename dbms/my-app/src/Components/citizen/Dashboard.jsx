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
  Alert,
  Avatar,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Assignment as ComplaintIcon,
  HourglassEmpty as InProgressIcon,
  CheckCircle as ResolvedIcon,
  Add as AddIcon,
  List as ListIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { getUserDashboardStats } from "../../services/citizenService"; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    pending: 0,
    rejected: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await getUserDashboardStats();
        
        setStats(dashboardData.stats);
        setRecentComplaints(dashboardData.recentComplaints);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon, color, gradient }) => (
    <Card elevation={4} sx={{ 
      height: '100%', 
      background: gradient,
      color: 'white',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-4px)' }
    }}>
      <CardContent sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ opacity: 0.9, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            width: 64, 
            height: 64 
          }}>
            {icon}
          </Avatar>
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

  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  const getProgressPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.resolved / stats.total) * 100);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
          Citizen Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
          Welcome back, {user.name || 'Citizen'}! Track your complaints and civic engagement.
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Complaints"
            value={stats.total}
            icon={<ComplaintIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<TrendingUpIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={<ResolvedIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<ScheduleIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
        </Grid>
      </Grid>

      {/* Progress Section */}
      <Card elevation={3} sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <TrendingUpIcon sx={{ mr: 1, color: '#1976d2' }} />
          Resolution Progress
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={getProgressPercentage()} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
                }
              }} 
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {getProgressPercentage()}%
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {stats.resolved} out of {stats.total} complaints resolved
        </Typography>
      </Card>

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <PersonIcon sx={{ mr: 1, color: '#1976d2' }} />
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card 
            elevation={3} 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)' 
              }
            }}
            onClick={() => navigate('/file-complaint')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ 
                mx: 'auto', 
                mb: 2, 
                width: 64, 
                height: 64,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}>
                <AddIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                File New Complaint
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Report a new issue or concern to the authorities
              </Typography>
              <Button variant="contained" fullWidth>
                File Complaint
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card 
            elevation={3} 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)' 
              }
            }}
            onClick={() => navigate('/my-complaints')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ 
                mx: 'auto', 
                mb: 2, 
                width: 64, 
                height: 64,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              }}>
                <ListIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                My Complaints
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Check the status of your submitted complaints
              </Typography>
              <Button variant="contained" fullWidth>
                View Complaints
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Complaints */}
      <Card elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <ComplaintIcon sx={{ mr: 1, color: '#1976d2' }} />
            Recent Complaints
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/my-complaints')}
            size="small"
          >
            View All
          </Button>
        </Box>

        {recentComplaints.length > 0 ? (
          <Box>
            {recentComplaints.map((complaint, index) => (
              <React.Fragment key={complaint.complaint_id}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      backgroundColor: '#f5f5f5',
                      transform: 'translateX(4px)'
                    }
                  }}
                  onClick={() => navigate(`/complaint/${complaint.complaint_id}`)}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Chip 
                          label={complaint.categories?.category_name || 'N/A'}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {complaint.description?.length > 100 
                          ? `${complaint.description.substring(0, 100)}...` 
                          : complaint.description}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 2 }}>
                      <Chip 
                        label={complaint.status}
                        size="small"
                        color={
                          complaint.status === 'Resolved' ? 'success' :
                          complaint.status === 'In Progress' ? 'info' :
                          complaint.status === 'Rejected' ? 'error' : 'warning'
                        }
                        variant="filled"
                      />
                    </Box>
                  </Box>
                </Box>
                {index < recentComplaints.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ErrorIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Complaints Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You haven't filed any complaints yet. Start by reporting an issue.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/file-complaint')}
              startIcon={<AddIcon />}
            >
              File Your First Complaint
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default Dashboard;
