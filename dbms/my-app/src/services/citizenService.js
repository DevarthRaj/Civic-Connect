import { supabase } from './supabase';

// Get current authenticated user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Get citizen profile by user_id
export const getCitizenProfile = async (userId) => {
  const { data, error } = await supabase
    .from('citizens')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Citizen profile not found');
  return data;
};

// Get complaints for current user
export const getUserComplaints = async () => {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get citizen profile
    const citizen = await getCitizenProfile(user.id);
    if (!citizen) throw new Error('Citizen profile not found');

    // Get complaints for this citizen
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        complaint_id,
        title,
        description,
        status,
        priority,
        location,
        photo_url,
        created_at,
        updated_at,
        category_id
      `)
      .eq('citizen_id', citizen.citizen_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Return early if no complaints
    if (!data || data.length === 0) {
      return [];
    }

    // Get category names separately to avoid relationship conflicts
    const categoryIds = [...new Set(data.map(complaint => complaint.category_id).filter(Boolean))];
    
    if (categoryIds.length === 0) {
      return data.map(complaint => ({ ...complaint, categories: null }));
    }

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('category_id, category_name, description')
      .in('category_id', categoryIds);

    if (categoriesError) throw categoriesError;

    // Map categories to complaints
    const categoriesMap = categoriesData.reduce((acc, cat) => {
      acc[cat.category_id] = cat;
      return acc;
    }, {});

    const complaintsWithCategories = data.map(complaint => ({
      ...complaint,
      categories: categoriesMap[complaint.category_id] || null
    }));

    return complaintsWithCategories || [];
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    throw error;
  }
};

// Get dashboard stats for current user
export const getUserDashboardStats = async () => {
  try {
    const complaints = await getUserComplaints();
    
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
      rejected: complaints.filter(c => c.status === 'Rejected').length
    };

    // Get recent complaints (last 3)
    const recentComplaints = complaints.slice(0, 3);

    return {
      stats,
      recentComplaints
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// File a new complaint
export const fileNewComplaint = async (complaintData) => {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get citizen profile
    const citizen = await getCitizenProfile(user.id);
    if (!citizen) throw new Error('Citizen profile not found');

    // Get category information
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('category_name', complaintData.category)
      .single();

    if (categoryError) throw categoryError;

    // Note: Removing department_id as it doesn't exist in the current table structure

    // Handle photo upload if exists
    let photo_url = null;
    if (complaintData.photo) {
      const fileExt = complaintData.photo.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('complaint_photos')
        .upload(fileName, complaintData.photo);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('complaint_photos')
        .getPublicUrl(fileName);
      
      photo_url = data.publicUrl;
    }

    // Insert complaint
    const { data, error } = await supabase
      .from('complaints')
      .insert([
        {
          citizen_id: citizen.citizen_id,
          category_id: category.category_id,
          title: complaintData.title,
          description: complaintData.description,
          location: complaintData.location,
          photo_url,
          priority: category.priority || 'Medium',
          status: 'Pending'
        }
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error filing complaint:', error);
    throw error;
  }
};

// Get all categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('category_name', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Get complaint by ID
export const getComplaintById = async (complaintId) => {
  try {
    // Get current user to verify ownership
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const citizen = await getCitizenProfile(user.id);
    if (!citizen) throw new Error('Citizen profile not found');

    const { data, error } = await supabase
      .from('complaints')
      .select(`
        complaint_id,
        title,
        description,
        status,
        priority,
        location,
        photo_url,
        created_at,
        updated_at,
        category_id,
        citizen_id
      `)
      .eq('complaint_id', complaintId)
      .eq('citizen_id', citizen.citizen_id) // Ensure user can only see their own complaints
      .single();

    if (error) throw error;

    // Get category data only (skip citizen data since we already have it)
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('category_id, category_name, description')
      .eq('category_id', data.category_id)
      .single();

    if (categoryError) {
      console.warn('Failed to fetch category data:', categoryError);
    }

    return {
      ...data,
      categories: categoryData,
      // Use citizen data we already have
      citizens: {
        citizen_id: citizen.citizen_id,
        name: citizen.name || 'Unknown',
        email: citizen.email || 'No email',
        phone: citizen.phone || 'No phone'
      }
    };
  } catch (error) {
    console.error('Error fetching complaint:', error);
    throw error;
  }
};

// Submit feedback for a complaint
export const submitFeedback = async (complaintId, feedbackData) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const citizen = await getCitizenProfile(user.id);
    if (!citizen) throw new Error('Citizen profile not found');

    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          complaint_id: complaintId,
          citizen_id: citizen.citizen_id,
          rating: feedbackData.rating,
          comments: feedbackData.comments,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};
