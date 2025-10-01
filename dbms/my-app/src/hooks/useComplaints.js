import { useState, useEffect } from 'react'
import { complaintsApi } from '../services/database'

export const useComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchComplaints = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await complaintsApi.getAll()
      if (error) throw error
      setComplaints(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createComplaint = async (complaintData) => {
    try {
      const { data, error } = await complaintsApi.create(complaintData)
      if (error) throw error
      setComplaints(prev => [...prev, data[0]])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const updateComplaint = async (id, updates) => {
    try {
      const { data, error } = await complaintsApi.update(id, updates)
      if (error) throw error
      setComplaints(prev => 
        prev.map(complaint => 
          complaint.complaint_id === id ? data[0] : complaint
        )
      )
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  return {
    complaints,
    loading,
    error,
    createComplaint,
    updateComplaint,
    refetch: fetchComplaints
  }
}