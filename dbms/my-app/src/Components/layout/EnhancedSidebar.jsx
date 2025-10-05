import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  ListAlt as ListAltIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Home as HomeIcon,
  BarChart as BarChartIcon,
  Business as BusinessIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;
const collapsedWidth = 70;

const EnhancedSidebar = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  const [expandedItems, setExpandedItems] = useState({});

  const isAdmin = user.role === 'admin';
  const isCitizen = user.role === 'citizen';
  const isOfficer = user.role === 'officer';

  const handleExpandClick = (itemKey) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
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

  // Enhanced menu items with grouping
  const getMenuItems = () => {
    const baseItems = [];

    if (isCitizen) {
      baseItems.push(
        {
          key: 'citizen-main',
          type: 'group',
          title: 'Main Menu',
          items: [
            { text: 'Dashboard', icon: <HomeIcon />, path: '/citizen', badge: null },
            { text: 'File Complaint', icon: <AddCircleOutlineIcon />, path: '/file-complaint', badge: 'New' },
            { text: 'My Complaints', icon: <ListAltIcon />, path: '/my-complaints', badge: null }
          ]
        }
      );
    }

    if (isAdmin) {
      baseItems.push(
        {
          key: 'admin-main',
          type: 'group',
          title: 'Administration',
          items: [
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin', badge: null },
            { text: 'Users', icon: <PeopleIcon />, path: '/admin/users', badge: null },
            { text: 'Departments', icon: <BusinessIcon />, path: '/admin/departments', badge: null },
            { text: 'Categories', icon: <CategoryIcon />, path: '/admin/categories', badge: null }
          ]
        },
        {
          key: 'admin-complaints',
          type: 'group',
          title: 'Complaint Management',
          items: [
            { text: 'All Complaints', icon: <AssignmentIcon />, path: '/admin/complaints', badge: null },
            { text: 'Reports & Analytics', icon: <AssessmentIcon />, path: '/admin/reports', badge: null }
          ]
        }
      );
    }

    if (isOfficer) {
      baseItems.push(
        {
          key: 'officer-main',
          type: 'group',
          title: 'Officer Panel',
          items: [
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/officer', badge: null },
            { text: 'All Complaints', icon: <AssignmentIcon />, path: '/officer/complaints', badge: null },
            { text: 'My Department', icon: <BusinessIcon />, path: '/officer/my-complaints', badge: null },
            { text: 'Reports', icon: <BarChartIcon />, path: '/officer/reports', badge: null }
          ]
        }
      );
    }

    return baseItems;
  };

  const menuGroups = getMenuItems();

  const SidebarContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <Box
        sx={{
          p: open ? 3 : 1,
          background: `linear-gradient(135deg, ${roleColors.primary} 0%, ${roleColors.accent} 100%)`,
          color: 'white',
          textAlign: open ? 'left' : 'center',
          transition: 'all 0.3s ease'
        }}
      >
        {open ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha('#ffffff', 0.2),
                  color: 'white',
                  mr: 2,
                  width: 48,
                  height: 48
                }}
              >
                <AccountCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {user.name || 'User'}
                </Typography>
                <Chip
                  label={user.role?.toUpperCase() || 'USER'}
                  size="small"
                  sx={{
                    bgcolor: alpha('#ffffff', 0.2),
                    color: 'white',
                    fontSize: '0.7rem',
                    height: '20px'
                  }}
                />
              </Box>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
              Civic Connect Portal
            </Typography>
          </>
        ) : (
          <Tooltip title={`${user.name} (${user.role})`} placement="right">
            <Avatar
              sx={{
                bgcolor: alpha('#ffffff', 0.2),
                color: 'white',
                width: 40,
                height: 40,
                mx: 'auto'
              }}
            >
              <AccountCircleIcon />
            </Avatar>
          </Tooltip>
        )}
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
        {menuGroups.map((group, groupIndex) => (
          <Box key={group.key}>
            {open && (
              <Typography
                variant="overline"
                sx={{
                  px: 3,
                  py: 1,
                  display: 'block',
                  color: 'text.secondary',
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  letterSpacing: '0.5px'
                }}
              >
                {group.title}
              </Typography>
            )}
            
            <List sx={{ py: 0 }}>
              {group.items.map((item) => {
                const isSelected = location.pathname === item.path;
                
                return (
                  <Tooltip
                    key={item.text}
                    title={!open ? item.text : ''}
                    placement="right"
                  >
                    <ListItem
                      button
                      onClick={() => navigate(item.path)}
                      sx={{
                        mx: open ? 1 : 0.5,
                        mb: 0.5,
                        borderRadius: open ? 2 : 1,
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: open ? 2 : 1,
                        backgroundColor: isSelected 
                          ? alpha(roleColors.primary, 0.1)
                          : 'transparent',
                        borderLeft: isSelected 
                          ? `4px solid ${roleColors.primary}`
                          : '4px solid transparent',
                        '&:hover': {
                          backgroundColor: alpha(roleColors.primary, 0.05),
                          transform: 'translateX(4px)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                          color: isSelected ? roleColors.primary : 'text.secondary',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      
                      {open && (
                        <ListItemText
                          primary={item.text}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.9rem',
                              fontWeight: isSelected ? 600 : 400,
                              color: isSelected ? roleColors.primary : 'text.primary'
                            }
                          }}
                        />
                      )}
                      
                      {open && item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          sx={{
                            bgcolor: roleColors.secondary,
                            color: roleColors.primary,
                            fontSize: '0.7rem',
                            height: '20px'
                          }}
                        />
                      )}
                    </ListItem>
                  </Tooltip>
                );
              })}
            </List>
            
            {groupIndex < menuGroups.length - 1 && (
              <Divider sx={{ mx: 2, my: 1, opacity: 0.3 }} />
            )}
          </Box>
        ))}
      </Box>

      {/* Footer Section */}
      <Box
        sx={{
          p: open ? 2 : 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: alpha(roleColors.primary, 0.02)
        }}
      >
        {open ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Civic Connect v2.0
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              © 2024 All Rights Reserved
            </Typography>
          </Box>
        ) : (
          <Tooltip title="Civic Connect v2.0" placement="right">
            <Box sx={{ textAlign: 'center' }}>
              <SettingsIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={isMobile ? onToggle : undefined}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        width: open ? drawerWidth : (isMobile ? 0 : collapsedWidth),
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : (isMobile ? drawerWidth : collapsedWidth),
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
          borderRight: 'none',
          zIndex: theme.zIndex.drawer + 2
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
};

export default EnhancedSidebar;
