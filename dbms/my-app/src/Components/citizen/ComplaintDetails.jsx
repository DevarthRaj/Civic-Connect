import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, Divider, Chip, CircularProgress,
  Alert, Avatar, List, ListItem, ListItemAvatar, ListItemText, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Rating, Snackbar
} from '@mui/material';
import {
  ArrowBack, Comment, Person, AccessTime, LocationOn, Category,
  Description, Image, CheckCircle, Close, Star, StarBorder, Edit
} from '@mui/icons-material';

// Simulate fetching complaint by ID (replace with real API call)
const fetchComplaintById = async (complaintId) => {
  // Simulate different complaints for demo
  const mockComplaints = [
    {
      id: 'CMP-1001',
      title: 'Garbage not collected',
      category: 'Garbage Collection',
      department: 'Sanitation',
      location: '123 Main St',
      description: 'Garbage has not been collected for 3 days.',
      status: 'Resolved',
      priority: 'High',
      dateCreated: '2023-10-15T10:30:00',
      lastUpdated: '2023-10-16T14:20:00',
      assignedTo: 'John Smith',
      images: ['https://via.placeholder.com/800x400?text=Garbage+Not+Collected'],
      updates: [
        {
          id: 1,
          type: 'status',
          title: 'Status Updated',
          description: 'Complaint registered',
          date: '2023-10-15T11:15:00',
          user: 'System'
        },
        {
          id: 2,
          type: 'status',
          title: 'Assigned',
          description: 'Assigned to John Smith',
          date: '2023-10-15T12:00:00',
          user: 'Admin'
        },
        {
          id: 3,
          type: 'status',
          title: 'Resolved',
          description: 'Complaint resolved by John Smith',
          date: '2023-10-16T14:00:00',
          user: 'John Smith'
        }
      ]
    },
    {
      id: 'CMP-1002',
      title: 'Street light not working',
      category: 'Electricity',
      department: 'Electrical',
      location: '456 Park Ave',
      description: 'Street light has been out for a week.',
      status: 'In Progress',
      priority: 'Medium',
      dateCreated: '2023-10-10T09:00:00',
      lastUpdated: '2023-10-12T10:00:00',
      assignedTo: 'Jane Doe',
      images: [],
      updates: [
        {
          id: 1,
          type: 'status',
          title: 'Status Updated',
          description: 'Complaint registered',
          date: '2023-10-10T09:15:00',
          user: 'System'
        },
        {
          id: 2,
          type: 'status',
          title: 'Assigned',
          description: 'Assigned to Jane Doe',
          date: '2023-10-10T10:00:00',
          user: 'Admin'
        }
      ]
    }
  ];
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockComplaints.find(c => c.id === complaintId));
    }, 500);
  });
};

const statusColors = {
  'Pending': 'default',
  'In Progress': 'primary',
  'Resolved': 'success',
  'Rejected': 'error'
};

const ComplaintDetails = () => {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [comment, setComment] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const data = await fetchComplaintById(complaintId);
        setComplaint(data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [complaintId]);

  const handleCommentSubmit = () => {
    if (!comment.trim()) return;
    
    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'comment',
      title: 'New Comment',
      description: comment,
      date: new Date().toISOString(),
      user: 'You'
    };

    setComplaint(prev => ({
      ...prev,
      updates: [newComment, ...prev.updates]
    }));
    
    setComment('');
    showSnackbar('Comment added successfully', 'success');
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!complaint) {
    return <Alert severity="error">Complaint not found</Alert>;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box p={2}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/my-complaints')}>
          Back to My Complaints
        </Button>
        <Typography variant="h5" ml={2}>
          Complaint #{complaint.id}
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
            
            {complaint.images?.length > 0 && (
              <Box my={2}>
                <img 
                  src={complaint.images[0]} 
                  alt="Complaint" 
                  style={{ maxWidth: '100%', borderRadius: 4 }}
                />
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="textSecondary">Category</Typography>
                <Typography>{complaint.category}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="textSecondary">Department</Typography>
                <Typography>{complaint.department}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="textSecondary">Reported On</Typography>
                <Typography>{formatDate(complaint.dateCreated)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="textSecondary">Assigned To</Typography>
                <Typography>{complaint.assignedTo || 'Not assigned'}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" mb={2}>Updates</Typography>
            <List>
              {complaint.updates.map((update) => (
                <ListItem key={update.id} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={update.user}
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          {formatDate(update.date)}
                        </Typography>
                        <Typography variant="body2">
                          {update.description}
                        </Typography>
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
          {/* Feedback button if resolved */}
          {complaint.status === 'Resolved' && (
            <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="success"
                component={Link}
                to={`/feedback/${complaint.id}`}
                startIcon={<CheckCircle />}
              >
                Give Feedback
              </Button>
            </Paper>
          )}
          
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>Complaint Details</Typography>
            <Box mb={2}>
              <Typography variant="caption" color="textSecondary" display="block">Location</Typography>
              <Typography>{complaint.location}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="caption" color="textSecondary" display="block">Priority</Typography>
              <Chip 
                label={complaint.priority} 
                color={complaint.priority === 'High' ? 'error' : 'default'}
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary" display="block">Last Updated</Typography>
              <Typography>{formatDate(complaint.lastUpdated)}</Typography>
            </Box>
          </Paper>
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
