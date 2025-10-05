import React from 'react';
import { Box, Container, Paper, Typography, useTheme, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AccountBalance as AccountBalanceIcon } from '@mui/icons-material';

const AuthContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 480,
  margin: '0 auto',
  borderRadius: 20,
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha('#ffffff', 0.95),
  border: `1px solid ${alpha('#ffffff', 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  }
}));

const BackgroundContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  position: 'relative',
  padding: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
  }
}));

const AuthLayout = ({ children }) => {
  const theme = useTheme();
  
  return (
    <BackgroundContainer>
      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <AuthContainer elevation={0}>
          {/* Logo and Branding */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 4,
              flexDirection: 'column'
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}
            >
              <AccountBalanceIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
                mb: 1
              }}
            >
              Civic Connect
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                textAlign: 'center',
                fontSize: '1.1rem'
              }}
            >
              Citizen Complaint Management Portal
            </Typography>
          </Box>
          
          {children}
          
          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © 2024 Civic Connect. All rights reserved.
            </Typography>
          </Box>
        </AuthContainer>
      </Container>
    </BackgroundContainer>
  );
};

export default AuthLayout;
