import React, { useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip,
  FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText,
  ListItemSecondaryAction, Switch, Divider, Grid, Avatar
} from '@mui/material';
import {
  Category as CategoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Label as LabelIcon
} from '@mui/icons-material';

const CategoryManagement = () => {
  // Mock data
  const categories = [
    { 
      id: 1, 
      name: 'Sanitation', 
      description: 'Garbage collection, street cleaning, and waste management',
      icon: 'delete',
      color: '#4caf50',
      isActive: true,
      subcategories: [
        { id: 101, name: 'Garbage Collection', isActive: true },
        { id: 102, name: 'Street Cleaning', isActive: true },
        { id: 103, name: 'Recycling', isActive: false },
      ]
    },
    { 
      id: 2, 
      name: 'Infrastructure', 
      description: 'Roads, bridges, and public infrastructure maintenance',
      icon: 'build',
      color: '#2196f3',
      isActive: true,
      subcategories: [
        { id: 201, name: 'Potholes', isActive: true },
        { id: 202, name: 'Street Lights', isActive: true },
      ]
    },
    { 
      id: 3, 
      name: 'Parks & Recreation', 
      description: 'Public parks, playgrounds, and recreational facilities',
      icon: 'park',
      color: '#9c27b0',
      isActive: true,
      subcategories: [
        { id: 301, name: 'Playground Equipment', isActive: true },
        { id: 302, name: 'Grass Cutting', isActive: true },
      ]
    },
  ];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openSubcategoryDialog, setOpenSubcategoryDialog] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [newSubcategory, setNewSubcategory] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Icons mapping
  const iconComponents = {
    delete: <DeleteIcon />,
    build: <span>🔨</span>,
    park: <span>🌳</span>,
    default: <CategoryIcon />
  };

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

  const handleOpenDialog = (category = null) => {
    setSelectedCategory(category || { 
      name: '', 
      description: '',
      icon: 'default',
      color: '#1976d2',
      isActive: true,
      subcategories: []
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
  };

  const handleToggleCategory = (categoryId) => {
    // In a real app, this would be an API call
    console.log('Toggling category:', categoryId);
  };

  const handleSaveCategory = () => {
    // In a real app, this would be an API call
    console.log('Saving category:', selectedCategory);
    handleCloseDialog();
  };

  const handleDeleteCategory = (categoryId) => {
    // In a real app, this would be an API call
    console.log('Deleting category:', categoryId);
  };

  const handleOpenSubcategoryDialog = (category, subcategory = null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    if (subcategory) {
      setNewSubcategory(subcategory.name);
    } else {
      setNewSubcategory('');
    }
    setOpenSubcategoryDialog(true);
  };

  const handleCloseSubcategoryDialog = () => {
    setOpenSubcategoryDialog(false);
    setSelectedSubcategory(null);
    setNewSubcategory('');
  };

  const handleSaveSubcategory = () => {
    // In a real app, this would be an API call
    console.log('Saving subcategory for category:', selectedCategory.id);
    console.log('Subcategory data:', { 
      name: newSubcategory,
      isActive: selectedSubcategory ? selectedSubcategory.isActive : true
    });
    handleCloseSubcategoryDialog();
  };

  const handleToggleSubcategory = (categoryId, subcategoryId) => {
    // In a real app, this would be an API call
    console.log('Toggling subcategory:', { categoryId, subcategoryId });
  };

  const handleDeleteSubcategory = (categoryId, subcategoryId) => {
    // In a real app, this would be an API call
    console.log('Deleting subcategory:', { categoryId, subcategoryId });
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpandCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Category Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          }}
        />
      </Paper>

      <Grid container spacing={3}>
        {filteredCategories.map((category) => (
          <Grid item xs={12} key={category.id}>
            <Paper elevation={3}>
              <Box 
                p={2} 
                sx={{ 
                  backgroundColor: `${category.color}10`,
                  borderLeft: `4px solid ${category.color}`,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: `${category.color}15` }
                }}
                onClick={() => toggleExpandCategory(category.id)}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: category.color, mr: 2 }}>
                      {iconComponents[category.icon] || iconComponents.default}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{category.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {category.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Chip 
                      label={category.isActive ? 'Active' : 'Inactive'} 
                      color={category.isActive ? 'success' : 'default'}
                      size="small"
                      sx={{ mr: 2 }}
                    />
                    <Switch 
                      checked={category.isActive}
                      onChange={() => handleToggleCategory(category.id)}
                      color="primary"
                    />
                  </Box>
                </Box>
              </Box>
              
              {expandedCategory === category.id && (
                <Box>
                  <Box display="flex" justifyContent="space-between" p={2} bgcolor="#f9f9f9">
                    <Typography variant="subtitle2">SUBCATEGORIES</Typography>
                    <Button 
                      size="small" 
                      startIcon={<AddIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSubcategoryDialog(category);
                      }}
                    >
                      Add Subcategory
                    </Button>
                  </Box>
                  
                  <List dense>
                    {category.subcategories.map((subcategory) => (
                      <React.Fragment key={subcategory.id}>
                        <ListItem>
                          <ListItemText 
                            primary={subcategory.name}
                            primaryTypographyProps={{
                              color: subcategory.isActive ? 'textPrimary' : 'textSecondary',
                                              textDecoration: subcategory.isActive ? 'none' : 'line-through'
                            }}
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSubcategoryDialog(category, subcategory);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              edge="end" 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSubcategory(category.id, subcategory.id);
                              }}
                            >
                              {subcategory.isActive ? (
                                <CheckCircleIcon fontSize="small" color="success" />
                              ) : (
                                <CancelIcon fontSize="small" color="error" />
                              )}
                            </IconButton>
                            <IconButton 
                              edge="end" 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSubcategory(category.id, subcategory.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" color="error" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                    
                    {category.subcategories.length === 0 && (
                      <Box p={2} textAlign="center">
                        <Typography variant="body2" color="textSecondary">
                          No subcategories found. Click "Add Subcategory" to create one.
                        </Typography>
                      </Box>
                    )}
                  </List>
                </Box>
              )}
              
              <Box p={2} display="flex" justifyContent="flex-end" bgcolor="#f5f5f5">
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDialog(category);
                  }}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category.id);
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCategory?.id ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={selectedCategory?.name || ''}
              onChange={(e) => setSelectedCategory({...selectedCategory, name: e.target.value})}
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
              <InputLabel>Icon</InputLabel>
              <Select
                value={selectedCategory?.icon || 'default'}
                label="Icon"
                onChange={(e) => setSelectedCategory({...selectedCategory, icon: e.target.value})}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="delete">Trash</MenuItem>
                <MenuItem value="build">Build</MenuItem>
                <MenuItem value="park">Park</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="color"
              label="Color"
              value={selectedCategory?.color || '#1976d2'}
              onChange={(e) => setSelectedCategory({...selectedCategory, color: e.target.value})}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Box display="flex" alignItems="center" mt={2}>
              <Switch 
                checked={selectedCategory?.isActive ?? true}
                onChange={(e) => setSelectedCategory({...selectedCategory, isActive: e.target.checked})}
                color="primary"
              />
              <Typography>Active</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained" color="primary">
            {selectedCategory?.id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Subcategory Dialog */}
      <Dialog open={openSubcategoryDialog} onClose={handleCloseSubcategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Subcategory Name"
              value={newSubcategory}
              onChange={(e) => setNewSubcategory(e.target.value)}
              margin="normal"
              required
              autoFocus
            />
            {selectedSubcategory && (
              <Box display="flex" alignItems="center" mt={2}>
                <Switch 
                  checked={selectedSubcategory?.isActive ?? true}
                  onChange={(e) => setSelectedSubcategory({...selectedSubcategory, isActive: e.target.checked})}
                  color="primary"
                />
                <Typography>Active</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubcategoryDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveSubcategory} 
            variant="contained" 
            color="primary"
            disabled={!newSubcategory.trim()}
          >
            {selectedSubcategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManagement;
