import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Mock data - in a real app, this would come from an API
const mockComplaints = [
  { 
    id: 'CMP-1001', 
    category: 'Garbage Collection', 
    status: 'In Progress', 
    date: '2023-10-15T10:30:00',
    lastUpdated: '2023-10-16T14:20:00',
    priority: 'High',
    description: 'Garbage not collected for 3 days in our area.'
  },
  { 
    id: 'CMP-1002', 
    category: 'Road Repair', 
    status: 'Resolved', 
    date: '2023-10-10T09:15:00',
    lastUpdated: '2023-10-12T16:45:00',
    priority: 'Medium',
    description: 'Large pothole on Main Street causing traffic issues.'
  },
  { 
    id: 'CMP-1003', 
    category: 'Water Supply', 
    status: 'Pending', 
    date: '2023-10-05T14:20:00',
    lastUpdated: '2023-10-05T14:20:00',
    priority: 'High',
    description: 'No water supply in our building for the past 24 hours.'
  },
  { 
    id: 'CMP-1004', 
    category: 'Street Lighting', 
    status: 'In Progress', 
    date: '2023-10-01T18:45:00',
    lastUpdated: '2023-10-03T11:10:00',
    priority: 'Low',
    description: 'Street light not working near the park.'
  },
  { 
    id: 'CMP-1005', 
    category: 'Drainage', 
    status: 'Open', 
    date: '2023-09-28T16:30:00',
    lastUpdated: '2023-09-30T10:20:00',
    priority: 'Medium',
    description: 'Blocked drainage causing water logging on the road.'
  },
];

const statusColors = {
  'Pending': 'default',
  'Open': 'primary',
  'In Progress': 'info',
  'Resolved': 'success',
  'Rejected': 'error',
  'Closed': 'secondary'
};

const priorityColors = {
  'Low': 'success',
  'Medium': 'warning',
  'High': 'error'
};

const MyComplaints = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // Fetch complaints - in a real app, this would be an API call
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setComplaints(mockComplaints);
      setFilteredComplaints(mockComplaints);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...complaints];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(complaint => 
        complaint.id.toLowerCase().includes(term) ||
        complaint.category.toLowerCase().includes(term) ||
        complaint.description.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(complaint => complaint.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(complaint => complaint.priority === priorityFilter);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredComplaints(result);
    setPage(0); // Reset to first page when filters change
  }, [complaints, searchTerm, statusFilter, priorityFilter, sortConfig]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleViewComplaint = (id) => {
    navigate(`/complaint/${id}`);
  };

  const handleRefresh = () => {
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortConfig({ key: 'date', direction: 'desc' });
  };

  const getStatusCount = (status) => {
    return complaints.filter(c => c.status === status).length;
  };

  if (loading && complaints.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Complaints</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/file-complaint')}
          startIcon={<span>+</span>}
        >
          New Complaint
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Paper sx={{ p: 2, flex: 1, minWidth: 180 }}>
          <Typography variant="subtitle2" color="textSecondary">Total Complaints</Typography>
          <Typography variant="h4">{complaints.length}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 180, borderLeft: '4px solid #3f51b5' }}>
          <Typography variant="subtitle2" color="textSecondary">In Progress</Typography>
          <Typography variant="h4" color="primary">
            {getStatusCount('In Progress')}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 180, borderLeft: '4px solid #4caf50' }}>
          <Typography variant="subtitle2" color="textSecondary">Resolved</Typography>
          <Typography variant="h4" color="success.main">
            {getStatusCount('Resolved')}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 180, borderLeft: '4px solid #f44336' }}>
          <Typography variant="subtitle2" color="textSecondary">Pending</Typography>
          <Typography variant="h4" color="error.main">
            {getStatusCount('Pending')}
          </Typography>
        </Paper>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={2}>
          <TextField
            placeholder="Search complaints..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250, flex: 1 }}
          />
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              label="Priority"
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
          
          <Box display="flex" gap={1} ml="auto">
            <Tooltip title="Reset Filters">
              <IconButton 
                onClick={handleResetFilters}
                color="default"
                size="small"
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton 
                onClick={handleRefresh}
                color="primary"
                size="small"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Complaints Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="complaints table">
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('id')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Complaint ID
                  {sortConfig.key === 'id' && (
                    <span> {sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('category')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Category
                  {sortConfig.key === 'category' && (
                    <span> {sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableCell>
                <TableCell>Description</TableCell>
                <TableCell 
                  onClick={() => handleSort('status')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Status
                  {sortConfig.key === 'status' && (
                    <span> {sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('priority')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Priority
                  {sortConfig.key === 'priority' && (
                    <span> {sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('date')}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Date
                  {sortConfig.key === 'date' && (
                    <span> {sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((complaint) => (
                    <TableRow hover key={complaint.id}>
                      <TableCell>{complaint.id}</TableCell>
                      <TableCell>{complaint.category}</TableCell>
                      <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {complaint.description}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={complaint.status} 
                          size="small" 
                          color={statusColors[complaint.status] || 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={complaint.priority} 
                          size="small" 
                          color={priorityColors[complaint.priority] || 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(complaint.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewComplaint(complaint.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Box>
                      <SearchIcon fontSize="large" color="disabled" />
                      <Typography variant="subtitle1" color="textSecondary">
                        No complaints found
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
                        Try adjusting your search or filter criteria
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={handleResetFilters}
                      >
                        Clear Filters
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {filteredComplaints.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredComplaints.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </Box>
  );
};

export default MyComplaints;
