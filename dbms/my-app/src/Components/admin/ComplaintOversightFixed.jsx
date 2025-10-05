import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip,
  FormControl, InputLabel, Select, MenuItem, Avatar, Divider,
  Tabs, Tab, Grid, Card, CardContent, CardActions, List, ListItem,
  ListItemIcon, ListItemText, CircularProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon, Search as SearchIcon, FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon, Pending as PendingIcon, ArrowForward as ArrowForwardIcon,
  Person as PersonIcon, Category as CategoryIcon, LocationOn as LocationIcon,
  CalendarToday as CalendarTodayIcon, Comment as CommentIcon, Check as CheckIcon,
  Close as CloseIcon, Refresh as RefreshIcon, Download as DownloadIcon, Print as PrintIcon,
  Business as BusinessIcon, Delete as DeleteIcon, Visibility as VisibilityIcon
} from '@mui/icons-material';
import { officerService } from '../../services/officerService';
import { deleteComplaint } from '../../services/complaintService';

const ComplaintOversight = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await officerService.getAllComplaints();
      
      // Transform data to match the expected format for the component
      const transformedComplaints = data.map(complaint => ({
        id: complaint.complaint_id,
        title: complaint.title,
        description: complaint.description,
        location: complaint.location,
        category: complaint.category ? complaint.category.category_name : 'Uncategorized',
        status: complaint.status || 'Unknown',
        priority: complaint.priority || 'Medium',
        dateCreated: complaint.created_at,
        lastUpdated: complaint.updated_at,
        assignedTo: 'Not Assigned',
        assignedDepartment: complaint.department ? complaint.department.department_name : 'General',
        citizen: { 
          name: complaint.citizen ? complaint.citizen.name : 'Unknown Citizen', 
          email: complaint.citizen ? complaint.citizen.email : 'No email', 
          phone: complaint.citizen ? complaint.citizen.phone : 'No phone' 
        },
        updates: [
          { 
            id: 1, 
            type: 'status', 
            text: 'Complaint registered', 
            date: complaint.created_at, 
            user: 'System' 
          }
        ]
      }));
      
      setComplaints(transformedComplaints);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.message || 'Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };
  
  // State hooks for UI controls
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [tabValue, setTabValue] = useState('all');
  const [filters, setFilters] = useState({ status: '', priority: '', department: '', dateFrom: '', dateTo: '' });
  const [openFilters, setOpenFilters] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [viewMode, setViewMode] = useState('list');

  // Options for filters and display
  const statusOptions = [
    { value: 'Pending', label: 'Pending', color: 'warning' },
    { value: 'In Progress', label: 'In Progress', color: 'primary' },
    { value: 'Resolved', label: 'Resolved', color: 'success' },
    { value: 'Rejected', label: 'Rejected', color: 'error' },
  ];
  const priorityOptions = [
    { value: 'Low', label: 'Low', color: 'success' },
    { value: 'Medium', label: 'Medium', color: 'warning' },
    { value: 'High', label: 'High', color: 'error' },
  ];
  const departmentOptions = [
    ...new Set(complaints.map(c => c.assignedDepartment))
  ].sort();

  // Handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };
  const handleFilterChange = (filterName) => (event) => {
    setFilters({ ...filters, [filterName]: event.target.value });
    setPage(0);
  };
  const resetFilters = () => setFilters({ status: '', priority: '', department: '', dateFrom: '', dateTo: '' });
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setOpenDetails(true);
  };
  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedComplaint(null);
    setNewComment('');
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleteLoading(complaintId);
      await deleteComplaint(complaintId);
      setComplaints(prev => prev.filter(c => c.id !== complaintId));
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('Failed to delete complaint. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Filtering logic
  const filteredComplaints = complaints.filter(complaint => {
    const complaintDate = new Date(complaint.dateCreated);
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);

    return (
      (searchTerm === '' ||
        complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.citizen.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (tabValue === 'all' || complaint.status.toLowerCase() === tabValue.toLowerCase()) &&
      (!filters.status || complaint.status === filters.status) &&
      (!filters.priority || complaint.priority === filters.priority) &&
      (!filters.department || complaint.assignedDepartment === filters.department) &&
      (!fromDate || complaintDate >= fromDate) &&
      (!toDate || complaintDate <= toDate)
    );
  });

  const getStatusCount = (status) => complaints.filter(c => c.status === status).length;
  const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const getStatusColor = (status) => (statusOptions.find(opt => opt.value === status) || {}).color || 'default';
  const getPriorityColor = (priority) => (priorityOptions.find(opt => opt.value === priority) || {}).color || 'default';

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedComplaint) return;
    console.log(`Adding comment to ${selectedComplaint.id}: ${newComment}`);
    setNewComment('');
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Complaint Oversight
        </Typography>
        <Box>
          <Button variant={viewMode === 'list' ? 'contained' : 'outlined'} size="small" onClick={() => setViewMode('list')} sx={{ mr: 1 }}>
            List View
          </Button>
          <Button variant={viewMode === 'grid' ? 'contained' : 'outlined'} size="small" onClick={() => setViewMode('grid')} sx={{ mr: 2 }}>
            Card View
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} size="small">
            Export
          </Button>
        </Box>
      </Box>

      {/* Search and Filter Bar */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="Search by ID, title, or citizen..." 
              value={searchTerm} 
              onChange={handleSearch} 
              InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }} 
            />
          </Grid>
          <Grid item xs={12} md={6} container justifyContent="flex-end" spacing={1}>
            <Grid item>
              <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setOpenFilters(!openFilters)}>
                Filters
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={resetFilters}>Reset</Button>
            </Grid>
          </Grid>
          {openFilters && (
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Advanced Filters</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select value={filters.status} label="Status" onChange={handleFilterChange('status')}>
                        <MenuItem value="">All</MenuItem>
                        {statusOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Priority</InputLabel>
                      <Select value={filters.priority} label="Priority" onChange={handleFilterChange('priority')}>
                        <MenuItem value="">All</MenuItem>
                        {priorityOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Department</InputLabel>
                      <Select value={filters.department} label="Department" onChange={handleFilterChange('department')}>
                        <MenuItem value="">All</MenuItem>
                        {departmentOptions.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Status Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label={<Box>All<Chip label={complaints.length} size="small" sx={{ ml: 1 }} /></Box>} value="all" />
          {statusOptions.map(status => 
            <Tab 
              key={status.value} 
              label={
                <Box display="flex" alignItems="center">
                  {status.label}
                  <Chip label={getStatusCount(status.value)} size="small" sx={{ ml: 1 }} color={status.color} />
                </Box>
              } 
              value={status.value.toLowerCase()} 
            />
          )}
        </Tabs>
      </Box>

      {/* Main Content: Table View */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Complaint ID & Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComplaints.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((complaint) => (
                <TableRow key={complaint.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">{complaint.title}</Typography>
                    <Typography variant="caption" color="textSecondary">by {complaint.citizen.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={complaint.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={complaint.status} color={getStatusColor(complaint.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={complaint.priority} color={getPriorityColor(complaint.priority)} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{formatDate(complaint.dateCreated)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary" onClick={() => handleViewDetails(complaint)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Complaint">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteComplaint(complaint.id)}
                          disabled={deleteLoading === complaint.id}
                        >
                          {deleteLoading === complaint.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination 
          rowsPerPageOptions={[5, 10, 25]} 
          component="div" 
          count={filteredComplaints.length} 
          rowsPerPage={rowsPerPage} 
          page={page} 
          onPageChange={handleChangePage} 
          onRowsPerPageChange={handleChangeRowsPerPage} 
        />
      </Paper>

      {/* Complaint Details Dialog */}
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedComplaint && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">{selectedComplaint.title}</Typography>
                <IconButton onClick={handleCloseDetails}><CloseIcon /></IconButton>
              </Box>
              <Typography variant="body2" color="textSecondary">{selectedComplaint.id}</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" gutterBottom>Description</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography>{selectedComplaint.description}</Typography>
                  </Paper>
                  
                  <Typography variant="subtitle1" gutterBottom>Activity</Typography>
                  <TextField 
                    fullWidth 
                    multiline 
                    rows={3} 
                    placeholder="Add a comment..." 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                  />
                  <Button variant="contained" onClick={handleAddComment} sx={{ mt: 1 }}>
                    Add Comment
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>Details</Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CategoryIcon /></ListItemIcon>
                        <ListItemText primary="Category" secondary={selectedComplaint.category} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><BusinessIcon /></ListItemIcon>
                        <ListItemText primary="Department" secondary={selectedComplaint.assignedDepartment} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><LocationIcon /></ListItemIcon>
                        <ListItemText primary="Location" secondary={selectedComplaint.location} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        <ListItemText primary="Reported By" secondary={`${selectedComplaint.citizen.name} (${selectedComplaint.citizen.email})`} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CalendarTodayIcon /></ListItemIcon>
                        <ListItemText primary="Last Updated" secondary={formatDate(selectedComplaint.lastUpdated)} />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ComplaintOversight;
