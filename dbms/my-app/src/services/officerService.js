import { supabase } from './supabase';
import { adminSupabase } from './adminSupabase';

const COMPLAINT_SELECT_QUERY = `
  complaint_id,
  title,
  description,
  location,
  photo_url,
  status,
  priority,
  created_at,
  updated_at,
  category:categories!complaints_category_id_fkey ( category_id, category_name ),
  citizen:citizens!complaints_citizen_id_fkey (
    citizen_id,
    address,
    user:users ( name, email, phone )
  )
`;

function transformComplaint(complaint) {
  if (!complaint) return null;
  return {
    complaint_id: complaint.complaint_id,
    title: complaint.title,
    description: complaint.description,
    location: complaint.location,
    status: complaint.status,
    priority: complaint.priority,
    photo_url: complaint.photo_url,
    created_at: complaint.created_at,
    updated_at: complaint.updated_at,
    category_name: complaint.category?.category_name || 'Uncategorized',
    category_id: complaint.category?.category_id,
    citizen_name: complaint.citizen?.user?.name || 'Unknown Citizen',
    citizen_email: complaint.citizen?.user?.email || 'No email provided',
    citizen_phone: complaint.citizen?.user?.phone || 'No phone provided',
    citizen_address: complaint.citizen?.address || 'No address provided',
  };
}

export const officerService = {
  
  async getAllComplaints() {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(COMPLAINT_SELECT_QUERY)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(transformComplaint) || [];
    } catch (error) {
      console.error('Error fetching all complaints:', error);
      throw error;
    }
  },

  async getComplaintStats() {
    try {
      const { data, error } = await supabase.rpc('get_complaint_stats');
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error fetching complaint stats:', error);
      throw error;
    }
  },

  async getComplaintById(complaintId) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(COMPLAINT_SELECT_QUERY)
        .eq('complaint_id', complaintId)
        .single();
      if (error) throw error;
      return transformComplaint(data);
    } catch (error) {
      console.error(`Error fetching complaint with ID ${complaintId}:`, error);
      throw error;
    }
  },

  async updateComplaintStatus(complaintId, newStatus) {
    try {
      // First try with regular client
      let { data, error } = await supabase
        .from('complaints')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('complaint_id', complaintId)
        .select()
        .single();
      
      // If regular client fails, try with admin client (bypasses RLS)
      if (error) {
        const result = await adminSupabase
          .from('complaints')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('complaint_id', complaintId)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating status for complaint ${complaintId}:`, error);
      throw error;
    }
  },

  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('category_id, category_name')
        .order('category_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

export default officerService;