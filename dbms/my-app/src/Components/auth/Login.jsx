import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert, CircularProgress, Grid } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          margin: 1,
          backgroundColor: 'primary.main',
          borderRadius: '50%',
          width: 50,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          mb: 2,
        }}
      >
        <LockOutlinedIcon />
      </Box>
      <Typography component="h1" variant="h5">
        Sign in
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={loading}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5 }}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link to="/register" variant="body2" style={{ textDecoration: 'none', color: 'inherit' }}>
              Don't have an account? Sign up
            </Link>
          </Grid>
        </Grid>
      </Box>
      
    </Box>
  );
};

export default Login;
