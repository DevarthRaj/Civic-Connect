import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip,
  FormControl, InputLabel, Select, MenuItem, Avatar,
  Snackbar, Alert
} from '@mui/material';
import {
  Category as CategoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { adminOperations } from '../../services/adminSupabase';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await adminOperations.getAllCategories();
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (selectedCategory?.category_id) {
        const { error } = await adminOperations.updateCategory(selectedCategory.category_id, categoryData);
        if (error) throw error;
        setSuccess('Category updated successfully');
      } else {
        const { error } = await adminOperations.createCategory(categoryData);
        if (error) throw error;
        setSuccess('Category created successfully');
      }
      await fetchCategories();
      handleCloseDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const { error } = await adminOperations.deleteCategory(categoryId);
        if (error) throw error;
        setSuccess('Category deleted successfully');
        await fetchCategories();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
  };

  const filteredCategories = categories.filter(category => 
    category.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Typography>Loading categories...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Category Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Category
        </Button>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={3}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((category) => (
              <TableRow key={category.category_id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'secondary.main' }}>
                      <CategoryIcon fontSize="small" />
                    </Avatar>
                    {category.category_name}
                  </Box>
                </TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <Chip 
                    label={category.priority} 
                    color={
                      category.priority === 'high' ? 'error' : 
                      category.priority === 'medium' ? 'warning' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(category.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSelectedCategory(category);
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
                      onClick={() => handleDeleteCategory(category.category_id)}
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

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredCategories.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedCategory?.category_id ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={selectedCategory?.category_name || ''}
              onChange={(e) => setSelectedCategory({...selectedCategory, category_name: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={selectedCategory?.description || ''}
              onChange={(e) => setSelectedCategory({...selectedCategory, description: e.target.value})}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={selectedCategory?.priority || 'medium'}
                onChange={(e) => setSelectedCategory({...selectedCategory, priority: e.target.value})}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={() => handleSaveCategory(selectedCategory)} variant="contained" color="primary">
            {selectedCategory?.category_id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryManagement;
