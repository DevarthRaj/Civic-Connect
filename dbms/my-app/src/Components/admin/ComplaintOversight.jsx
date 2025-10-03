import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip,
  FormControl, InputLabel, Select, MenuItem, Avatar, Badge, Divider,
  Tabs, Tab, Grid, Card, CardContent, CardActions, List, ListItem,
  ListItemIcon, ListItemText, ListItemSecondaryAction, Switch
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Error as ErrorIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Comment as CommentIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { adminOperations } from '../../services/adminSupabase';

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
      const { data, error } = await adminOperations.getAllComplaints();
      if (error) throw error;
      setComplaints(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Mock data for fallback (removed duplicate declaration)
  const mockComplaints = [
    {
      id: 'CMP-1001',
      title: 'Garbage not collected',
      category: 'Sanitation',
      subcategory: 'Garbage Collection',
      status: 'In Progress',
      priority: 'High',
      dateCreated: '2023-10-15T10:30:00',
      lastUpdated: '2023-10-16T14:20:00',
      assignedTo: 'John Smith',
      assignedDepartment: 'Sanitation Department',
      location: '123 Main St, Anytown',
      description: 'Garbage has not been collected for the past 3 days. The bins are overflowing.',
      citizen: { name: 'Alice Johnson', email: 'alice@example.com', phone: '(555) 123-4567' },
      updates: [
        { id: 1, type: 'status', text: 'Complaint registered', date: '2023-10-15T10:30:00', user: 'System' },
        { id: 2, type: 'comment', text: 'Our team has been notified', date: '2023-10-15T11:15:00', user: 'John Smith' },
      ]
    },
    {
      id: 'CMP-1002',
      title: 'Pothole on Main Street',
      category: 'Infrastructure',
      subcategory: 'Road Maintenance',
      status: 'Open',
      priority: 'Medium',
      dateCreated: '2023-10-14T09:15:00',
      lastUpdated: '2023-10-14T09:15:00',
      assignedTo: 'Not Assigned',
      assignedDepartment: 'Public Works',
      location: '456 Main St, Anytown',
      description: 'Large pothole causing traffic issues',
      citizen: { name: 'Bob Wilson', email: 'bob@example.com', phone: '(555) 234-5678' },
      updates: [
        { id: 1, type: 'status', text: 'Complaint registered', date: '2023-10-14T09:15:00', user: 'System' },
      ]
    },
    {
      id: 'CMP-1003',
      title: 'Broken Playground Equipment',
      category: 'Parks & Recreation',
      subcategory: 'Playground Maintenance',
      status: 'Resolved',
      priority: 'Low',
      dateCreated: '2023-10-10T14:30:00',
      lastUpdated: '2023-10-12T16:45:00',
      assignedTo: 'Sarah Johnson',
      assignedDepartment: 'Parks Department',
      location: 'Central Park, Anytown',
      description: 'Swing set is broken and unsafe for children',
      citizen: { name: 'Carol Davis', email: 'carol@example.com', phone: '(555) 345-6789' },
      updates: [
        { id: 1, type: 'status', text: 'Complaint registered', date: '2023-10-10T14:30:00', user: 'System' },
        { id: 2, type: 'comment', text: 'Assigned to maintenance team', date: '2023-10-10T15:15:00', user: 'Admin' },
        { id: 3, type: 'status', text: 'Repair completed', date: '2023-10-12T16:45:00', user: 'Sarah Johnson' },
      ]
    },
  ];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [tabValue, setTabValue] = useState('all');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: '',
    dateFrom: '',
    dateTo: ''
  });
  const [openFilters, setOpenFilters] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Status options with colors
  const statusOptions = [
    { value: 'Open', label: 'Open', color: 'primary' },
    { value: 'In Progress', label: 'In Progress', color: 'warning' },
    { value: 'Resolved', label: 'Resolved', color: 'success' },
    { value: 'Closed', label: 'Closed', color: 'default' },
    { value: 'Rejected', label: 'Rejected', color: 'error' },
  ];

  // Priority options with colors
  const priorityOptions = [
    { value: 'Low', label: 'Low', color: 'success' },
    { value: 'Medium', label: 'Medium', color: 'warning' },
    { value: 'High', label: 'High', color: 'error' },
  ];

  // Department options
  const departmentOptions = [
    'Sanitation Department',
    'Public Works',
    'Parks Department',
    'Traffic Department',
    'Water Department'
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

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
    setFilters({
      ...filters,
      [filterName]: event.target.value
    });
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      department: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedComplaint(null);
    setNewComment('');
  };

  const handleStatusChange = (complaintId, newStatus) => {
    // In a real app, this would be an API call
    console.log(`Changing status of complaint ${complaintId} to ${newStatus}`);
    
    // Update local state for demo purposes
    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === complaintId) {
        return {
          ...complaint,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
          updates: [
            ...complaint.updates,
            {
              id: complaint.updates.length + 1,
              type: 'status',
              text: `Status changed to ${newStatus}`,
              date: new Date().toISOString(),
              user: 'Admin User'
            }
          ]
        };
      }
      return complaint;
    });
    
    // In a real app, you would update the state with the API response
    console.log('Updated complaints:', updatedComplaints);
  };

  const handleAssign = (complaintId, assignee) => {
    // In a real app, this would be an API call
    console.log(`Assigning complaint ${complaintId} to ${assignee}`);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    // In a real app, this would be an API call
    console.log('Adding comment:', newComment);
    
    // Update local state for demo purposes
    const updatedComplaint = {
      ...selectedComplaint,
      updates: [
        ...selectedComplaint.updates,
        {
          id: selectedComplaint.updates.length + 1,
          type: 'comment',
          text: newComment,
          date: new Date().toISOString(),
          user: 'Admin User'
        }
      ]
    };
    
    setSelectedComplaint(updatedComplaint);
    setNewComment('');
  };

  // Filter complaints based on search term, tab, and filters
  const filteredComplaints = complaints.filter(complaint => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.citizen.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by tab
    const matchesTab = tabValue === 'all' || complaint.status.toLowerCase() === tabValue.toLowerCase();
    
    // Filter by status
    const matchesStatus = !filters.status || complaint.status === filters.status;
    
    // Filter by priority
    const matchesPriority = !filters.priority || complaint.priority === filters.priority;
    
    // Filter by department
    const matchesDepartment = !filters.department || complaint.assignedDepartment === filters.department;
    
    // Filter by date range
    const complaintDate = new Date(complaint.dateCreated);
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
    
    let matchesDate = true;
    if (fromDate) {
      matchesDate = matchesDate && complaintDate >= fromDate;
    }
    if (toDate) {
      // Set to end of day for toDate
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && complaintDate <= endOfDay;
    }
    
    return matchesSearch && matchesTab && matchesStatus && matchesPriority && matchesDepartment && matchesDate;
  });

  // Get status count for tabs
  const getStatusCount = (status) => {
    return complaints.filter(c => c.status === status).length;
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'default';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const priorityOption = priorityOptions.find(opt => opt.value === priority);
    return priorityOption ? priorityOption.color : 'default';
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Complaint Oversight</Typography>
        <Box>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('list')}
            sx={{ mr: 1 }}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('grid')}
            sx={{ mr: 2 }}
          >
            Card View
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            size="small"
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            size="small"
            sx={{ mr: 1 }}
          >
            Print
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
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} container justifyContent="flex-end" spacing={1}>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setOpenFilters(!openFilters)}
              >
                Filters {Object.values(filters).filter(Boolean).length > 0 ? `(${Object.values(filters).filter(Boolean).length})` : ''}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                onClick={resetFilters}
                disabled={Object.values(filters).every(val => !val)}
              >
                Reset
              </Button>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          {openFilters && (
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Advanced Filters</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.status}
                        label="Status"
                        onChange={handleFilterChange('status')}
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        {statusOptions.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={filters.priority}
                        label="Priority"
                        onChange={handleFilterChange('priority')}
                      >
                        <MenuItem value="">All Priorities</MenuItem>
                        {priorityOptions.map((priority) => (
                          <MenuItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={filters.department}
                        label="Department"
                        onChange={handleFilterChange('department')}
                      >
                        <MenuItem value="">All Departments</MenuItem>
                        {departmentOptions.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="From Date"
                      type="date"
                      value={filters.dateFrom}
                      onChange={handleFilterChange('dateFrom')}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="To Date"
                      type="date"
                      value={filters.dateTo}
                      onChange={handleFilterChange('dateTo')}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Status Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="complaint status tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <span>All</span>
                <Chip 
                  label={complaints.length} 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Box>
            } 
            value="all" 
          />
          {statusOptions.map((status) => (
            <Tab 
              key={status.value}
              label={
                <Box display="flex" alignItems="center">
                  <Box
                    component="span"
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: `${status.color}.main`,
                      mr: 1,
                    }}
                  />
                  <span>{status.label}</span>
                  <Chip 
                    label={getStatusCount(status.value)} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Box>
              } 
              value={status.value.toLowerCase()} 
            />
          ))}
        </Tabs>
      </Box>

      {/* Complaints List */}
      {viewMode === 'list' ? (
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Complaint ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Date Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComplaints.length > 0 ? (
                  filteredComplaints
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((complaint) => (
                      <TableRow key={complaint.id} hover>
                        <TableCell>{complaint.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="500">
                            {complaint.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            by {complaint.citizen.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={complaint.category} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={complaint.status}
                            color={getStatusColor(complaint.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={complaint.priority}
                            color={getPriorityColor(complaint.priority)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {complaint.assignedTo === 'Not Assigned' ? (
                            <Typography variant="body2" color="textSecondary">
                              Not Assigned
                            </Typography>
                          ) : (
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ width: 24, height: 24, fontSize: 12, mr: 1 }}>
                                {complaint.assignedTo.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Typography variant="body2">
                                {complaint.assignedTo}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(complaint.dateCreated).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(complaint.dateCreated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewDetails(complaint)}
                            >
                              <ArrowForwardIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Box textAlign="center">
                        <AssignmentIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="subtitle1" color="textSecondary">
                          No complaints found
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Try adjusting your search or filter criteria
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
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
      ) : (
        // Card View
        <Grid container spacing={3}>
          {filteredComplaints.length > 0 ? (
            filteredComplaints
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((complaint) => (
                <Grid item xs={12} sm={6} md={4} key={complaint.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" component="h3" noWrap>
                          {complaint.title}
                        </Typography>
                        <Chip 
                          label={complaint.status}
                          color={getStatusColor(complaint.status)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" paragraph sx={{ mb: 2 }}>
                        {complaint.description.length > 100 
                          ? `${complaint.description.substring(0, 100)}...` 
                          : complaint.description}
                      </Typography>
                      
                      <Box mb={2}>
                        <Chip 
                          label={complaint.priority}
                          color={getPriorityColor(complaint.priority)}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                        <Chip 
                          label={complaint.category}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Reported by
                          </Typography>
                          <Typography variant="body2">
                            {complaint.citizen.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Assigned to
                          </Typography>
                          <Typography variant="body2" noWrap>
                            {complaint.assignedTo}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Created
                          </Typography>
                          <Typography variant="body2">
                            {new Date(complaint.dateCreated).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Last Updated
                          </Typography>
                          <Typography variant="body2">
                            {new Date(complaint.lastUpdated).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                      <Button 
                        size="small" 
                        onClick={() => handleViewDetails(complaint)}
                        endIcon={<ArrowForwardIcon />}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <AssignmentIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No complaints found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Try adjusting your search or filter criteria
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Complaint Details Dialog */}
      <Dialog 
        open={openDetails} 
        onClose={handleCloseDetails} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
      >
        {selectedComplaint && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" component="div">
                    {selectedComplaint.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedComplaint.id} • Created on {formatDate(selectedComplaint.dateCreated)}
                  </Typography>
                </Box>
                <Box>
                  <Chip 
                    label={selectedComplaint.status}
                    color={getStatusColor(selectedComplaint.status)}
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={selectedComplaint.priority}
                    color={getPriorityColor(selectedComplaint.priority)}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" gutterBottom>Description</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                    <Typography>{selectedComplaint.description}</Typography>
                  </Paper>
                  
                  <Typography variant="subtitle1" gutterBottom>Activity</Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                    <List dense>
                      {selectedComplaint.updates.map((update, index) => (
                        <React.Fragment key={update.id}>
                          <ListItem alignItems="flex-start" disableGutters>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {update.type === 'status' ? (
                                <CheckCircleIcon color="primary" fontSize="small" />
                              ) : (
                                <CommentIcon color="action" fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                    fontWeight={500}
                                  >
                                    {update.user}
                                  </Typography>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ ml: 1 }}
                                  >
                                    {update.text}
                                  </Typography>
                                </>
                              }
                              secondary={formatDate(update.date)}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                          {index < selectedComplaint.updates.length - 1 && <Divider component="li" variant="inset" />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                  
                  <Box mt={2}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      placeholder="Add a comment or update status..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Box mt={1} display="flex" justifyContent="flex-end">
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        Comment
                      </Button>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>Details</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <List dense>
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CategoryIcon color="action" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Category" 
                          secondary={selectedComplaint.category}
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <Divider component="li" variant="inset" />
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <LocationIcon color="action" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Location" 
                          secondary={selectedComplaint.location}
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <Divider component="li" variant="inset" />
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <PersonIcon color="action" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Reported By" 
                          secondary={
                            <>
                              <div>{selectedComplaint.citizen.name}</div>
                              <div>{selectedComplaint.citizen.email}</div>
                              <div>{selectedComplaint.citizen.phone}</div>
                            </>
                          }
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <Divider component="li" variant="inset" />
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <BusinessIcon color="action" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Assigned Department" 
                          secondary={selectedComplaint.assignedDepartment}
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <Divider component="li" variant="inset" />
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <PersonIcon color="action" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Assigned To" 
                          secondary={
                            selectedComplaint.assignedTo === 'Not Assigned' ? (
                              <Typography color="textSecondary" variant="body2">
                                Not Assigned
                              </Typography>
                            ) : (
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ width: 24, height: 24, fontSize: 12, mr: 1 }}>
                                  {selectedComplaint.assignedTo.split(' ').map(n => n[0]).join('')}
                                </Avatar>
                                <Typography variant="body2">
                                  {selectedComplaint.assignedTo}
                                </Typography>
                              </Box>
                            )
                          }
                        />
                      </ListItem>
                      <Divider component="li" variant="inset" />
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CalendarIcon color="action" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Last Updated" 
                          secondary={formatDate(selectedComplaint.lastUpdated)}
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Quick Actions</Typography>
                    <Grid container spacing={1}>
                      {statusOptions.map((status) => (
                        <Grid item xs={6} key={status.value}>
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            startIcon={
                              status.value === 'Resolved' ? <CheckIcon /> :
                              status.value === 'Rejected' ? <CloseIcon /> :
                              status.value === 'In Progress' ? <RefreshIcon /> : null
                            }
                            color={status.color}
                            onClick={() => handleStatusChange(selectedComplaint.id, status.value)}
                            disabled={selectedComplaint.status === status.value}
                            sx={{ textTransform: 'none', mb: 1 }}
                          >
                            Mark as {status.label}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                    
                    <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                      <InputLabel>Assign To</InputLabel>
                      <Select
                        value=""
                        label="Assign To"
                        onChange={(e) => handleAssign(selectedComplaint.id, e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Select an assignee</em>
                        </MenuItem>
                        <MenuItem value="John Smith">John Smith</MenuItem>
                        <MenuItem value="Sarah Johnson">Sarah Johnson</MenuItem>
                        <MenuItem value="Michael Brown">Michael Brown</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
              <Button variant="contained" color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ComplaintOversight;
