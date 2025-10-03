// Admin Supabase Client with Service Role Key
// This client bypasses RLS policies for admin operations
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Create admin client with service role key (bypasses RLS)
export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Admin operations
export const adminOperations = {
  // User management
  createUser: async (userData) => {
    const { data, error } = await adminSupabase
      .from('users')
      .insert([{
        ...userData,
        user_id: crypto.randomUUID(),
        password_hash: 'temp_password_hash', // You should hash this properly
        created_at: new Date().toISOString()
      }])
      .select()
    
    return { data, error }
  },

  // Department management
  createDepartment: async (deptData) => {
    const { data, error } = await adminSupabase
      .from('departments')
      .insert([{
        ...deptData,
        department_id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      }])
      .select()
    
    return { data, error }
  },

  // Category management
  createCategory: async (categoryData) => {
    const { data, error } = await adminSupabase
      .from('categories')
      .insert([{
        ...categoryData,
        category_id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      }])
      .select()
    
    return { data, error }
  },

  deleteCategory: async (categoryId) => {
    const { data, error } = await adminSupabase
      .from('categories')
      .delete()
      .eq('category_id', categoryId)
    
    return { data, error }
  },

  // Get all data (bypasses RLS)
  getAllUsers: async () => {
    const { data, error } = await adminSupabase
      .from('users')
      .select('*')
    
    return { data, error }
  },

  getAllComplaints: async () => {
    const { data, error } = await adminSupabase
      .from('complaints')
      .select('*')
    
    return { data, error }
  },

  getAllDepartments: async () => {
    const { data, error } = await adminSupabase
      .from('departments')
      .select('*')
    
    return { data, error }
  },

  getAllCategories: async () => {
    const { data, error } = await adminSupabase
      .from('categories')
      .select('*')
    
    return { data, error }
  },

  // User management operations
  updateUser: async (userId, userData) => {
    const { data, error } = await adminSupabase
      .from('users')
      .update(userData)
      .eq('user_id', userId)
      .select()
    
    return { data, error }
  },

  deleteUser: async (userId) => {
    const { data, error } = await adminSupabase
      .from('users')
      .delete()
      .eq('user_id', userId)
    
    return { data, error }
  },

  // Department management operations
  updateDepartment: async (deptId, deptData) => {
    const { data, error } = await adminSupabase
      .from('departments')
      .update(deptData)
      .eq('department_id', deptId)
      .select()
    
    return { data, error }
  },

  deleteDepartment: async (deptId) => {
    const { data, error } = await adminSupabase
      .from('departments')
      .delete()
      .eq('department_id', deptId)
    
    return { data, error }
  },

  // Category management operations
  updateCategory: async (categoryId, categoryData) => {
    const { data, error } = await adminSupabase
      .from('categories')
      .update(categoryData)
      .eq('category_id', categoryId)
      .select()
    
    return { data, error }
  }
}
