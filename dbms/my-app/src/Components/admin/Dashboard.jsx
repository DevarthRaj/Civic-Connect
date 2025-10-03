import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { supabase } from '../../services/supabase';
import { adminOperations } from '../../services/adminSupabase';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '0', icon: <PeopleIcon fontSize="large" />, color: '#1976d2' },
    { title: 'Total Complaints', value: '0', icon: <AssignmentIcon fontSize="large" />, color: '#d32f2f' },
    { title: 'Resolved', value: '0', icon: <CheckCircleIcon fontSize="large" />, color: '#388e3c' },
    { title: 'Pending', value: '0', icon: <PendingIcon fontSize="large" />, color: '#f57c00' },
    { title: 'High Priority', value: '0', icon: <WarningIcon fontSize="large" />, color: '#d32f2f' },
    { title: 'Departments', value: '0', icon: <BarChartIcon fontSize="large" />, color: '#7b1fa2' },
  ]);

  // Dialog states
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openCreateDept, setOpenCreateDept] = useState(false);
  const [openViewReports, setOpenViewReports] = useState(false);
  const [openManageCategories, setOpenManageCategories] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'citizen' });
  const [newDept, setNewDept] = useState({ department_name: '', description: '' });
  const [newCategory, setNewCategory] = useState({ category_name: '', description: '', priority: 'medium' });

  // Data states
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Notification state
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
    loadCategories();
    loadDepartments();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Use admin operations to bypass RLS
      const { data: users, error: usersError } = await adminOperations.getAllUsers();
      const { data: complaintsData, error: complaintsError } = await adminOperations.getAllComplaints();
      const { data: depts, error: deptsError } = await adminOperations.getAllDepartments();

      if (!usersError && !complaintsError && !deptsError) {
        const resolvedCount = complaintsData?.filter(c => c.status === 'resolved').length || 0;
        const pendingCount = complaintsData?.filter(c => c.status === 'pending').length || 0;
        const highPriorityCount = complaintsData?.filter(c => c.priority === 'high').length || 0;

        setStats([
          { title: 'Total Users', value: users?.length || 0, icon: <PeopleIcon fontSize="large" />, color: '#1976d2' },
          { title: 'Total Complaints', value: complaintsData?.length || 0, icon: <AssignmentIcon fontSize="large" />, color: '#d32f2f' },
          { title: 'Resolved', value: resolvedCount, icon: <CheckCircleIcon fontSize="large" />, color: '#388e3c' },
          { title: 'Pending', value: pendingCount, icon: <PendingIcon fontSize="large" />, color: '#f57c00' },
          { title: 'High Priority', value: highPriorityCount, icon: <WarningIcon fontSize="large" />, color: '#d32f2f' },
          { title: 'Departments', value: depts?.length || 0, icon: <BarChartIcon fontSize="large" />, color: '#7b1fa2' },
        ]);
        setComplaints(complaintsData || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await adminOperations.getAllCategories();
      if (!error) setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const { data, error } = await adminOperations.getAllDepartments();
      if (!error) setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      // Use admin operations to bypass RLS
      const { data, error } = await adminOperations.createUser(newUser);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setNotification({ open: true, message: 'User added successfully!', severity: 'success' });
      setNewUser({ name: '', email: '', phone: '', role: 'citizen' });
      setOpenAddUser(false);
      loadDashboardData();
    } catch (error) {
      console.error('Full error:', error);
      setNotification({ open: true, message: 'Error adding user: ' + error.message, severity: 'error' });
    }
  };

  const handleCreateDepartment = async () => {
    try {
      // Use admin operations to bypass RLS
      const { data, error } = await adminOperations.createDepartment(newDept);
      
      if (error) {
        console.error('Department creation error:', error);
        throw error;
      }
      
      setNotification({ open: true, message: 'Department created successfully!', severity: 'success' });
      setNewDept({ department_name: '', description: '' });
      setOpenCreateDept(false);
      loadDashboardData();
      loadDepartments();
    } catch (error) {
      console.error('Full error:', error);
      setNotification({ open: true, message: 'Error creating department: ' + error.message, severity: 'error' });
    }
  };

  const handleAddCategory = async () => {
    try {
      const { data, error } = await adminOperations.createCategory(newCategory);
      
      if (error) throw error;
      
      setNotification({ open: true, message: 'Category added successfully!', severity: 'success' });
      setNewCategory({ category_name: '', description: '', priority: 'medium' });
      loadCategories();
    } catch (error) {
      setNotification({ open: true, message: 'Error adding category: ' + error.message, severity: 'error' });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const { error } = await adminOperations.deleteCategory(categoryId);
      
      if (error) throw error;
      
      setNotification({ open: true, message: 'Category deleted successfully!', severity: 'success' });
      loadCategories();
    } catch (error) {
      setNotification({ open: true, message: 'Error deleting category: ' + error.message, severity: 'error' });
    }
  };

  const quickActions = [
    { 
      label: 'Add New User', 
      icon: '👥', 
      onClick: () => setOpenAddUser(true) 
    },
    { 
      label: 'Create Department', 
      icon: '🏢', 
      onClick: () => setOpenCreateDept(true) 
    },
    { 
      label: 'View Reports', 
      icon: '📊', 
      onClick: () => setOpenViewReports(true) 
    },
    { 
      label: 'Manage Categories', 
      icon: '🏷️', 
      onClick: () => setOpenManageCategories(true) 
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                display: 'flex', 
                alignItems: 'center',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  transition: 'transform 0.3s ease-in-out',
                },
              }}
            >
              <Box 
                sx={{ 
                  backgroundColor: `${stat.color}22`, 
                  borderRadius: '50%',
                  width: 60,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  color: stat.color
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stat.title}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Complaints</Typography>
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                View All
              </Typography>
            </Box>
            <Box>
              {[1, 2, 3].map((item) => (
                <Box 
                  key={item} 
                  sx={{ 
                    p: 2, 
                    borderBottom: '1px solid #eee',
                    '&:hover': { backgroundColor: '#f9f9f9' } 
                  }}
                >
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle2">Complaint #{1000 + item}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {item} hour{item !== 1 ? 's' : ''} ago
                    </Typography>
                  </Box>
                  <Typography variant="body2" noWrap>
                    {["Garbage not collected", "Street light not working", "Water leakage issue"][item - 1]}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mt: 3, height: '100%' }}>
            <Typography variant="h6" mb={2}>Quick Actions</Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Box 
                    onClick={action.onClick}
                    sx={{ 
                      p: 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { 
                        backgroundColor: '#f5f5f5',
                        borderColor: '#1976d2',
                      },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box fontSize={24} mb={1}>{action.icon}</Box>
                    <Typography variant="body2">{action.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Add User Dialog */}
      <Dialog open={openAddUser} onClose={() => setOpenAddUser(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            variant="outlined"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Role</InputLabel>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="citizen">Citizen</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="department_head">Department Head</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddUser(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">Add User</Button>
        </DialogActions>
      </Dialog>

      {/* Create Department Dialog */}
      <Dialog open={openCreateDept} onClose={() => setOpenCreateDept(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Department</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Department Name"
            fullWidth
            variant="outlined"
            value={newDept.department_name}
            onChange={(e) => setNewDept({ ...newDept, department_name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newDept.description}
            onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDept(false)}>Cancel</Button>
          <Button onClick={handleCreateDepartment} variant="contained">Create Department</Button>
        </DialogActions>
      </Dialog>

      {/* View Reports Dialog */}
      <Dialog open={openViewReports} onClose={() => setOpenViewReports(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Complaints Reports</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint.complaint_id}>
                    <TableCell>{complaint.complaint_id}</TableCell>
                    <TableCell>{complaint.title}</TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1, 
                          backgroundColor: 
                            complaint.status === 'resolved' ? '#e8f5e8' : 
                            complaint.status === 'pending' ? '#fff3cd' : '#f8d7da',
                          color: 
                            complaint.status === 'resolved' ? '#2e7d32' : 
                            complaint.status === 'pending' ? '#856404' : '#721c24'
                        }}
                      >
                        {complaint.status}
                      </Box>
                    </TableCell>
                    <TableCell>{complaint.priority}</TableCell>
                    <TableCell>{complaint.location}</TableCell>
                    <TableCell>{new Date(complaint.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewReports(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog open={openManageCategories} onClose={() => setOpenManageCategories(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Categories</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Add New Category</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Category Name"
                  fullWidth
                  variant="outlined"
                  value={newCategory.category_name}
                  onChange={(e) => setNewCategory({ ...newCategory, category_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Description"
                  fullWidth
                  variant="outlined"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newCategory.priority}
                    onChange={(e) => setNewCategory({ ...newCategory, priority: e.target.value })}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="contained" 
                  onClick={handleAddCategory}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          <Typography variant="h6" gutterBottom>Existing Categories</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.category_id}>
                    <TableCell>{category.category_id}</TableCell>
                    <TableCell>{category.category_name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>{category.priority}</TableCell>
                    <TableCell>
                      <Button 
                        color="error" 
                        onClick={() => handleDeleteCategory(category.category_id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenManageCategories(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
