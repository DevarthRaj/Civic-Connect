import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, Paper, Grid, FormControl, InputLabel, 
  Select, MenuItem, FormHelperText, Card, CardContent, CardHeader, CircularProgress, Alert, IconButton 
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { fileNewComplaint, getCategories } from "../../services/citizenService";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  category: Yup.string().required('Category is required'),
  location: Yup.string().required('Location is required'),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description should be at least 20 characters'),
  photo: Yup.mixed()
    .test('fileSize', 'File size too large', (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Unsupported file type', (value) => {
      if (!value) return true;
      return ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type);
    }),
});

const FileComplaint = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
        setError('Failed to load categories. Please refresh the page.');
      }
    };
    fetchCategories();
  }, []);

  const formik = useFormik({
    initialValues: {
      title: "",
      category: "",
      location: "",
      description: "",
      photo: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        setError('');

        await fileNewComplaint(values);

        setSubmitSuccess(true);
        formik.resetForm();
        setPreviewUrl('');

        // Redirect after a short delay
        setTimeout(() => navigate('/my-complaints'), 2000);
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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>Complaint Submitted Successfully!</Typography>
        <Typography color="textSecondary" paragraph>Your complaint has been received and is being processed.</Typography>
        <Typography color="textSecondary" paragraph>You will be redirected shortly...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">File a Complaint</Typography>
      </Box>

      <Typography variant="body1" color="textSecondary" paragraph>
        Please provide the details of your complaint. All fields marked with * are required.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={formik.touched.category && Boolean(formik.errors.category)} sx={{ mb: 3 }}>
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
                  <MenuItem value=""><em>Select a category</em></MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.category_id} value={cat.category_name}>{cat.category_name} ({cat.description})</MenuItem>
                  ))}
                </Select>
                <FormHelperText>{formik.touched.category && formik.errors.category}</FormHelperText>
              </FormControl>

              <TextField
                fullWidth id="location" name="location" label="Location *"
                value={formik.values.location} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={(formik.touched.location && formik.errors.location) || 'Enter the exact location of the issue'}
                sx={{ mb: 3 }}
              />
              <TextField
  fullWidth
  id="title"
  name="title"
  label="Title *"
  value={formik.values.title}
  onChange={formik.handleChange}
  onBlur={formik.handleBlur}
  error={formik.touched.title && Boolean(formik.errors.title)}
  helperText={formik.touched.title && formik.errors.title}
  sx={{ mb: 3 }}
/>


              <TextField
                fullWidth id="description" name="description" label="Description *" multiline rows={6}
                value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={(formik.touched.description && formik.errors.description) || 'Provide a detailed description (min. 20 characters)'}
                sx={{ mb: 3 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardHeader title="Add Photo (Optional)" subheader="Upload a photo that clearly shows the issue" />
                <CardContent>
                  {!previewUrl ? (
                    <Box
                      sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 1, p: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }}
                      onClick={() => document.getElementById('photo-upload').click()}
                    >
                      <CloudUploadIcon fontSize="large" color="action" />
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Click to upload or drag and drop</Typography>
                      <Typography variant="caption" color="textSecondary">JPG, PNG (max. 5MB)</Typography>
                      <input id="photo-upload" name="photo" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                    </Box>
                  ) : (
                    <Box sx={{ position: 'relative' }}>
  <Box
    component="img"
    src={previewUrl}
    alt="Preview"
    sx={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 1 }}
  />
  <IconButton
    onClick={removePhoto}
    sx={{
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'error.main',
      color: 'white',
      '&:hover': { backgroundColor: 'error.dark' },
    }}
    size="small"
  >
    ×
  </IconButton>
</Box>

                  )}
                  {formik.touched.photo && formik.errors.photo && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>{formik.errors.photo}</Typography>
                  )}
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} /> : null}>
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, backgroundColor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>Tips for a Better Complaint</Typography>
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
