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
export const fileComplaint = async (values, citizenId, departmentId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  const { category, location, description, photo, title } = values

  // Get the category info to determine priority
  const { data: categoryData, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('category_name', category)
    .single()

  if (catError) throw catError

  const priority = categoryData.priority || 'Medium' // default to Medium if not set

  // Upload photo if exists
  let photo_url = null
  if (photo) {
    const fileExt = photo.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('complaint_photos')
      .upload(fileName, photo)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('complaint_photos')
      .getPublicUrl(fileName)
    photo_url = data.publicUrl
  }

  // Insert complaint
  const { data, error } = await supabase
    .from('complaints')
    .insert([
      {
        citizen_id: citizenId, 
        department_id: departmentId, 
        category_id: categoryData.category_id,
        title: title, 
        location,
        description,
        photo_url,
        priority,
        status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .select();

  if (error) throw error

  return data
}

export const getCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select('*')
    .order("category_name",{ascending: true}
    );

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

// Delete complaint
export const deleteComplaint = async (complaintId) => {
  console.log(`Attempting to delete complaint: ${complaintId}`);

  const { data, error } = await supabase
    .from('complaints')
    .delete()
    .eq('complaint_id', complaintId)
    .select(); // Important: .select() returns the deleted row

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  // If RLS prevents the delete, `data` will be null or an empty array.
  // This is the crucial check.
  if (!data || data.length === 0) {
    console.warn('Delete operation did not return a deleted record. This is likely an RLS policy issue.');
    throw new Error('You do not have permission to delete this complaint. Please check RLS policies.');
  }

  console.log('Successfully deleted complaint:', data[0]);
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
