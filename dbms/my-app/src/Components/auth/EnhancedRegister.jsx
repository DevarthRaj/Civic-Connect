import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert, 
  MenuItem, 
  CircularProgress, 
  Grid,
  InputAdornment,
  IconButton,
  Divider,
  Fade,
  Slide,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
  alpha
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  LocationCity as LocationCityIcon,
  Badge as BadgeIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../services/supabase';

const validationSchema = Yup.object().shape({
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
  address: Yup.string()
    .when('role', {
      is: 'citizen',
      then: (schema) => schema.required('Address is required for citizens'),
      otherwise: (schema) => schema.max(500, 'Address too long')
    }),
  city: Yup.string()
    .when('role', {
      is: 'citizen', 
      then: (schema) => schema.required('City is required for citizens'),
      otherwise: (schema) => schema.max(120, 'City too long')
    }),
  pincode: Yup.string()
    .when('role', {
      is: 'citizen',
      then: (schema) => schema.required('Pincode is required for citizens'), 
      otherwise: (schema) => schema.max(20, 'Pincode too long')
    }),
});

const roles = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'officer', label: 'Officer' },
  { value: 'admin', label: 'Admin' }
];

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [currentRole, setCurrentRole] = useState('citizen');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getSteps = (role) => {
    if (role === 'citizen') {
      return ['Personal Info', 'Account Details', 'Address Info'];
    } else {
      return ['Personal Info', 'Account Details', 'Review & Submit'];
    }
  };

  const steps = getSteps(currentRole);

  const validateCurrentStep = async (formikInstance) => {
    const currentStepFields = {
      0: ['name', 'username', 'citizenId'],
      1: ['email', 'password', 'confirmPassword', 'role'],
      2: currentRole === 'citizen' ? ['address', 'city', 'pincode'] : []
    };

    const fieldsToValidate = currentStepFields[activeStep] || [];
    
    // Touch all fields in current step to show validation errors
    fieldsToValidate.forEach(field => {
      formikInstance.setFieldTouched(field, true);
    });

    // Wait for validation to complete
    await formikInstance.validateForm();
    
    // Check if any of the current step fields have errors
    for (const field of fieldsToValidate) {
      if (!formikInstance.values[field] || formikInstance.errors[field]) {
        return false;
      }
    }
    
    // Special validation for password confirmation
    if (activeStep === 1 && formikInstance.values.password !== formikInstance.values.confirmPassword) {
      return false;
    }
    
    return true;
  };

  const handleNext = async (formikInstance) => {
    const isValid = await validateCurrentStep(formikInstance);
    if (isValid) {
      setActiveStep(activeStep + 1);
    }
  };

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
        
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('email')
          .eq('email', values.email)
          .single();

        if (existingUser) {
          throw new Error('A user with this email already exists. Please log in instead.');
        }
        
        // Sign up the user with Supabase Auth
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
          if (signUpError.message.includes('already registered')) {
            throw new Error('This email is already registered. Please log in instead.');
          } else if (signUpError.message.includes('Password should be')) {
            throw new Error('Password should be at least 6 characters long.');
          } else {
            throw signUpError;
          }
        }

        if (!authData.user) {
          throw new Error('Registration failed. Please try again.');
        }

        // Database trigger will handle user and citizen record creation automatically
        console.log('Registration completed via Supabase Auth and database trigger');

        console.log('Registration successful:', authData);
        setSuccess(true);
        resetForm();

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);

      } catch (err) {
        console.error('Registration error:', err);
        setError(err.message || 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    },
  });

  // Track role changes to update steps
  React.useEffect(() => {
    if (formik.values.role !== currentRole) {
      setCurrentRole(formik.values.role);
      // If we're on step 2 and role changed from citizen to non-citizen, stay on step 2
      // If we're on step 2 and role changed to citizen, we might need to go back to collect address
    }
  }, [formik.values.role, currentRole]);

  if (success) {
    return (
      <Fade in={success} timeout={800}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%'
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
              animation: 'pulse 2s infinite'
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Registration Successful!
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Welcome to Civic Connect! You will be redirected to the login page shortly...
          </Typography>
          
          <Button
            variant="contained"
            component={Link}
            to="/login"
            startIcon={<LoginIcon />}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            Go to Login
          </Button>
        </Box>
      </Fade>
    );
  }

  const renderStepContent = (step) => {
    const commonTextFieldProps = {
      fullWidth: true,
      disabled: isLoading,
      sx: {
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
      }
    };

    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                {...commonTextFieldProps}
                id="name"
                name="name"
                label="Full Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                {...commonTextFieldProps}
                id="username"
                name="username"
                label="Username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...commonTextFieldProps}
                id="citizenId"
                name="citizenId"
                label="Citizen ID"
                value={formik.values.citizenId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.citizenId && Boolean(formik.errors.citizenId)}
                helperText={formik.touched.citizenId && formik.errors.citizenId}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                {...commonTextFieldProps}
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                {...commonTextFieldProps}
                id="password"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                {...commonTextFieldProps}
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                {...commonTextFieldProps}
                select
                id="role"
                name="role"
                label="Account Type"
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.role && Boolean(formik.errors.role)}
                helperText={formik.touched.role && formik.errors.role}
              >
                {roles.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={option.label} 
                        size="small" 
                        color={option.value === 'admin' ? 'error' : option.value === 'officer' ? 'primary' : 'success'}
                        variant="outlined"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        );
      
      case 2:
        return formik.values.role === 'citizen' ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                {...commonTextFieldProps}
                id="address"
                name="address"
                label="Address"
                multiline
                minRows={3}
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <HomeIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                {...commonTextFieldProps}
                id="city"
                name="city"
                label="City"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationCityIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                {...commonTextFieldProps}
                id="pincode"
                name="pincode"
                label="Pincode"
                value={formik.values.pincode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.pincode && Boolean(formik.errors.pincode)}
                helperText={formik.touched.pincode && formik.errors.pincode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationCityIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Ready to Register!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All required information has been provided. Click "Create Account" to complete your registration.
            </Typography>
          </Box>
        );
      
      default:
        return null;
    }
  };

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
              <PersonAddIcon sx={{ fontSize: 28, color: 'white' }} />
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
              Join Civic Connect
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your account to start managing civic complaints
            </Typography>
          </Box>
        </Slide>
        
        {/* Progress Stepper */}
        <Slide direction="up" in={mounted} timeout={700}>
          <Paper 
            elevation={0} 
            sx={{ 
              width: '100%', 
              p: 3, 
              mb: 3, 
              backgroundColor: alpha('#667eea', 0.05),
              borderRadius: 2
            }}
          >
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontSize: '0.9rem',
                        fontWeight: 500
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
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
        
        {/* Registration Form */}
        <Slide direction="up" in={mounted} timeout={800}>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                mb: 3, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha('#667eea', 0.1)
              }}
            >
              {renderStepContent(activeStep)}
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={() => setActiveStep(activeStep - 1)}
                sx={{ 
                  px: 3,
                  borderRadius: 2,
                  color: '#667eea'
                }}
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
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
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                      Creating Account...
                    </Box>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => handleNext(formik)}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    }
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?
              </Typography>
            </Divider>
            
            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="/login"
              startIcon={<LoginIcon />}
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
              Sign In Instead
            </Button>
          </Box>
        </Slide>
      </Box>
    </Fade>
  );
};

export default Register;
