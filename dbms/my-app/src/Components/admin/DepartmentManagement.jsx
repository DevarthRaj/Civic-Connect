import React, { useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip,
  Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider
} from '@mui/material';
import {
  Business as BusinessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  LocationCity as LocationCityIcon
} from '@mui/icons-material';

const DepartmentManagement = () => {
  // Mock data
  const departments = [
    { 
      id: 1, 
      name: 'Sanitation Department', 
      code: 'SD-001',
      head: 'John Smith',
      email: 'sanitation@city.gov',
      phone: '(555) 123-4567',
      employees: 24,
      status: 'Active',
      description: 'Responsible for garbage collection, street cleaning, and waste management.'
    },
    { 
      id: 2, 
      name: 'Public Works', 
      code: 'PW-002',
      head: 'Sarah Johnson',
      email: 'publicworks@city.gov',
      phone: '(555) 234-5678',
      employees: 45,
      status: 'Active',
      description: 'Manages public infrastructure including roads, bridges, and public buildings.'
    },
    { 
      id: 3, 
      name: 'Parks and Recreation', 
      code: 'PR-003',
      head: 'Michael Brown',
      email: 'parks@city.gov',
      phone: '(555) 345-6789',
      employees: 32,
      status: 'Active',
      description: 'Oversees public parks, recreational facilities, and community programs.'
    },
  ];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [openViewDialog, setOpenViewDialog] = useState(false);

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

  const handleOpenDialog = (dept = null) => {
    setSelectedDept(dept || { 
      name: '', 
      code: '', 
      head: '',
      email: '',
      phone: '',
      description: '',
      status: 'Active'
    });
    setOpenDialog(true);
  };

  const handleViewDetails = (dept) => {
    setSelectedDept(dept);
    setOpenViewDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDept(null);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedDept(null);
  };

  const handleSaveDepartment = () => {
    // In a real app, this would be an API call
    console.log('Saving department:', selectedDept);
    handleCloseDialog();
  };

  const handleDeleteDepartment = (deptId) => {
    // In a real app, this would be an API call
    console.log('Deleting department:', deptId);
  };

  const filteredDepts = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Department Management</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<LocationCityIcon />}
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            sx={{ mr: 2 }}
          >
            {viewMode === 'list' ? 'Grid View' : 'List View'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Department
          </Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ flexGrow: 1 }}
          />
        </Box>
      </Paper>

      {viewMode === 'list' ? (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Department</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Department Head</TableCell>
                <TableCell>Employees</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDepts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((dept) => (
                  <TableRow key={dept.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <BusinessIcon color="primary" sx={{ mr: 1 }} />
                        {dept.name}
                      </Box>
                    </TableCell>
                    <TableCell>{dept.code}</TableCell>
                    <TableCell>{dept.head}</TableCell>
                    <TableCell>{dept.employees}</TableCell>
                    <TableCell>
                      <Chip 
                        label={dept.status}
                        size="small"
                        color={dept.status === 'Active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetails(dept)}>
                          <BusinessIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(dept)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteDepartment(dept.id)}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredDepts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      ) : (
        <Grid container spacing={3}>
          {filteredDepts.map((dept) => (
            <Grid item xs={12} sm={6} md={4} key={dept.id}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{dept.name}</Typography>
                    <Typography variant="caption" color="textSecondary">{dept.code}</Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }} noWrap>
                  {dept.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <List dense>
                  <ListItem disableGutters>
                    <ListItemAvatar>
                      <PeopleIcon color="action" />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={dept.head} 
                      secondary="Department Head" 
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemAvatar>
                      <PeopleIcon color="action" />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={`${dept.employees} employees`} 
                      secondary="Team Size"
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                </List>
                
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Chip 
                    label={dept.status}
                    size="small"
                    color={dept.status === 'Active' ? 'success' : 'default'}
                  />
                  <Box>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewDetails(dept)}>
                        <BusinessIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(dept)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteDepartment(dept.id)}>
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Department Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedDept?.id ? 'Edit Department' : 'Add New Department'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Department Name"
              value={selectedDept?.name || ''}
              onChange={(e) => setSelectedDept({...selectedDept, name: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Department Code"
              value={selectedDept?.code || ''}
              onChange={(e) => setSelectedDept({...selectedDept, code: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Department Head"
              value={selectedDept?.head || ''}
              onChange={(e) => setSelectedDept({...selectedDept, head: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={selectedDept?.email || ''}
              onChange={(e) => setSelectedDept({...selectedDept, email: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={selectedDept?.phone || ''}
              onChange={(e) => setSelectedDept({...selectedDept, phone: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={selectedDept?.description || ''}
              onChange={(e) => setSelectedDept({...selectedDept, description: e.target.value})}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveDepartment} variant="contained" color="primary">
            {selectedDept?.id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Department Details Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleCloseViewDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <BusinessIcon color="primary" sx={{ mr: 1 }} />
            {selectedDept?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDept && (
            <Box>
              <Box display="flex" alignItems="center" mb={3}>
                <Chip 
                  label={selectedDept.code}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ mr: 2 }}
                />
                <Chip 
                  label={selectedDept.status}
                  color={selectedDept.status === 'Active' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              
              <Typography variant="body1" paragraph>
                {selectedDept.description}
              </Typography>
              
              <Grid container spacing={3} mt={1}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    CONTACT INFORMATION
                  </Typography>
                  <List dense>
                    <ListItem disableGutters>
                      <ListItemText 
                        primary={selectedDept.head} 
                        secondary="Department Head"
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText 
                        primary={selectedDept.email} 
                        secondary="Email Address"
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText 
                        primary={selectedDept.phone} 
                        secondary="Phone Number"
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    DEPARTMENT STATISTICS
                  </Typography>
                  <List dense>
                    <ListItem disableGutters>
                      <ListItemText 
                        primary={selectedDept.employees} 
                        secondary="Total Employees"
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText 
                        primary="15" 
                        secondary="Active Complaints"
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText 
                        primary="87%" 
                        secondary="Resolution Rate"
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
              
              <Box mt={3}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  RECENT ACTIVITY
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    No recent activity to display
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              handleCloseViewDialog();
              handleOpenDialog(selectedDept);
            }}
          >
            Edit Department
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentManagement;
