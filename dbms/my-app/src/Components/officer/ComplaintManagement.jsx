import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const ComplaintManagement = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          complaint_id,
          title,
          status,
          created_at,
          categories(category_name),
          citizens(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching complaints:', error.message);
      } else {
        setComplaints(data);
      }
    };

    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter(c =>
    (!status || c.status === status) &&
    (!category || c.categories?.category_name === category) &&
    (!search ||
      c.citizens?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.complaint_id.toString().includes(search))
  );

  return (
    <Box p={3}>
      <Button onClick={() => navigate('/officer')} sx={{ mb: 2 }}>
        Back to Officer Dashboard
      </Button>
      <Typography variant="h4" gutterBottom>Complaint Management</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} mb={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={e => setCategory(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Sanitation">Sanitation</MenuItem>
              <MenuItem value="Roads">Roads</MenuItem>
              <MenuItem value="Water">Water</MenuItem>
              <MenuItem value="Electricity">Electricity</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Search" value={search} onChange={e => setSearch(e.target.value)} />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Complaint ID</TableCell>
                <TableCell>Citizen Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComplaints.map(row => (
                <TableRow
                  key={row.complaint_id}
                  hover
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/officer/complaints/${row.complaint_id}`)}
                >
                  <TableCell>{row.complaint_id}</TableCell>
                  <TableCell>{row.citizens?.full_name || 'N/A'}</TableCell>
                  <TableCell>{row.categories?.category_name || 'N/A'}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ComplaintManagement;
