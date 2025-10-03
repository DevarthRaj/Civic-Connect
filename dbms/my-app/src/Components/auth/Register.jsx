import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert, MenuItem, CircularProgress, Grid } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../services/supabase';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  username: Yup.string()
    .matches(/^[a-zA-Z0-9_\.\-]{3,30}$/,
      '3-30 chars, letters, numbers, underscore, dot or hyphen')
    .required('Username is required'),
  citizenId: Yup.string().required('Citizen ID is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  role: Yup.string().required('Role is required'),
  // Address fields are optional here but can be required for specific roles if needed
  address: Yup.string().max(500, 'Address too long'),
  city: Yup.string().max(120, 'City too long'),
  pincode: Yup.string().max(20, 'Pincode too long'),
});

const roles = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'officer', label: 'Officer' },
  // In a real app, only admins should be able to create admin accounts
  { value: 'admin', label: 'Admin' }
  // { value: 'admin', label: 'Administrator' },
];

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      username: '',
      citizenId: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'citizen',
      address: '',
      city: '',
      pincode: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setError('');
      setSuccess(false);
      setIsLoading(true);
      
      try {
        console.log('Attempting to register user:', values.email);
        
        // 1. First check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('email')
          .eq('email', values.email)
          .single();

        if (existingUser) {
          throw new Error('A user with this email already exists. Please log in instead.');
        }
        
        // 2. Sign up the user with Supabase Auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              name: values.name,
              role: values.role,
              username: values.username,
              citizenId: values.citizenId,
              address: values.address,
              city: values.city,
              pincode: values.pincode,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          console.error('Signup error:', signUpError);
          // Handle specific error cases
          if (signUpError.message.includes('already registered')) {
            throw new Error('This email is already registered. Please log in instead.');
          } else if (signUpError.status === 429) {
            throw new Error('Too many attempts. Please wait a few minutes before trying again.');
          } else {
            throw signUpError;
          }
        }

        console.log('Auth response:', authData);

        // 3. Add user to your custom users table using a stored procedure
        if (authData.user) {
          const looksLikeUuid = (s) => typeof s === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(s);
          const { data, error: dbError } = await supabase.rpc('handle_new_user_registration', {
            p_user_id: authData.user.id,
            p_email: values.email,
            p_name: values.name,
            p_role: values.role,
            p_citizen_id: looksLikeUuid(values.citizenId) ? values.citizenId : null,
            p_address: values.address || null,
            p_city: values.city || null,
            p_pincode: values.pincode || null,
          });

          if (dbError) {
            console.error('Database error:', dbError);
            throw dbError;
          }

          // Citizens profile is created inside the RPC (SECURITY DEFINER). No client-side insert needed.
        }

        setSuccess(true);
        setError('');
        resetForm();
        
        // Auto-redirect to login after 5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
        
      } catch (err) {
        console.error('Registration error:', err);
        setError(err.message || 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    },
  });

  if (success) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            margin: 1,
            backgroundColor: 'success.main',
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
          ✓
        </Box>
        <Typography component="h1" variant="h5" gutterBottom>
          Registration Successful!
        </Typography>
        <Typography variant="body1">
          You will be redirected to the login page shortly...
        </Typography>
      </Box>
    );
  }

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
        <PersonAddIcon />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Registration successful! Please check your email to confirm your account.
          {formik.values.role === 'citizen' && (
            <Box mt={1}>
              You'll be able to log in after your account is approved by an administrator.
            </Box>
          )}
        </Alert>
      )}
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Full Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="username"
              name="username"
              label="Username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="citizenId"
              name="citizenId"
              label="Citizen ID"
              value={formik.values.citizenId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.citizenId && Boolean(formik.errors.citizenId)}
              helperText={formik.touched.citizenId && formik.errors.citizenId}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              id="role"
              name="role"
              label="Role"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.role && Boolean(formik.errors.role)}
              helperText={formik.touched.role && formik.errors.role}
              disabled={isLoading}
            >
              {roles.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          {formik.values.role === 'citizen' && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  label="Address"
                  multiline
                  minRows={2}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="city"
                  name="city"
                  label="City"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.city && Boolean(formik.errors.city)}
                  helperText={formik.touched.city && formik.errors.city}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="pincode"
                  name="pincode"
                  label="Pincode"
                  value={formik.values.pincode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.pincode && Boolean(formik.errors.pincode)}
                  helperText={formik.touched.pincode && formik.errors.pincode}
                  disabled={isLoading}
                />
              </Grid>
            </>
          )}
          
          <Grid item xs={12}>
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={formik.isSubmitting || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <PersonAddIcon />}
              sx={{ mt: 2 }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Grid>
        </Grid>
      </form>
      
      <Box mt={3} textAlign="center">
        <Typography variant="body2">
          Already have an account?{' '}
          <Link to="/login" style={{ textDecoration: 'none' }}>
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
