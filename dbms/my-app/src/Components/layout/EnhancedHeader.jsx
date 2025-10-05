import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Badge,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Search as SearchIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EnhancedHeader = ({ onSidebarToggle, sidebarOpen }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
    handleProfileMenuClose();
  };

  const handleProfile = () => {
    // Navigate to profile page based on role
    const profilePaths = {
      citizen: '/citizen',
      officer: '/officer',
      admin: '/admin'
    };
    navigate(profilePaths[user.role] || '/');
    handleProfileMenuClose();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Here you would typically update your theme context
  };

  // Role-based color schemes
  const getRoleColors = () => {
    switch (user.role) {
      case 'admin':
        return {
          primary: '#e53e3e',
          secondary: '#fed7d7',
          accent: '#c53030'
        };
      case 'officer':
        return {
          primary: '#3182ce',
          secondary: '#bee3f8',
          accent: '#2c5282'
        };
      case 'citizen':
        return {
          primary: '#38a169',
          secondary: '#c6f6d5',
          accent: '#2f855a'
        };
      default:
        return {
          primary: '#1976d2',
          secondary: '#e3f2fd',
          accent: '#1565c0'
        };
    }
  };

  const roleColors = getRoleColors();

  // Mock notifications (you can replace with real data)
  const notifications = [
    { id: 1, title: 'New complaint assigned', time: '2 min ago', type: 'info' },
    { id: 2, title: 'Status update required', time: '1 hour ago', type: 'warning' },
    { id: 3, title: 'Report generated', time: '3 hours ago', type: 'success' }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleDisplayName = () => {
    return user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: `linear-gradient(135deg, ${roleColors.primary} 0%, ${roleColors.accent} 100%)`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 3 } }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={onSidebarToggle}
            sx={{
              mr: 2,
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.1),
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box>
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                background: 'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.8) 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Civic Connect
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: alpha('#ffffff', 0.8),
                fontSize: '0.75rem',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {getGreeting()}, {user.name || 'User'}
            </Typography>
          </Box>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Search Button */}
          <Tooltip title="Search">
            <IconButton
              color="inherit"
              sx={{
                display: { xs: 'none', md: 'flex' },
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.1),
                  transform: 'scale(1.05)'
                }
              }}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationOpen}
              sx={{
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.1),
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Dark Mode Toggle */}
          <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton
              color="inherit"
              onClick={toggleDarkMode}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.1),
                  transform: 'scale(1.05)'
                }
              }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 2, textAlign: 'right' }}>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                {user.name || 'User Name'}
              </Typography>
              <Chip
                label={getRoleDisplayName()}
                size="small"
                sx={{
                  bgcolor: alpha('#ffffff', 0.2),
                  color: 'white',
                  fontSize: '0.7rem',
                  height: '20px'
                }}
              />
            </Box>
            
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  p: 0,
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha('#ffffff', 0.2),
                    color: 'white',
                    width: 40,
                    height: 40,
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            minWidth: 220,
            borderRadius: 2,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: alpha(roleColors.primary, 0.1)
              }
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Profile Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user.name || 'User Name'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email || 'user@example.com'}
          </Typography>
          <Chip
            label={getRoleDisplayName()}
            size="small"
            sx={{
              mt: 1,
              bgcolor: alpha(roleColors.primary, 0.1),
              color: roleColors.primary
            }}
          />
        </Box>

        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <HelpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Help & Support</ListItemText>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            minWidth: 300,
            maxWidth: 400,
            borderRadius: 2
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You have {notifications.length} new notifications
          </Typography>
        </Box>

        {notifications.map((notification) => (
          <MenuItem key={notification.id} sx={{ py: 1.5, alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {notification.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.time}
              </Typography>
            </Box>
          </MenuItem>
        ))}

        <Divider />
        <MenuItem sx={{ justifyContent: 'center', py: 1 }}>
          <Button size="small" color="primary">
            View All Notifications
          </Button>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default EnhancedHeader;
