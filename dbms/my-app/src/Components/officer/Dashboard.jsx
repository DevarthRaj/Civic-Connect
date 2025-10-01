import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Officer Dashboard</Typography>
      <Box display="flex" gap={2}>
        <Button variant="contained" color="primary" onClick={() => navigate('/officer/complaints')}>
          View Complaints
        </Button>
        <Button variant="contained" color="secondary" onClick={() => navigate('/officer/reports')}>
          View Department Reports
        </Button>
      </Box>
    </Box>
  );
};

export default OfficerDashboard;
