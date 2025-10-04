import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Divider, Chip,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Alert, CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { officerService } from '../../services/officerService';

const OfficerComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await officerService.getComplaintById(id);
        setComplaint(data);
        setStatus(data.status);
      } catch (error) {
        console.error('Error fetching complaint:', error);
        setError('Failed to load complaint details');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  const handleSave = async () => {
    if (!status) {
      setError('Please select a status');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      setSuccess('');
      
      await officerService.updateComplaintStatus(id, status);
      
      // Update local state
      setComplaint(prev => ({ ...prev, status }));
      setNote('');
      setSuccess('Status updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating complaint:', error);
      setError('Failed to update complaint status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography ml={2}>Loading complaint details...</Typography>
      </Box>
    );
  }

  if (error && !complaint) {
    return (
      <Box p={3}>
        <Button onClick={() => navigate('/officer/complaints')} sx={{ mb: 2 }}>
          Back to Complaint Management
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Button onClick={() => navigate('/officer/complaints')} sx={{ mb: 2 }}>
        Back to Complaint Management
      </Button>
      <Typography variant="h4" gutterBottom>Complaint Details</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box mb={2}>
          <Typography variant="subtitle1">Complaint ID: <b>{complaint.complaint_id}</b></Typography>
          <Typography variant="subtitle1">Citizen: <b>{complaint.citizen_name}</b></Typography>
          <Typography variant="subtitle1">Email: <b>{complaint.citizen_email}</b></Typography>
          <Typography variant="subtitle1">Phone: <b>{complaint.citizen_phone}</b></Typography>
          <Typography variant="subtitle1">Address: <b>{complaint.citizen_address}</b></Typography>
          <Typography variant="subtitle1">Category: <b>{complaint.category_name}</b></Typography>
          <Typography variant="subtitle1">Priority: <b>{complaint.priority}</b></Typography>
          <Typography variant="subtitle1">Location: <b>{complaint.location || 'Not specified'}</b></Typography>
          <Typography variant="subtitle1">
            Status: <Chip 
              label={status} 
              color={status === 'Resolved' ? 'success' : status === 'In Progress' ? 'warning' : status === 'Rejected' ? 'error' : 'default'} 
              size="small" 
            />
          </Typography>
          <Typography variant="subtitle1">Created At: <b>{new Date(complaint.created_at).toLocaleDateString()}</b></Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Description</Typography>
        <Typography variant="body1" mb={2}>{complaint.description}</Typography>
        
        {complaint.photo_url && (
          <>
            <Typography variant="h6" gutterBottom>Photo Evidence</Typography>
            <Box mb={2}>
              <img 
                src={complaint.photo_url} 
                alt="Complaint evidence" 
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
              />
            </Box>
          </>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" mb={1}>Update Status</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Box display="flex" gap={2} mb={2}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={e => setStatus(e.target.value)} disabled={updating}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <TextField 
            size="small" 
            label="Remarks (Optional)" 
            value={note} 
            onChange={e => setNote(e.target.value)} 
            sx={{ flex: 1 }}
            disabled={updating}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
            disabled={updating || status === complaint.status}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" mb={1}>Status History</Typography>
        <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
          <Typography variant="body2">
            <b>Current Status:</b> {complaint.status}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last Updated: {new Date(complaint.updated_at || complaint.created_at).toLocaleString()}
          </Typography>
        </Paper>
      </Paper>
    </Box>
  );
};

export default OfficerComplaintDetails;
