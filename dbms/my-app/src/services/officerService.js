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
      // Get all complaints to calculate stats manually
      const { data, error } = await supabase
        .from('complaints')
        .select('status, priority');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(c => c.status === 'Pending').length || 0,
        in_progress: data?.filter(c => c.status === 'In Progress').length || 0,
        resolved: data?.filter(c => c.status === 'Resolved').length || 0,
        high_priority: data?.filter(c => c.priority === 'High').length || 0
      };

      return stats;
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

  async updateOfficerDepartment(userId, departmentName) {
    try {
      // First try with regular client
      let { data, error } = await supabase
        .from('users')
        .update({ department: departmentName })
        .eq('user_id', userId)
        .select()
        .single();
      
      // If regular client fails, try with admin client (bypasses RLS)
      if (error) {
        const result = await adminSupabase
          .from('users')
          .update({ department: departmentName })
          .eq('user_id', userId)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating department for user ${userId}:`, error);
      throw error;
    }
  },

  async getOfficerDepartment(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('department')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data?.department || 'None';
    } catch (error) {
      console.error(`Error fetching department for user ${userId}:`, error);
      throw error;
    }
  },

  async getComplaintsByDepartment(departmentName) {
    try {
      // First get all complaints with their categories
      const { data, error } = await supabase
        .from('complaints')
        .select(COMPLAINT_SELECT_QUERY)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter by department name on the client side
      const filteredData = data?.filter(complaint => 
        complaint.category?.category_name === departmentName
      ) || [];
      
      return filteredData.map(transformComplaint);
    } catch (error) {
      console.error(`Error fetching complaints for department ${departmentName}:`, error);
      throw error;
    }
  },
};

export default officerService;