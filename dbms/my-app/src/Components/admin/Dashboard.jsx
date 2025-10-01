import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';

const Dashboard = () => {
  // Mock data - in a real app, this would come from an API
  const stats = [
    { title: 'Total Users', value: '1,234', icon: <PeopleIcon fontSize="large" />, color: '#1976d2' },
    { title: 'Total Complaints', value: '567', icon: <AssignmentIcon fontSize="large" />, color: '#d32f2f' },
    { title: 'Resolved', value: '432', icon: <CheckCircleIcon fontSize="large" />, color: '#388e3c' },
    { title: 'Pending', value: '89', icon: <PendingIcon fontSize="large" />, color: '#f57c00' },
    { title: 'High Priority', value: '45', icon: <WarningIcon fontSize="large" />, color: '#d32f2f' },
    { title: 'Departments', value: '12', icon: <BarChartIcon fontSize="large" />, color: '#7b1fa2' },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                display: 'flex', 
                alignItems: 'center',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  transition: 'transform 0.3s ease-in-out',
                },
              }}
            >
              <Box 
                sx={{ 
                  backgroundColor: `${stat.color}22`, 
                  borderRadius: '50%',
                  width: 60,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  color: stat.color
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

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Complaints</Typography>
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                View All
              </Typography>
            </Box>
            <Box>
              {[1, 2, 3].map((item) => (
                <Box 
                  key={item} 
                  sx={{ 
                    p: 2, 
                    borderBottom: '1px solid #eee',
                    '&:hover': { backgroundColor: '#f9f9f9' } 
                  }}
                >
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle2">Complaint #{1000 + item}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {item} hour{item !== 1 ? 's' : ''} ago
                    </Typography>
                  </Box>
                  <Typography variant="body2" noWrap>
                    {["Garbage not collected", "Street light not working", "Water leakage issue"][item - 1]}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mt: 3, height: '100%' }}>
            <Typography variant="h6" mb={2}>Quick Actions</Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Add New User', icon: '👥' },
                { label: 'Create Department', icon: '🏢' },
                { label: 'View Reports', icon: '📊' },
                { label: 'Manage Categories', icon: '🏷️' },
                { label: 'System Settings', icon: '⚙️' },
                { label: 'View Analytics', icon: '📈' },
              ].map((action, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { 
                        backgroundColor: '#f5f5f5',
                        borderColor: '#1976d2',
                      },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box fontSize={24} mb={1}>{action.icon}</Box>
                    <Typography variant="body2">{action.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
