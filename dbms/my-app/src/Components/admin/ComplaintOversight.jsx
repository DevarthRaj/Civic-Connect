import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip,
  FormControl, InputLabel, Select, MenuItem, Avatar, Divider,
  Tabs, Tab, Grid, Card, CardContent, CardActions, List, ListItem,
  ListItemIcon, ListItemText
} from '@mui/material';
import {
  Assignment as AssignmentIcon, Search as SearchIcon, FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon, Pending as PendingIcon, ArrowForward as ArrowForwardIcon,
  Person as PersonIcon, Category as CategoryIcon, LocationOn as LocationIcon,
  CalendarToday as CalendarTodayIcon, Comment as CommentIcon, Check as CheckIcon,
  Close as CloseIcon, Refresh as RefreshIcon, Download as DownloadIcon, Print as PrintIcon,
  Business as BusinessIcon // Added for department icon
} from '@mui/icons-material';
import { officerService } from '../../services/officerService'; // Adjust path if needed

const ComplaintOversight = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        // Use the joined category name, with a fallback
        category: complaint.category ? complaint.category.category_name : 'Uncategorized',
        status: complaint.status || 'Unknown',
        priority: complaint.priority || 'Medium',
        dateCreated: complaint.created_at,
        lastUpdated: complaint.updated_at,
        assignedTo: 'Not Assigned', // This can be replaced with real data if you add it
        // Use the joined department name, with a fallback
        assignedDepartment: complaint.department ? complaint.department.department_name : 'General',
        // Use the joined citizen data, with fallbacks
        citizen: { 
          name: complaint.citizen ? complaint.citizen.name : 'Unknown Citizen', 
          email: complaint.citizen ? complaint.citizen.email : 'No email', 
          phone: complaint.citizen ? complaint.citizen.phone : 'No phone' 
        },
        // Mock updates, can be replaced with a real 'updates' table join
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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

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

  // Handlers for pagination, search, tabs, etc.
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

  // Mock handlers for actions
  const handleStatusChange = (complaintId, newStatus) => console.log(`Changing status of ${complaintId} to ${newStatus}`);
  const handleAssign = (complaintId, assignee) => console.log(`Assigning ${complaintId} to ${assignee}`);
  const handleAddComment = () => {
    if (!newComment.trim() || !selectedComplaint) return;
    console.log(`Adding comment to ${selectedComplaint.id}: ${newComment}`);
    setNewComment('');
  };
  
  if (loading) {
    return <Typography>Loading complaints...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  // JSX for the component UI
  return (
    <Box p={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Complaint Oversight</Typography>
            <Box>
                <Button variant={viewMode === 'list' ? 'contained' : 'outlined'} size="small" onClick={() => setViewMode('list')} sx={{ mr: 1 }}>List View</Button>
                <Button variant={viewMode === 'grid' ? 'contained' : 'outlined'} size="small" onClick={() => setViewMode('grid')} sx={{ mr: 2 }}>Card View</Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} size="small" sx={{ mr: 1 }}>Export</Button>
            </Box>
        </Box>

        {/* Search and Filter Bar */}
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                    <TextField fullWidth size="small" placeholder="Search by ID, title, or citizen..." value={searchTerm} onChange={handleSearch} InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }} />
                </Grid>
                <Grid item xs={12} md={6} container justifyContent="flex-end" spacing={1}>
                    <Grid item><Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setOpenFilters(!openFilters)}>Filters</Button></Grid>
                    <Grid item><Button variant="outlined" onClick={resetFilters}>Reset</Button></Grid>
                </Grid>
                {openFilters && (
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Advanced Filters</Typography>
                            <Grid container spacing={2}>
                                {/* Filter Controls */}
                                <Grid item xs={12} sm={6} md={3}><FormControl fullWidth size="small"><InputLabel>Status</InputLabel><Select value={filters.status} label="Status" onChange={handleFilterChange('status')}><MenuItem value="">All</MenuItem>{statusOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}</Select></FormControl></Grid>
                                <Grid item xs={12} sm={6} md={3}><FormControl fullWidth size="small"><InputLabel>Priority</InputLabel><Select value={filters.priority} label="Priority" onChange={handleFilterChange('priority')}><MenuItem value="">All</MenuItem>{priorityOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}</Select></FormControl></Grid>
                                <Grid item xs={12} sm={6} md={3}><FormControl fullWidth size="small"><InputLabel>Department</InputLabel><Select value={filters.department} label="Department" onChange={handleFilterChange('department')}><MenuItem value="">All</MenuItem>{departmentOptions.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}</Select></FormControl></Grid>
                                <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="From Date" type="date" value={filters.dateFrom} onChange={handleFilterChange('dateFrom')} InputLabelProps={{ shrink: true }} /></Grid>
                                <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="To Date" type="date" value={filters.dateTo} onChange={handleFilterChange('dateTo')} InputLabelProps={{ shrink: true }} /></Grid>
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
                {statusOptions.map(status => <Tab key={status.value} label={<Box display="flex" alignItems="center">{status.label}<Chip label={getStatusCount(status.value)} size="small" sx={{ ml: 1 }} color={status.color} /></Box>} value={status.value.toLowerCase()} />)}
            </Tabs>
        </Box>

        {/* Main Content: Table or Card View */}
        {viewMode === 'list' ? (
            <Paper elevation={3}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Complaint ID & Title</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Date Created</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredComplaints.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((complaint) => (
                                <TableRow key={complaint.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="500">{complaint.title}</Typography>
                                        <Typography variant="caption" color="textSecondary">by {complaint.citizen.name}</Typography>
                                    </TableCell>
                                    <TableCell><Chip label={complaint.category} size="small" variant="outlined" /></TableCell>
                                    <TableCell><Chip label={complaint.status} color={getStatusColor(complaint.status)} size="small" /></TableCell>
                                    <TableCell><Chip label={complaint.priority} color={getPriorityColor(complaint.priority)} size="small" variant="outlined" /></TableCell>
                                    <TableCell>{formatDate(complaint.dateCreated)}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="View Details"><IconButton size="small" onClick={() => handleViewDetails(complaint)}><ArrowForwardIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredComplaints.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
            </Paper>
        ) : (
             <Grid container spacing={3}>
                {/* Card View Implementation */}
                {filteredComplaints.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((complaint) => (
                     <Grid item xs={12} sm={6} md={4} key={complaint.id}>
                         <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                             <CardContent sx={{ flexGrow: 1 }}>
                                 <Box display="flex" justifyContent="space-between" mb={1}><Typography variant="h6">{complaint.title}</Typography><Chip label={complaint.status} color={getStatusColor(complaint.status)} size="small" /></Box>
                                 <Typography variant="body2" color="textSecondary" paragraph>{complaint.description.substring(0, 100)}...</Typography>
                                 <Chip label={complaint.priority} color={getPriorityColor(complaint.priority)} size="small" variant="outlined" sx={{ mr: 1 }} />
                                 <Chip label={complaint.category} size="small" variant="outlined" />
                                 <Divider sx={{ my: 1.5 }} />
                                 <Typography variant="caption" display="block">Reported by: {complaint.citizen.name}</Typography>
                                 <Typography variant="caption" display="block">Department: {complaint.assignedDepartment}</Typography>
                             </CardContent>
                             <CardActions><Button size="small" onClick={() => handleViewDetails(complaint)}>View Details</Button></CardActions>
                         </Card>
                     </Grid>
                ))}
            </Grid>
        )}

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
                                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}><Typography>{selectedComplaint.description}</Typography></Paper>
                                
                                <Typography variant="subtitle1" gutterBottom>Activity</Typography>
                                <TextField fullWidth multiline rows={3} placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                                <Button variant="contained" onClick={handleAddComment} sx={{ mt: 1 }}>Add Comment</Button>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle1" gutterBottom>Details</Typography>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <List dense>
                                        <ListItem><ListItemIcon><CategoryIcon /></ListItemIcon><ListItemText primary="Category" secondary={selectedComplaint.category} /></ListItem>
                                        <ListItem><ListItemIcon><BusinessIcon /></ListItemIcon><ListItemText primary="Department" secondary={selectedComplaint.assignedDepartment} /></ListItem>
                                        <ListItem><ListItemIcon><LocationIcon /></ListItemIcon><ListItemText primary="Location" secondary={selectedComplaint.location} /></ListItem>
                                        <ListItem><ListItemIcon><PersonIcon /></ListItemIcon><ListItemText primary="Reported By" secondary={`${selectedComplaint.citizen.name} (${selectedComplaint.citizen.email})`} /></ListItem>
                                        <ListItem><ListItemIcon><CalendarTodayIcon /></ListItemIcon><ListItemText primary="Last Updated" secondary={formatDate(selectedComplaint.lastUpdated)} /></ListItem>
                                    </List>
                                </Paper>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions><Button onClick={handleCloseDetails}>Close</Button></DialogActions>
                </>
            )}
        </Dialog>
    </Box>
  );
};

export default ComplaintOversight;