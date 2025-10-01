import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Grid, Divider
} from '@mui/material';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SaveAlt, ArrowBack } from '@mui/icons-material';

// Mock data for demonstration
const statusData = [
  { name: 'Resolved', value: 40 },
  { name: 'In Progress', value: 25 },
  { name: 'Pending', value: 15 },
  { name: 'Rejected', value: 5 }
];
const categoryData = [
  { name: 'Sanitation', value: 20 },
  { name: 'Roads', value: 15 },
  { name: 'Water', value: 10 },
  { name: 'Electricity', value: 8 }
];
const monthData = [
  { month: 'Jan', complaints: 10 },
  { month: 'Feb', complaints: 15 },
  { month: 'Mar', complaints: 20 },
  { month: 'Apr', complaints: 18 }
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const OfficerReports = () => {
  // Export handlers (mock)
  const handleExport = (type) => {
    alert(`Exporting as ${type}`);
  };

  return (
    <Box p={3}>
      <Button startIcon={<ArrowBack />} onClick={() => window.history.back()} sx={{ mb: 2 }}>
        Back to Officer Dashboard
      </Button>
      <Typography variant="h4" gutterBottom>Department Reports</Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Complaints by Status</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((entry, idx) => (
                    <Cell key={`cell-status-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Complaints by Category</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((entry, idx) => (
                    <Cell key={`cell-cat-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Complaints by Month</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="complaints" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      <Box mt={4} display="flex" gap={2}>
        <Button variant="contained" color="primary" startIcon={<SaveAlt />} onClick={() => handleExport('CSV')}>
          Export to CSV
        </Button>
        <Button variant="contained" color="secondary" startIcon={<SaveAlt />} onClick={() => handleExport('PDF')}>
          Export to PDF
        </Button>
      </Box>
    </Box>
  );
};

export default OfficerReports;
