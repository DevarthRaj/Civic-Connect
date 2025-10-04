import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, Divider, Chip, CircularProgress,
  Alert, Avatar, List, ListItem, ListItemAvatar, ListItemText, TextField,
  Snackbar, IconButton
} from '@mui/material';
import { ArrowBack, Comment, Person, CheckCircle, Close } from '@mui/icons-material';
import { getComplaintById, submitFeedback } from "../../services/citizenService"; 

const statusColors = {
  'Pending': 'default',
  'In Progress': 'primary',
  'Resolved': 'success',
  'Rejected': 'error'
};

const ComplaintDetails = () => {
  const { id: complaintId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setError(null);
        const data = await getComplaintById(complaintId);
        console.log('Complaint data with photo URL:', data.photo_url);
        setComplaint(data);
      } catch (err) {
        console.error('Error fetching complaint', err);
        setError(err.message || 'Failed to load complaint details');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [complaintId]);

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    try {
      await submitFeedback(complaint.complaint_id, { 
        rating: 5, // Default rating, you can add a rating component
        comments: comment 
      });
      const updatedComplaint = await getComplaintById(complaintId);
      setComplaint(updatedComplaint);
      setComment('');
      showSnackbar('Feedback submitted successfully', 'success');
    } catch (err) {
      console.error(err);
      showSnackbar('Failed to add comment', 'error');
    }
  };

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return (
    <Box p={2}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/my-complaints')} sx={{ mb: 2 }}>
        Back to My Complaints
      </Button>
      <Alert severity="error">{error}</Alert>
    </Box>
  );
  if (!complaint) return <Alert severity="error">Complaint not found</Alert>;

  return (
    <Box p={2}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/my-complaints')}>
          Back to My Complaints
        </Button>
        <Typography variant="h5" ml={2}>
          Complaint #{complaint.complaint_id}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">{complaint.title}</Typography>
              <Chip 
                label={complaint.status} 
                color={statusColors[complaint.status] || 'default'}
                size="small"
              />
            </Box>

            <Typography variant="body1" paragraph>
              {complaint.description}
            </Typography>

            {complaint.photo_url && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Photo Evidence
                </Typography>
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <img 
                    src={complaint.photo_url} 
                    alt="Complaint evidence" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '400px', 
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: '1px solid #e0e0e0'
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', complaint.photo_url);
                    }}
                    onError={(e) => {
                      console.error('Failed to load image:', complaint.photo_url);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    color="error" 
                    sx={{ display: 'none', mt: 1, p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}
                  >
                    Failed to load image. The photo may have been moved or deleted.
                    <br />
                    <Typography variant="caption" component="span">
                      URL: {complaint.photo_url}
                    </Typography>
                  </Typography>
                </Box>
              </>
            )}

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="textSecondary">Category</Typography>
                <Typography>{complaint.categories?.category_name || '-'}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="textSecondary">Reported On</Typography>
                <Typography>{formatDate(complaint.created_at)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="textSecondary">Last Updated</Typography>
                <Typography>{formatDate(complaint.updated_at)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="textSecondary">Priority</Typography>
                <Chip 
                  label={complaint.priority} 
                  color={complaint.priority === 'High' ? 'error' : complaint.priority === 'Medium' ? 'warning' : 'success'} 
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" mb={2}>Comments / Feedback</Typography>
            <List>
              {complaint.feedback?.map((fb, index) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar><Person /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={fb.user_id || 'Anonymous'}
                    secondary={
                      <>
                        <Typography variant="caption" display="block">{formatDate(fb.created_at)}</Typography>
                        <Typography variant="body2">{fb.feedback}</Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Box mt={3}>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Box mt={1} display="flex" justifyContent="flex-end">
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleCommentSubmit}
                  startIcon={<Comment />}
                >
                  Post Comment
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {complaint.status === 'Resolved' && (
            <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="success"
                component={Link}
                to={`/feedback/${complaint.complaint_id}`}
                startIcon={<CheckCircle />}
              >
                Give Feedback
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        action={
          <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default ComplaintDetails;
