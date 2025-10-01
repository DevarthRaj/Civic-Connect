import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Mock data
const complaints = [
  { id: 'CMP-1001', citizen: 'John Doe', category: 'Sanitation', status: 'Pending', createdAt: '2023-09-01' },
  { id: 'CMP-1002', citizen: 'Jane Smith', category: 'Roads', status: 'In Progress', createdAt: '2023-09-02' },
  { id: 'CMP-1003', citizen: 'Bob Brown', category: 'Water', status: 'Resolved', createdAt: '2023-09-03' },
];

const ComplaintManagement = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const filteredComplaints = complaints.filter(c =>
    (!status || c.status === status) &&
    (!category || c.category === category) &&
    (!search || c.citizen.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search))
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
                <TableRow key={row.id} hover style={{ cursor: 'pointer' }} onClick={() => navigate(`/officer/complaints/${row.id}`)}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.citizen}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.createdAt}</TableCell>
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
