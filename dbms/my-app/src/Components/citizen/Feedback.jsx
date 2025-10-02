import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, Button, Rating, Divider,
  Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import { ArrowBack, Star, StarBorder, Send } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { addFeedback } from "../../services/complaintService";

const Feedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    satisfaction: '',
    resolutionTime: '',
    wouldRecommend: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      setError('Please provide a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ Call service
      await addFeedback({
        complaint_id: id,
        rating: formData.rating,
        comment: formData.comment,
        satisfaction: formData.satisfaction,
        resolution_time: formData.resolutionTime,
        would_recommend: formData.wouldRecommend,
        created_at: new Date()
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Box maxWidth={800} mx="auto" p={3}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            Back
          </Button>
          <Typography variant="h5">Feedback Submitted</Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Box mb={3}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
          </Box>
          <Typography variant="h5" gutterBottom>
            Thank You for Your Feedback!
          </Typography>
          <Typography color="textSecondary" paragraph>
            We appreciate you taking the time to provide feedback on your experience.
            Your input helps us improve our services.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/complaints/${id}`)}
            sx={{ mt: 2 }}
          >
            Back to Complaint
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box maxWidth={800} mx="auto" p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h5">Provide Feedback</Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Complaint #: {id}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          We value your feedback. Please take a moment to rate your experience and provide any comments.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box mb={4}>
            <Typography component="legend" gutterBottom>
              Overall Rating
            </Typography>
            <Rating
              name="rating"
              value={formData.rating}
              onChange={handleRatingChange}
              precision={0.5}
              size="large"
              icon={<Star fontSize="inherit" />}
              emptyIcon={<StarBorder fontSize="inherit" />}
              sx={{
                '& .MuiRating-iconFilled': { color: '#1976d2' },
                '& .MuiRating-iconHover': { color: '#1565c0' },
              }}
            />
          </Box>

          <Box mb={3}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Your Comments"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Please provide any additional comments..."
            />
          </Box>

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Satisfaction</InputLabel>
                <Select
                  name="satisfaction"
                  value={formData.satisfaction}
                  onChange={handleChange}
                  label="Satisfaction"
                >
                  <MenuItem value=""><em>Select</em></MenuItem>
                  <MenuItem value="very-satisfied">Very Satisfied</MenuItem>
                  <MenuItem value="satisfied">Satisfied</MenuItem>
                  <MenuItem value="neutral">Neutral</MenuItem>
                  <MenuItem value="dissatisfied">Dissatisfied</MenuItem>
                  <MenuItem value="very-dissatisfied">Very Dissatisfied</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Resolution Time</InputLabel>
                <Select
                  name="resolutionTime"
                  value={formData.resolutionTime}
                  onChange={handleChange}
                  label="Resolution Time"
                >
                  <MenuItem value=""><em>Select</em></MenuItem>
                  <MenuItem value="yes">Yes, very quickly</MenuItem>
                  <MenuItem value="somewhat">Somewhat timely</MenuItem>
                  <MenuItem value="no">No, too long</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Would Recommend</InputLabel>
                <Select
                  name="wouldRecommend"
                  value={formData.wouldRecommend}
                  onChange={handleChange}
                  label="Would Recommend"
                >
                  <MenuItem value=""><em>Select</em></MenuItem>
                  <MenuItem value="definitely">Definitely</MenuItem>
                  <MenuItem value="probably">Probably</MenuItem>
                  <MenuItem value="not-sure">Not Sure</MenuItem>
                  <MenuItem value="probably-not">Probably Not</MenuItem>
                  <MenuItem value="definitely-not">Definitely Not</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" mt={4}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              size="large"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Feedback;
