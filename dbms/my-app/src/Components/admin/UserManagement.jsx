// In UserManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControl,
  InputLabel, Select, Avatar, Tooltip, Chip, CircularProgress, Alert, Snackbar
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { usersApi } from '../../services/database';
import { auth, supabase } from '../../services/supabase';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState('all');

  // Add error boundary state
  const [hasError, setHasError] = useState(false);

  // Error boundary effect
  useEffect(() => {
    const errorHandler = (error) => {
      console.error('Error caught by error boundary:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await usersApi.getAll();
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error in fetchUsers:', err);
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  // Handle user creation/update
  const handleSaveUser = async (userData) => {
    console.log('Starting user creation with data:', userData);
    
    try {
      if (selectedUser?.user_id) {
        // Update existing user
        const { error } = await usersApi.update(selectedUser.user_id, {
          name: userData.name,
          role: userData.role
        });
        if (error) throw error;
        setSuccess('User updated successfully');
      } else {
        console.log('Attempting to create new user in Auth...');
        
        // Create new user with email confirmation
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: 'Temporary@123', // Using a stronger temporary password
          options: {
            data: {
              name: userData.name,
              role: userData.role || 'citizen',
              // Add any additional user metadata here
            },
            emailRedirectTo: window.location.origin + '/auth/callback'
          }
        });

        console.log('Auth response:', { data, error });
        
        if (error) {
          console.error('Auth error details:', error);
          throw error;
        }
        
        // Check if email confirmation is required
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          console.log('Email confirmation required');
          setSuccess('Confirmation email sent. Please check your inbox.');
        } else {
          console.log('User created without email confirmation');
          setSuccess('User created successfully');
        }
        
        // Add user to your custom users table
        if (data.user) {
          console.log('Attempting to add user to database...');
          const { data: userData, error: dbError } = await supabase
            .from('users')
            .insert([
              {
                user_id: data.user.id,
                email: userData.email,
                name: userData.name,
                role: userData.role || 'citizen',
                created_at: new Date().toISOString()
              }
            ])
            .select();
            
          console.log('Database insert result:', { userData, dbError });
          
          if (dbError) {
            console.error('Database error details:', dbError);
            // Check if it's a duplicate key error (user already exists)
            if (dbError.code === '23505') {
              console.log('User already exists in database, updating instead...');
              const { error: updateError } = await supabase
                .from('users')
                .update({
                  name: userData.name,
                  role: userData.role || 'citizen',
                  updated_at: new Date().toISOString()
                })
                .eq('email', userData.email);
                
              if (updateError) {
                console.error('Update error:', updateError);
                throw updateError;
              }
            } else {
              throw dbError;
            }
          }
        }
      }
      
      // Refresh the users list
      console.log('Refreshing users list...');
      await fetchUsers();
      handleCloseDialog();
      
    } catch (err) {
      console.error('Error in handleSaveUser:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
        error: err
      });
      setError(err.message || 'Error saving user');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const { error } = await usersApi.delete(userId);
        if (error) throw error;
        setSuccess('User deleted successfully');
        await fetchUsers(); // Refresh the list
      } catch (err) {
        console.error('Error in handleDeleteUser:', err);
        setError(err.message || 'Error deleting user');
      }
    }
  };

  // Rest of your component code...

  // If error boundary caught an error
  if (hasError) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="error" variant="h6">
          Something went wrong. Please try refreshing the page.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Refresh Page
        </Button>
      </Box>
    );
  }

  // If loading and no data yet
  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">User Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add User
        </Button>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={3}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          }}
        />
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter"
          >
            <MenuItem value="all">All Users</MenuItem>
            <MenuItem value="admin">Admins</MenuItem>
            <MenuItem value="officer">Officers</MenuItem>
            <MenuItem value="citizen">Citizens</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, mr: 1.5 }}>
                      {user.name?.charAt(0) || 'U'}
                    </Avatar>
                    {user.name}
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status || 'active'}
                    color={user.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenDialog(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteUser(user.user_id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser?.user_id ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Name"
              value={selectedUser?.name || ''}
              onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={selectedUser?.email || ''}
              onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
              margin="normal"
              disabled={!!selectedUser?.user_id}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedUser?.role || 'citizen'}
                onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="officer">Officer</MenuItem>
                <MenuItem value="citizen">Citizen</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => handleSaveUser(selectedUser)} 
            variant="contained" 
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;