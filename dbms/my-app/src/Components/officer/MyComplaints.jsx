import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Select, MenuItem, InputLabel, FormControl, Alert,
  Chip, Avatar, Divider, IconButton, Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { officerService } from '../../services/officerService';

const MyComplaints = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  // Get user_id from different possible locations
  const userId = user.user_id || user.id || user.userId;
  
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentDepartment, setCurrentDepartment] = useState('None');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('MyComplaints - User object:', user);
        console.log('MyComplaints - User ID:', userId);
        
        // First check if department is in localStorage (recently updated)
        const localStorageDepartment = user.department;
        console.log('MyComplaints - Department from localStorage:', localStorageDepartment);
        
        const [categoriesData, dbDepartment] = await Promise.all([
          officerService.getCategories(),
          userId ? officerService.getOfficerDepartment(userId) : Promise.resolve('None')
        ]);
        
        // Use localStorage department if available, otherwise use DB department
        const department = localStorageDepartment || dbDepartment;
        console.log('MyComplaints - Final department used:', department);
        
        setCategories(categoriesData);
        setCurrentDepartment(department);
        
        // Fetch complaints based on department
        let complaintsData;
        if (department === 'None') {
          // If no department set, show all complaints
          console.log('MyComplaints - Fetching all complaints (no department set)');
          complaintsData = await officerService.getAllComplaints();
        } else {
          // Show only complaints from officer's department
          console.log('MyComplaints - Fetching complaints for department:', department);
          complaintsData = await officerService.getComplaintsByDepartment(department);
        }
        
        console.log('MyComplaints - Complaints fetched:', complaintsData);
        setComplaints(complaintsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, user.department]);

  const filteredComplaints = complaints.filter(c =>
    (!status || c.status === status) &&
    (!search ||
      c.citizen_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.complaint_id.toString().includes(search) ||
      c.title?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const handleRefresh = () => {
    // Force re-fetch by updating the user object from localStorage
    const freshUser = JSON.parse(localStorage.getItem('user')) || {};
    console.log('Refreshing with fresh user data:', freshUser);
    window.location.reload(); // Simple refresh for now
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <IconButton 
              onClick={() => navigate('/officer')}
              sx={{ mr: 2, bgcolor: 'white', boxShadow: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              My Department Complaints
            </Typography>
          </Box>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={handleRefresh}
              sx={{ bgcolor: 'white', boxShadow: 1 }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Divider sx={{ mb: 3 }} />
      </Box>

      {/* Department Status Card */}
      <Card elevation={3} sx={{ mb: 4, p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <BusinessIcon sx={{ mr: 1, color: '#1976d2' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Department Status
          </Typography>
        </Box>
        
        {currentDepartment === 'None' ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  No Department Assigned
                </Typography>
                <Typography variant="body2">
                  You haven't set a department yet. Showing all complaints in the system.
                </Typography>
              </Box>
              <Button 
                variant="contained"
                size="small" 
                onClick={() => navigate('/officer')}
                sx={{ ml: 2 }}
              >
                Set Department
              </Button>
            </Box>
          </Alert>
        ) : (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Department: {currentDepartment}
                </Typography>
                <Typography variant="body2">
                  Showing complaints specific to your department.
                </Typography>
              </Box>
              <Chip 
                label={`${filteredComplaints.length} Complaints`}
                color="success"
                variant="filled"
              />
            </Box>
          </Alert>
        )}
      </Card>

      {/* Filters Card */}
      <Card elevation={3} sx={{ mb: 4, p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <FilterListIcon sx={{ mr: 1, color: '#1976d2' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Filter & Search
          </Typography>
        </Box>
        
        <Box display="flex" gap={3} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select value={status} label="Status Filter" onChange={e => setStatus(e.target.value)}>
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Pending">🟡 Pending</MenuItem>
              <MenuItem value="In Progress">🔵 In Progress</MenuItem>
              <MenuItem value="Resolved">🟢 Resolved</MenuItem>
              <MenuItem value="Rejected">🔴 Rejected</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            size="small"
            label="Search Complaints"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by citizen name, ID, or title..."
            sx={{ minWidth: 300, flexGrow: 1 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: '#666' }} />
            }}
          />
        </Box>
      </Card>

      {/* Complaints Table */}
      <Card elevation={3}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Complaints List
                </Typography>
              </Box>
              <Chip 
                label={`${filteredComplaints.length} Results`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Citizen</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Box textAlign="center">
                        <AssignmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Complaints Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentDepartment === 'None' 
                            ? 'Set your department to see relevant complaints.'
                            : `No complaints found for ${currentDepartment} department.`
                          }
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComplaints.map(row => (
                    <TableRow
                      key={row.complaint_id}
                      hover
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f5f5f5' }
                      }}
                      onClick={() => navigate(`/officer/complaints/${row.complaint_id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#1976d2' }}>
                          #{row.complaint_id.toString().slice(-6)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {row.citizen_name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                          {row.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.category_name || 'N/A'}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status}
                          size="small"
                          color={
                            row.status === 'Pending' ? 'warning' : 
                            row.status === 'In Progress' ? 'info' : 
                            row.status === 'Resolved' ? 'success' : 'error'
                          }
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.priority}
                          size="small"
                          color={
                            row.priority === 'High' ? 'error' : 
                            row.priority === 'Medium' ? 'warning' : 'success'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(row.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyComplaints;
