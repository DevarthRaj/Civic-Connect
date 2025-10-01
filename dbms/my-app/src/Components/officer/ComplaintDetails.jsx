import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Divider, Chip, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

// Mock data
const complaint = {
  id: 'CMP-1001',
  citizen: 'John Doe',
  category: 'Sanitation',
  status: 'Pending',
  createdAt: '2023-09-01',
  description: 'Garbage not collected for 3 days.',
  updates: [
    { status: 'Pending', note: 'Complaint filed', date: '2023-09-01', officer: 'System' },
    { status: 'In Progress', note: 'Assigned to officer', date: '2023-09-02', officer: 'Admin' }
  ]
};

const OfficerComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(complaint.status);
  const [note, setNote] = useState('');
  const [updates, setUpdates] = useState(complaint.updates);

  const handleSave = () => {
    if (!note) return;
    setUpdates([
      ...updates,
      { status, note, date: new Date().toISOString().slice(0, 10), officer: 'You' }
    ]);
    setNote('');
  };

  return (
    <Box p={3}>
      <Button onClick={() => navigate('/officer/complaints')} sx={{ mb: 2 }}>
        Back to Complaint Management
      </Button>
      <Typography variant="h4" gutterBottom>Complaint Details</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box mb={2}>
          <Typography variant="subtitle1">Complaint ID: <b>{complaint.id}</b></Typography>
          <Typography variant="subtitle1">Citizen: <b>{complaint.citizen}</b></Typography>
          <Typography variant="subtitle1">Category: <b>{complaint.category}</b></Typography>
          <Typography variant="subtitle1">Status: <Chip label={status} color={status === 'Resolved' ? 'success' : status === 'In Progress' ? 'warning' : 'default'} size="small" /></Typography>
          <Typography variant="subtitle1">Created At: <b>{complaint.createdAt}</b></Typography>
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
            <Typography variant="caption" color="text.secondary">{u.date} by {u.officer}</Typography>
          </Paper>
        ))}
      </Paper>
    </Box>
  );
};

export default OfficerComplaintDetails;
