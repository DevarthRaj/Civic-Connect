import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress, 
  Grid,
  InputAdornment,
  IconButton,
  Divider,
  Fade,
  Slide,
  alpha
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../services/supabase';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setError('');
      setLoading(true);
      
      try {
        // Sign in with Supabase
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (signInError) {
          console.error('Login error:', signInError);
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password');
          } else if (signInError.message.includes('Email not confirmed')) {
            throw new Error('Please confirm your email before logging in');
          } else {
            throw signInError;
          }
        }

        // Get user data from your users table with robust error handling
        let userData = null;
        // Get the current authenticated user's ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Authentication failed. Please try again.');
        }

        const userId = user.id;
        console.log('Authenticated user:', userId);

        // Prefer lookup by user_id (stable, not affected by email changes)
        const { data: foundUser, error: selectErr } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (selectErr) {
          // Likely an RLS policy issue; log and continue with fallback attempts
          console.warn('User select error (continuing with fallback):', selectErr?.message || selectErr);
        }

        if (foundUser) {
          userData = foundUser;
        } else {
          // Try to create or ensure a row exists using upsert (idempotent)
          const fallbackName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
          const fallbackRole = (user.user_metadata?.role || 'citizen').toLowerCase();
          const { data: upserted, error: upsertErr } = await supabase
            .from('users')
            .upsert(
              [{
                user_id: userId,
                email: user.email,
                name: fallbackName,
                role: fallbackRole,
              }],
              { onConflict: 'user_id' }
            )
            .select()
            .maybeSingle();

          if (upsertErr) {
            // If even upsert is blocked (RLS), fall back to using auth metadata only
            console.warn('User upsert error (falling back to auth metadata):', upsertErr?.message || upsertErr);
            userData = {
              user_id: userId,
              email: user.email,
              name: fallbackName,
              role: fallbackRole,
            };
          } else {
            userData = upserted || {
              user_id: userId,
              email: user.email,
              name: fallbackName,
              role: fallbackRole,
            };
          }
        }
        console.log('Resolved user profile:', userData);

        // Store user session with validated data
        const userSession = {
          id: authData.user.id,
          email: authData.user.email,
          name: userData.name,
          role: userData.role,
          token: authData.session.access_token,
        };
        
        console.log('Creating user session:', userSession);

        localStorage.setItem('user', JSON.stringify(userSession));
        localStorage.setItem('token', userSession.token);

        // Redirect based on validated role
        switch((userData.role || 'citizen').toLowerCase()) {
          case 'admin':
            console.log('Redirecting to admin dashboard');
            navigate('/admin');
            break;
          case 'officer':
            console.log('Redirecting to officer dashboard');
            navigate('/officer');
            break;
          case 'citizen':
            console.log('Redirecting to citizen dashboard');
            navigate('/citizen');
            break;
          default:
            console.error('Unknown role:', userData.role);
            throw new Error('Invalid user role. Please contact support.');
        }
      } catch (err) {
        setError(err.message || 'An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Fade in={mounted} timeout={800}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
        }}
      >
        {/* Header Section */}
        <Slide direction="down" in={mounted} timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              <LoginIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to access your dashboard
            </Typography>
          </Box>
        </Slide>
        
        {/* Error Alert */}
        {error && (
          <Slide direction="up" in={Boolean(error)} timeout={400}>
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: '1.2rem'
                }
              }}
            >
              {error}
            </Alert>
          </Slide>
        )}
        
        {/* Login Form */}
        <Slide direction="up" in={mounted} timeout={800}>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || formik.isSubmitting}
              sx={{ 
                mt: 4, 
                mb: 3, 
                py: 1.8,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
                },
                '&:disabled': {
                  background: alpha('#667eea', 0.6)
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  Signing in...
                </Box>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                New to Civic Connect?
              </Typography>
            </Divider>
            
            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="/register"
              startIcon={<PersonAddIcon />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                borderColor: alpha('#667eea', 0.3),
                color: '#667eea',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#667eea',
                  backgroundColor: alpha('#667eea', 0.05),
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                }
              }}
            >
              Create New Account
            </Button>
          </Box>
        </Slide>
      </Box>
    </Fade>
  );
};

export default Login;
