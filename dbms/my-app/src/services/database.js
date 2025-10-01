import { supabase } from './supabase.js'

// Users API
export const usersApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
    return { data, error }
  },
  
  getById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', id)
      .single()
    return { data, error }
  },
  
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', id)
    return { data, error }
  },
  
  delete: async (id) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', id)
    return { error }
  }
}

// Complaints API
export const complaintsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        citizen:citizens(user:users(name, email)),
        category:categories(department:departments(department_name))
      `)
    return { data, error }
  },
  
  getById: async (id) => {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        citizen:citizens(user:users(name, email)),
        category:categories(department:departments(department_name))
      `)
      .eq('complaint_id', id)
      .single()
    return { data, error }
  },
  
  create: async (complaint) => {
    const { data, error } = await supabase
      .from('complaints')
      .insert([complaint])
      .select()
    return { data, error }
  },
  
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('complaints')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('complaint_id', id)
      .select()
    return { data, error }
  }
}

// Departments API
export const departmentsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
    return { data, error }
  }
}

// Categories API
export const categoriesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        department:departments(department_name)
      `)
    return { data, error }
  }
}