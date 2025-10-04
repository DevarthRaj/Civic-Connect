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
  Alert,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  AdminPanelSettings as AdminIcon,
  Speed as SpeedIcon
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

  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  const getResolutionRate = () => {
    const totalComplaints = stats.find(s => s.title === 'Total Complaints')?.value || 0;
    const resolvedComplaints = stats.find(s => s.title === 'Resolved')?.value || 0;
    if (totalComplaints === 0) return 0;
    return Math.round((resolvedComplaints / totalComplaints) * 100);
  };

  const StatCard = ({ title, value, icon, gradient }) => (
    <Card elevation={4} sx={{ 
      height: '100%', 
      background: gradient,
      color: 'white',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-4px)' }
    }}>
      <CardContent sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ opacity: 0.9, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            width: 64, 
            height: 64 
          }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
          Welcome back, {user.name || 'Administrator'}! Manage your civic platform efficiently.
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Total Users"
            value={stats.find(s => s.title === 'Total Users')?.value || 0}
            icon={<PeopleIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Total Complaints"
            value={stats.find(s => s.title === 'Total Complaints')?.value || 0}
            icon={<AssignmentIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Resolved"
            value={stats.find(s => s.title === 'Resolved')?.value || 0}
            icon={<CheckCircleIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Pending"
            value={stats.find(s => s.title === 'Pending')?.value || 0}
            icon={<PendingIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="High Priority"
            value={stats.find(s => s.title === 'High Priority')?.value || 0}
            icon={<WarningIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Departments"
            value={stats.find(s => s.title === 'Departments')?.value || 0}
            icon={<BarChartIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
          />
        </Grid>
      </Grid>

      {/* System Performance */}
      <Card elevation={3} sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <SpeedIcon sx={{ mr: 1, color: '#1976d2' }} />
          System Performance
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={getResolutionRate()} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
                }
              }} 
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {getResolutionRate()}%
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Resolution Rate: {stats.find(s => s.title === 'Resolved')?.value || 0} out of {stats.find(s => s.title === 'Total Complaints')?.value || 0} complaints resolved
        </Typography>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 1, color: '#1976d2' }} />
                Recent Complaints
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setOpenViewReports(true)}
              >
                View All
              </Button>
            </Box>
            <Box>
              {complaints.slice(0, 3).map((complaint, index) => (
                <Box 
                  key={complaint.complaint_id || index} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    mb: 1,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      backgroundColor: '#f5f5f5',
                      transform: 'translateX(4px)'
                    } 
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        #{complaint.complaint_id?.toString().slice(-6) || `100${index + 1}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {complaint.title || ["Garbage not collected", "Street light not working", "Water leakage issue"][index]}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 2 }}>
                      <Chip 
                        label={complaint.status || 'Pending'}
                        size="small"
                        color={
                          complaint.status === 'resolved' ? 'success' :
                          complaint.status === 'pending' ? 'warning' : 'info'
                        }
                        variant="filled"
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <AdminIcon sx={{ mr: 1, color: '#1976d2' }} />
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={6} key={index}>
                  <Card 
                    elevation={2}
                    onClick={action.onClick}
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Box fontSize={32} mb={1}>{action.icon}</Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {action.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
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
