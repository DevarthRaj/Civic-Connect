import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Select, MenuItem, InputLabel, FormControl,
  Chip, Avatar, Divider, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { officerService } from '../../services/officerService';
import { deleteComplaint } from '../../services/complaintService';

const ComplaintManagement = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsData, categoriesData] = await Promise.all([
          officerService.getAllComplaints(),
          officerService.getCategories()
        ]);
        
        setComplaints(complaintsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(complaintId);
    try {
      await deleteComplaint(complaintId);

      // Manually filter the deleted complaint from the state
      setComplaints(prev => prev.filter(c => c.complaint_id !== complaintId));

      alert('Complaint deleted successfully!');
    } catch (err) {
      console.error('Officer Delete Error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredComplaints = complaints.filter(c =>
    (!status || c.status === status) &&
    (!category || c.category_name === category) &&
    (!search ||
      c.citizen_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.complaint_id.toString().includes(search) ||
      c.title?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton 
            onClick={() => navigate('/officer')}
            sx={{ mr: 2, bgcolor: 'white', boxShadow: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            All Complaints Management
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
          Manage and oversee all complaints in the system
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>

      {/* Filters Card */}
      <Card elevation={3} sx={{ 
        mb: 4, 
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
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
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category Filter</InputLabel>
            <Select value={category} label="Category Filter" onChange={e => setCategory(e.target.value)}>
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.category_id} value={cat.category_name}>
                  {cat.category_name}
                </MenuItem>
              ))}
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
      <Card elevation={3} sx={{
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,1) 100%)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  All Complaints
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Box textAlign="center">
                        <AssignmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Complaints Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try adjusting your filters or search terms.
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
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          transform: 'scale(1.01)'
                        }
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
                        <Typography variant="body2" color="text.secondary">
                          {new Date(row.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/officer/complaints/${row.complaint_id}`);
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Complaint">
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteComplaint(row.complaint_id);
                              }}
                              disabled={deleteLoading === row.complaint_id}
                            >
                              {deleteLoading === row.complaint_id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <DeleteIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Box>
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

export default ComplaintManagement;
