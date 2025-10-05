import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  useTheme,
  useMediaQuery
} from '@mui/material';
import EnhancedHeader from './EnhancedHeader';
import EnhancedSidebar from './EnhancedSidebar';

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Auto-collapse sidebar on mobile
  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <CssBaseline />
      
      {/* Enhanced Header */}
      <EnhancedHeader 
        onSidebarToggle={handleSidebarToggle}
        sidebarOpen={sidebarOpen}
      />
      
      {/* Enhanced Sidebar */}
      <EnhancedSidebar 
        open={sidebarOpen}
        onToggle={handleSidebarToggle}
      />
      
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create(['margin-left', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginTop: '64px', // Height of AppBar
          marginLeft: sidebarOpen 
            ? (isMobile ? 0 : '280px') 
            : (isMobile ? 0 : '70px'),
          width: sidebarOpen 
            ? (isMobile ? '100%' : 'calc(100% - 280px)')
            : (isMobile ? '100%' : 'calc(100% - 70px)'),
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#f8fafc',
          position: 'relative'
        }}
      >
        {/* Content Container */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            maxWidth: '100%',
            mx: 'auto'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
