import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { officerService } from '../../services/officerService';

const ComplaintManagement = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsData, categoriesData] = await Promise.all([
          officerService.getAllComplaints(),
          officerService.getCategories()
        ]);
        
        setComplaints(complaintsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredComplaints = complaints.filter(c =>
    (!status || c.status === status) &&
    (!category || c.category === category) &&
    (!search ||
      c.citizen_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.complaint_id.toString().includes(search) ||
      c.title?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box p={3}>
      <Button onClick={() => navigate('/officer')} sx={{ mb: 2 }}>
        Back to Officer Dashboard
      </Button>
      <Typography variant="h4" gutterBottom>
        Complaint Management
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        {/* Filters */}
        <Box display="flex" gap={2} mb={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={e => setCategory(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.category_id} value={cat.category_name}>
                  {cat.category_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Box>

        {/* Table */}
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
              {filteredComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No complaints found
                  </TableCell>
                </TableRow>
              ) : (
                filteredComplaints.map(row => (
                  <TableRow
                    key={row.complaint_id}
                    hover
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/officer/complaints/${row.complaint_id}`)}
                  >
                    <TableCell>{row.complaint_id}</TableCell>
                    <TableCell>{row.citizen_name || 'N/A'}</TableCell>
                    <TableCell>{row.category || 'N/A'}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ComplaintManagement;
