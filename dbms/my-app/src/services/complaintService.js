import { supabase } from "./supabase";

// Get complaints for a specific citizen
export const getCitizenComplaints = async (citizenId) => {
  const { data, error } = await supabase
    .from("complaints")
    .select(`
      complaint_id,
      title,
      description,
      status,
      priority,
      created_at,
      updated_at,
      categories (category_name),
      citizens (citizen_id, user_id)
    `)
    .eq("citizen_id", citizenId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Get all complaints (for officer/admin dashboard)
export const getAllComplaints = async () => {
  const { data, error } = await supabase
    .from("complaints")
    .select(`
      complaint_id,
      title,
      description,
      status,
      priority,
      created_at,
      updated_at,
      categories (category_name),
      citizens (citizen_id, user_id)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Get one complaint by ID (for ComplaintDetails.jsx)
export const getComplaintById = async (complaintId) => {
  const { data, error } = await supabase
    .from("complaints")
    .select(`
      complaint_id,
      title,
      description,
      status,
      priority,
      created_at,
      updated_at,
      categories (category_name),
      citizens (citizen_id, user_id)
    `)
    .eq("complaint_id", complaintId)
    .single();

  if (error) throw error;
  return data;
};

// File a new complaint
export const fileComplaint = async (complaintData) => {
  const { data, error } = await supabase
    .from("complaints")
    .insert([complaintData])
    .select();

  if (error) throw error;
  return data[0];
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("category_id, category_name, description");

  if (error) throw error;
  return data;
};

// Update complaint status/priority
export const updateComplaint = async (complaintId, updates) => {
  const { data, error } = await supabase
    .from("complaints")
    .update(updates)
    .eq("complaint_id", complaintId)
    .select();

  if (error) throw error;
  return data[0];
};

// Add citizen feedback (if you store feedback separately)
export const addFeedback = async (feedbackData) => {
  const { data, error } = await supabase
    .from("feedback")
    .insert([feedbackData])
    .select();

  if (error) throw error;
  return data[0];
};
