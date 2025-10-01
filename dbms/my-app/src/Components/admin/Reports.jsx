import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardHeader,
  Divider, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TextField, Button, IconButton, Menu,
  MenuItem, FormControl, InputLabel, Select, Tabs, Tab, useTheme,
  LinearProgress, Chip, Avatar
} from '@mui/material';
import {
  Assessment, ArrowDownward, FilterList, MoreVert, Refresh,
  Print, FileDownload, Email, Business, CheckCircle, Pending, Cancel
} from '@mui/icons-material';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Mock data
const reportsData = {
  summary: {
    totalComplaints: 1245,
    resolved: 987,
    inProgress: 71,
    pending: 187,
    resolutionRate: 79.3
  },
  trends: [
    { month: 'Jan', complaints: 65 },
    { month: 'Feb', complaints: 59 },
    { month: 'Mar', complaints: 80 },
    { month: 'Apr', complaints: 81 },
    { month: 'May', complaints: 56 },
    { month: 'Jun', complaints: 55 }
  ],
  categories: [
    { name: 'Sanitation', value: 35 },
    { name: 'Infrastructure', value: 25 },
    { name: 'Parks', value: 15 },
    { name: 'Safety', value: 10 },
    { name: 'Other', value: 15 }
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Reports = () => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filter, setFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [tab, setTab] = useState('overview');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleDateChange = (field) => (e) => {
    setDateRange({...dateRange, [field]: e.target.value});
  };

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
  };

  const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const renderSummaryCards = () => (
    <Grid container spacing={3} mb={3}>
      {[
        { title: 'Total Complaints', value: reportsData.summary.totalComplaints, icon: <Assessment />, color: 'primary' },
        { title: 'Resolved', value: reportsData.summary.resolved, icon: <CheckCircle />, color: 'success' },
        { title: 'In Progress', value: reportsData.summary.inProgress, icon: <Pending />, color: 'warning' },
        { title: 'Resolution Rate', value: `${reportsData.summary.resolutionRate}%`, icon: <Assessment />, color: 'info' }
      ].map((card, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <div>
                  <Typography color="textSecondary" variant="overline">
                    {card.title}
                  </Typography>
                  <Typography variant="h4">{card.value}</Typography>
                </div>
                <Avatar sx={{ bgcolor: `${card.color}.light`, color: `${card.color}.dark` }}>
                  {card.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderCharts = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title="Monthly Complaints" />
          <Divider />
          <CardContent sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportsData.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="complaints" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Categories" />
          <Divider />
          <CardContent sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportsData.categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {reportsData.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDepartmentTable = () => (
    <Card sx={{ mt: 3 }}>
      <CardHeader 
        title="Department Performance" 
        action={
          <Box display="flex">
            <TextField
              size="small"
              type="date"
              value={dateRange.start}
              onChange={handleDateChange('start')}
              InputLabelProps={{ shrink: true }}
              sx={{ mr: 1, width: 150 }}
            />
            <TextField
              size="small"
              type="date"
              value={dateRange.end}
              onChange={handleDateChange('end')}
              InputLabelProps={{ shrink: true }}
              sx={{ mr: 1, width: 150 }}
            />
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem><FileDownload fontSize="small" sx={{ mr: 1 }} /> Export</MenuItem>
              <MenuItem><Print fontSize="small" sx={{ mr: 1 }} /> Print</MenuItem>
              <MenuItem><Email fontSize="small" sx={{ mr: 1 }} /> Email</MenuItem>
            </Menu>
          </Box>
        }
      />
      <Divider />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Department</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Resolved</TableCell>
              <TableCell align="right">Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { name: 'Sanitation', total: 450, resolved: 380, rate: 84.4 },
              { name: 'Public Works', total: 320, resolved: 250, rate: 78.1 },
              { name: 'Parks', total: 180, resolved: 140, rate: 77.8 },
              { name: 'Traffic', total: 150, resolved: 110, rate: 73.3 },
              { name: 'Water', total: 120, resolved: 85, rate: 70.8 },
            ].map((row, i) => (
              <TableRow key={i} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Business color="action" sx={{ mr: 1 }} />
                    {row.name}
                  </Box>
                </TableCell>
                <TableCell align="right">{row.total}</TableCell>
                <TableCell align="right">{row.resolved}</TableCell>
                <TableCell align="right">
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                    <Box width="60%" mr={1}>
                      <LinearProgress 
                        variant="determinate" 
                        value={row.rate} 
                        sx={{ 
                          height: 6, 
                          '& .MuiLinearProgress-bar': {
                            bgcolor: row.rate > 80 ? 'success.main' : row.rate > 60 ? 'warning.main' : 'error.main'
                          }
                        }} 
                      />
                    </Box>
                    {row.rate}%
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Reports & Analytics</Typography>
        <Box>
          <Button startIcon={<FileDownload />} sx={{ mr: 1 }}>Export</Button>
          <Button startIcon={<Print />}>Print</Button>
        </Box>
      </Box>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" value="overview" />
        <Tab label="Departments" value="departments" />
        <Tab label="Categories" value="categories" />
      </Tabs>

      {tab === 'overview' && (
        <>
          {renderSummaryCards()}
          {renderCharts()}
        </>
      )}

      {tab === 'departments' && renderDepartmentTable()}
      
      {tab === 'categories' && (
        <Card>
          <CardHeader title="Category Analysis" />
          <Divider />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsData.categories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {reportsData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Reports;
