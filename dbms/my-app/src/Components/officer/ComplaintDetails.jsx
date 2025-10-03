import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Divider, Chip,
  TextField, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const OfficerComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const fetchComplaint = async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          complaint_id,
          title,
          description,
          status,
          created_at,
          categories(category_name),
          citizens(full_name),
          updates(status, note, created_at, officer)
        `)
        .eq('complaint_id', id)
        .single();

      if (error) {
        console.error('Error fetching complaint:', error.message);
      } else {
        setComplaint(data);
        setStatus(data.status);
        setUpdates(data.updates || []);
      }
    };

    fetchComplaint();
  }, [id]);

  const handleSave = async () => {
    if (!note) return;

    const newUpdate = {
      status,
      note,
      created_at: new Date().toISOString(),
      officer: 'You',
    };

    setUpdates([...updates, newUpdate]);
    setNote('');

    // Update in DB
    await supabase
      .from('complaints')
      .update({ status })
      .eq('complaint_id', id);

    await supabase.from('updates').insert([{
      complaint_id: id,
      status,
      note,
      officer: 'Officer User'
    }]);
  };

  if (!complaint) return <Typography>Loading...</Typography>;

  return (
    <Box p={3}>
      <Button onClick={() => navigate('/officer/complaints')} sx={{ mb: 2 }}>
        Back to Complaint Management
      </Button>
      <Typography variant="h4" gutterBottom>Complaint Details</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box mb={2}>
          <Typography variant="subtitle1">Complaint ID: <b>{complaint.complaint_id}</b></Typography>
          <Typography variant="subtitle1">Citizen: <b>{complaint.citizens?.full_name}</b></Typography>
          <Typography variant="subtitle1">Category: <b>{complaint.categories?.category_name}</b></Typography>
          <Typography variant="subtitle1">
            Status: <Chip label={status} color={status === 'Resolved' ? 'success' : status === 'In Progress' ? 'warning' : 'default'} size="small" />
          </Typography>
          <Typography variant="subtitle1">Created At: <b>{new Date(complaint.created_at).toLocaleDateString()}</b></Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" mb={2}>{complaint.description}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" mb={1}>Update Status / Add Note</Typography>
        <Box display="flex" gap={2} mb={2}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Remarks" value={note} onChange={e => setNote(e.target.value)} sx={{ flex: 1 }} />
          <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" mb={1}>Timeline</Typography>
        {updates.map((u, idx) => (
          <Paper key={idx} sx={{ p: 1, mb: 1 }}>
            <Typography variant="body2"><b>{u.status}</b> - {u.note}</Typography>
            <Typography variant="caption" color="text.secondary">{new Date(u.created_at).toLocaleDateString()} by {u.officer}</Typography>
          </Paper>
        ))}
      </Paper>
    </Box>
  );
};

export default OfficerComplaintDetails;
