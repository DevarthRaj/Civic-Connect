import React from 'react';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  ListAlt as ListAltIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  ExitToApp as ExitToAppIcon,
  Home as HomeIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const isAdmin = user.role === 'admin';
  const isCitizen = user.role === 'citizen';
  const isOfficer = user.role === 'officer';

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Role-based menu items
  let menuItems = [
    ...(isCitizen
      ? [
          { text: 'Dashboard', icon: <HomeIcon />, path: '/citizen' },
          { text: 'File Complaint', icon: <AddCircleOutlineIcon />, path: '/file-complaint' },
          { text: 'My Complaints', icon: <ListAltIcon />, path: '/my-complaints' },
        ]
      : []),
    ...(isAdmin
      ? [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
          { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
          { text: 'Departments', icon: <CategoryIcon />, path: '/admin/departments' },
          { text: 'Categories', icon: <CategoryIcon />, path: '/admin/categories' },
          { text: 'Complaints', icon: <AssignmentIcon />, path: '/admin/complaints' },
          { text: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' },
        ]
      : []),
    ...(isOfficer
      ? [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/officer' },
          { text: 'All Complaints', icon: <AssignmentIcon />, path: '/officer/complaints' },
          { text: 'My Complaints', icon: <ListAltIcon />, path: '/officer/my-complaints' },
          { text: 'Reports', icon: <BarChartIcon />, path: '/officer/reports' },
        ]
      : []),
  ];

  if (menuItems.length === 0) {
    menuItems = [{ text: 'Home', icon: <HomeIcon />, path: '/' }];
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Top Navbar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Complaint Management System
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {user.name || 'User'}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<ExitToAppIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Divider />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': { backgroundColor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Page Content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, mt: 8, width: `calc(100% - ${drawerWidth}px)` }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
