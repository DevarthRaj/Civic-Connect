import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Mock data - in a real app, this would come from an API
const categories = [
  { id: 1, name: 'Garbage Collection', department: 'Sanitation' },
  { id: 2, name: 'Road Repair', department: 'Public Works' },
  { id: 3, name: 'Water Supply', department: 'Utilities' },
  { id: 4, name: 'Electricity', department: 'Utilities' },
  { id: 5, name: 'Street Lighting', department: 'Public Works' },
  { id: 6, name: 'Drainage', department: 'Public Works' },
];

const validationSchema = Yup.object({
  category: Yup.string().required('Category is required'),
  location: Yup.string().required('Location is required'),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description should be at least 20 characters'),
  photo: Yup.mixed()
    .test('fileSize', 'File size too large', (value) => {
      if (!value) return true; // No file is acceptable
      return value.size <= 5 * 1024 * 1024; // 5MB max
    })
    .test('fileType', 'Unsupported file type', (value) => {
      if (!value) return true; // No file is acceptable
      return ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type);
    }),
});

const FileComplaint = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const formik = useFormik({
    initialValues: {
      category: '',
      location: '',
      description: '',
      photo: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        setError('');
        
        // In a real app, you would upload the photo to a storage service
        // and then submit the complaint data to your API
        console.log('Submitting complaint:', values);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate successful submission
        const mockComplaint = {
          id: Math.floor(Math.random() * 1000) + 1000, // Random ID
          ...values,
          status: 'Pending',
          date: new Date().toISOString(),
          photoUrl: values.photo ? URL.createObjectURL(values.photo) : null,
        };
        
        console.log('Complaint submitted:', mockComplaint);
        setSubmitSuccess(true);
        
        // Reset form
        formik.resetForm();
        setPreviewUrl('');
        
        // Redirect to complaint details after a delay
        setTimeout(() => {
          navigate(`/complaint/${mockComplaint.id}`);
        }, 2000);
        
      } catch (err) {
        console.error('Error submitting complaint:', err);
        setError('Failed to submit complaint. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handlePhotoChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      formik.setFieldValue('photo', file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    formik.setFieldValue('photo', null);
    setPreviewUrl('');
  };

  if (submitSuccess) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
        }}
      >
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Complaint Submitted Successfully!
        </Typography>
        <Typography color="textSecondary" paragraph>
          Your complaint has been received and is being processed.
        </Typography>
        <Typography color="textSecondary" paragraph>
          You will be redirected to the complaint details shortly...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          File a Complaint
        </Typography>
      </Box>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Please provide the details of your complaint. All fields marked with * are required.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.category && Boolean(formik.errors.category)}
                sx={{ mb: 3 }}
              >
                <InputLabel id="category-label">Category *</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Category *"
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name} ({category.department})
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {formik.touched.category && formik.errors.category}
                </FormHelperText>
              </FormControl>
              
              <TextField
                fullWidth
                id="location"
                name="location"
                label="Location *"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={(formik.touched.location && formik.errors.location) || 'Enter the exact location of the issue'}
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description *"
                multiline
                rows={6}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={
                  (formik.touched.description && formik.errors.description) ||
                  'Please provide a detailed description of the issue (min. 20 characters)'
                }
                sx={{ mb: 3 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardHeader 
                  title="Add Photo (Optional)" 
                  subheader="Upload a photo that clearly shows the issue"
                />
                <CardContent>
                  {!previewUrl ? (
                    <Box
                      sx={{
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'action.hover',
                        },
                      }}
                      onClick={() => document.getElementById('photo-upload').click()}
                    >
                      <CloudUploadIcon fontSize="large" color="action" />
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Click to upload or drag and drop
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        JPG, PNG (max. 5MB)
                      </Typography>
                      <input
                        id="photo-upload"
                        name="photo"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handlePhotoChange}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={previewUrl}
                        alt="Preview"
                        sx={{
                          width: '100%',
                          maxHeight: 300,
                          objectFit: 'contain',
                          borderRadius: 1,
                        }}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={removePhoto}
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          minWidth: 'auto',
                          p: 0.5,
                          borderRadius: '50%',
                        }}
                      >
                        ×
                      </Button>
                    </Box>
                  )}
                  {formik.touched.photo && formik.errors.photo && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {formik.errors.photo}
                    </Typography>
                  )}
                </CardContent>
              </Card>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Paper elevation={2} sx={{ p: 3, backgroundColor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Tips for a Better Complaint
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Be specific about the location (include landmarks if possible)</li>
          <li>Provide a clear and detailed description of the issue</li>
          <li>Include photos that clearly show the problem</li>
          <li>Mention how long the issue has been persisting</li>
          <li>Provide your contact information if you're open to follow-up</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default FileComplaint;
