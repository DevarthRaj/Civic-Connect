import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Button, Grid, Paper, Dialog, DialogTitle, 
  DialogContent, DialogActions, FormControl, InputLabel, 
  Select, MenuItem, Alert, Snackbar, Card, CardContent,
  Chip, Avatar, Divider, LinearProgress
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { officerService } from "../../services/officerService";

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  // Get user_id from different possible locations
  const userId = user.user_id || user.id || user.userId;
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    highPriority: 0,
  });
  const [departments, setDepartments] = useState([]);
  const [currentDepartment, setCurrentDepartment] = useState('None');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('User object:', user);
        console.log('User ID:', userId);
        
        // Fetch data individually to better handle errors
        let statsData, categoriesData, department;
        
        try {
          statsData = await officerService.getComplaintStats();
          console.log('✅ Stats loaded:', statsData);
        } catch (err) {
          console.error('❌ Stats failed:', err);
          statsData = { total: 0, pending: 0, in_progress: 0, resolved: 0, high_priority: 0 };
        }
        
        try {
          categoriesData = await officerService.getDepartments();
          console.log('✅ Departments loaded:', categoriesData);
        } catch (err) {
          console.error('❌ Departments failed:', err);
          categoriesData = [];
        }
        
        try {
          department = userId ? await officerService.getOfficerDepartment(userId) : 'None';
          console.log('✅ Department loaded:', department);
        } catch (err) {
          console.error('❌ Department failed:', err);
          department = 'None';
        }
        
        console.log('Stats data:', statsData);
        console.log('Departments data:', categoriesData);
        console.log('Department:', department);
        
        setStats({
          total: statsData.total,
          pending: statsData.pending,
          in_progress: statsData.in_progress,
          resolved: statsData.resolved,
          highPriority: statsData.high_priority
        });
        setDepartments(categoriesData);
        setCurrentDepartment(department);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleSetDepartment = () => {
    setSelectedDepartment(currentDepartment || 'None');
    setDepartmentDialogOpen(true);
  };

  const handleSaveDepartment = async () => {
    try {
      console.log('Attempting to update department for user:', user);
      console.log('User ID:', userId);
      console.log('Selected department:', selectedDepartment);
      
      if (!userId) {
        throw new Error('User ID is not available. Please log in again.');
      }
      
      await officerService.updateOfficerDepartment(userId, selectedDepartment);
      setCurrentDepartment(selectedDepartment);
      setDepartmentDialogOpen(false);
      setSnackbarMessage('Department updated successfully!');
      setSnackbarOpen(true);
      
      // Update user data in localStorage
      const updatedUser = { ...user, department: selectedDepartment };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating department:', error);
      setSnackbarMessage(error.message || 'Error updating department. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleCancelDepartment = () => {
    setDepartmentDialogOpen(false);
    setSelectedDepartment('');
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Officer Dashboard
        </Typography>
        <Typography>Loading dashboard data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Officer Dashboard
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </Box>
    );
  }

  const getProgressPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.resolved / stats.total) * 100);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
          Officer Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
          Welcome back, {user.name || 'Officer'}! Here's your complaint management overview.
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={4} sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: "center", py: 3 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <AssignmentIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.total}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Total Complaints
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={4} sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: "center", py: 3 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <ScheduleIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.pending}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={4} sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: "center", py: 3 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <TrendingUpIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.in_progress}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={4} sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: "center", py: 3 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <CheckCircleIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.resolved}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Resolved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={4} sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: "center", py: 3 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <WarningIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.highPriority}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                High Priority
              </Typography>
            </CardContent>
          </Card>
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

      {/* Department Info */}
      <Card elevation={3} sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 1, color: '#1976d2' }} />
          Department Assignment
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Current Department:
            </Typography>
            <Chip 
              label={currentDepartment === 'None' ? 'No Department Assigned' : currentDepartment}
              color={currentDepartment === 'None' ? 'default' : 'primary'}
              variant={currentDepartment === 'None' ? 'outlined' : 'filled'}
              sx={{ fontSize: '0.9rem', py: 1 }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<BusinessIcon />}
            onClick={handleSetDepartment}
            sx={{ 
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
            }}
          >
            {currentDepartment === 'None' ? 'Set Department' : 'Change Department'}
          </Button>
        </Box>
      </Card>

      {/* Action Buttons */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
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
            onClick={() => navigate("/officer/complaints")}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ 
                bgcolor: '#1976d2', 
                mx: 'auto', 
                mb: 2, 
                width: 64, 
                height: 64,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}>
                <AssignmentIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                All Complaints
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View and manage all complaints in the system
              </Typography>
              <Button variant="outlined" fullWidth>
                View All Complaints
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
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
            onClick={() => navigate("/officer/my-complaints")}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ 
                mx: 'auto', 
                mb: 2, 
                width: 64, 
                height: 64,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              }}>
                <BusinessIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                My Department
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View complaints specific to your department
              </Typography>
              <Button variant="outlined" fullWidth>
                My Department Complaints
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
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
            onClick={() => navigate("/officer/reports")}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ 
                mx: 'auto', 
                mb: 2, 
                width: 64, 
                height: 64,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              }}>
                <TrendingUpIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                Reports
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Generate and view department reports
              </Typography>
              <Button variant="outlined" fullWidth>
                View Reports
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Department Selection Dialog */}
      <Dialog open={departmentDialogOpen} onClose={handleCancelDepartment} maxWidth="sm" fullWidth>
        <DialogTitle>Set Department</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Department</InputLabel>
            <Select
              value={selectedDepartment}
              label="Select Department"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <MenuItem value="None">None (No Department)</MenuItem>
              {departments.length === 0 ? (
                <MenuItem disabled>No departments available</MenuItem>
              ) : (
                departments.map((department) => (
                  <MenuItem key={department.department_name} value={department.department_name}>
                    {department.department_name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          {departments.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Loading departments...
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDepartment}>Cancel</Button>
          <Button 
            onClick={handleSaveDepartment} 
            variant="contained"
            disabled={selectedDepartment === ''}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OfficerDashboard;
