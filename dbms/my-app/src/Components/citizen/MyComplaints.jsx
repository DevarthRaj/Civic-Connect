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
  Button,
  Card,
  CardContent,
  Avatar,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { getUserComplaints } from '../../services/citizenService';

// Status & priority colors
const statusColors = {
  Pending: 'default',
  Open: 'primary',
  'In Progress': 'info',
  Resolved: 'success',
  Rejected: 'error',
  Closed: 'secondary'
};

const priorityColors = {
  Low: 'success',
  Medium: 'warning',
  High: 'error'
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
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  // Fetch complaints for current user
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getUserComplaints();
      setComplaints(data);
      setFilteredComplaints(data);
      setError('');
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Apply search, filters, sort
  useEffect(() => {
    let result = [...complaints];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.complaint_id.toString().includes(term) ||
          c.categories?.category_name.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') result = result.filter((c) => c.status === statusFilter);
    if (priorityFilter !== 'all') result = result.filter((c) => c.priority === priorityFilter);

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredComplaints(result);
    setPage(0);
  }, [complaints, searchTerm, statusFilter, priorityFilter, sortConfig]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };
  const handleViewComplaint = (id) => navigate(`/complaint/${id}`);
  const handleRefresh = () => fetchComplaints();
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortConfig({ key: 'created_at', direction: 'desc' });
  };

  const getStatusCount = (status) => complaints.filter((c) => c.status === status).length;

  if (loading && complaints.length === 0)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <IconButton 
              onClick={() => navigate('/citizen')}
              sx={{ mr: 2, bgcolor: 'white', boxShadow: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              My Complaints
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate('/file-complaint')}
            sx={{ 
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
            }}
          >
            New Complaint
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
      </Box>

      {/* Stats Cards */}
      <Box display="flex" gap={3} mb={4} flexWrap="wrap">
        <Card elevation={3} sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Avatar sx={{ 
              mx: 'auto', 
              mb: 2, 
              width: 56, 
              height: 56,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <AssignmentIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {complaints.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Complaints
            </Typography>
          </CardContent>
        </Card>
        
        <Card elevation={3} sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Avatar sx={{ 
              mx: 'auto', 
              mb: 2, 
              width: 56, 
              height: 56,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            }}>
              <AssignmentIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {getStatusCount('In Progress')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Progress
            </Typography>
          </CardContent>
        </Card>
        
        <Card elevation={3} sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Avatar sx={{ 
              mx: 'auto', 
              mb: 2, 
              width: 56, 
              height: 56,
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
            }}>
              <AssignmentIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {getStatusCount('Resolved')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resolved
            </Typography>
          </CardContent>
        </Card>
        
        <Card elevation={3} sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Avatar sx={{ 
              mx: 'auto', 
              mb: 2, 
              width: 56, 
              height: 56,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            }}>
              <AssignmentIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {getStatusCount('Pending')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={2}>
          <TextField
            placeholder="Search complaints..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            sx={{ minWidth: 250, flex: 1 }}
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
              <MenuItem value="all">All Statuses</MenuItem>
              {Object.keys(statusColors).map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} label="Priority">
              <MenuItem value="all">All Priorities</MenuItem>
              {Object.keys(priorityColors).map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box display="flex" gap={1} ml="auto">
            <Tooltip title="Reset Filters">
              <IconButton onClick={handleResetFilters} size="small">
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} size="small" color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Card>

      {/* Table */}
      <Card elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {['complaint_id', 'category', 'status', 'priority', 'created_at'].map((key) => (
                  <TableCell
                    key={key}
                    onClick={() => handleSort(key)}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {key === 'complaint_id' ? 'ID' : key === 'created_at' ? 'Date' : key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortConfig.key === key && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                  </TableCell>
                ))}
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((complaint) => (
                    <TableRow hover key={complaint.complaint_id}>
                      <TableCell>{complaint.complaint_id}</TableCell>
                      <TableCell>{complaint.categories?.category_name || '-'}</TableCell>
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
                      <TableCell>{new Date(complaint.created_at).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {complaint.description}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary" onClick={() => handleViewComplaint(complaint.complaint_id)}>
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
                      <Typography variant="subtitle1" color="textSecondary">No complaints found</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
                        Try adjusting your search or filter criteria
                      </Typography>
                      <Button variant="outlined" color="primary" onClick={handleResetFilters}>Clear Filters</Button>
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
      </Card>
    </Box>
  );
};

export default MyComplaints;
