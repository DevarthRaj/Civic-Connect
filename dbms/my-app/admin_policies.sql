-- Admin Policies for CivicConnect Database
-- Run these policies to allow admin users to manage users and departments

-- First, let's create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies for admin operations
-- Allow admins to insert any user
CREATE POLICY "admins_can_insert_users" ON users
  FOR INSERT
  WITH CHECK (is_admin());

-- Allow admins to update any user
CREATE POLICY "admins_can_update_users" ON users
  FOR UPDATE
  USING (is_admin());

-- Allow admins to delete users
CREATE POLICY "admins_can_delete_users" ON users
  FOR DELETE
  USING (is_admin());

-- Allow admins to view all users
CREATE POLICY "admins_can_view_all_users" ON users
  FOR SELECT
  USING (is_admin() OR user_id = auth.uid());

-- Departments table policies
-- Enable RLS on departments table
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Allow admins to insert departments
CREATE POLICY "admins_can_insert_departments" ON departments
  FOR INSERT
  WITH CHECK (is_admin());

-- Allow admins to update departments
CREATE POLICY "admins_can_update_departments" ON departments
  FOR UPDATE
  USING (is_admin());

-- Allow admins to delete departments
CREATE POLICY "admins_can_delete_departments" ON departments
  FOR DELETE
  USING (is_admin());

-- Categories table policies
-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view categories
CREATE POLICY "anyone_can_view_categories" ON categories
  FOR SELECT
  TO public
  USING (true);

-- Allow admins to insert categories
CREATE POLICY "admins_can_insert_categories" ON categories
  FOR INSERT
  WITH CHECK (is_admin());

-- Allow admins to update categories
CREATE POLICY "admins_can_update_categories" ON categories
  FOR UPDATE
  USING (is_admin());

-- Allow admins to delete categories
CREATE POLICY "admins_can_delete_categories" ON categories
  FOR DELETE
  USING (is_admin());

-- Complaints table policies (if not already set)
-- Enable RLS on complaints table
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view complaints
CREATE POLICY "anyone_can_view_complaints" ON complaints
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert their own complaints
CREATE POLICY "users_can_insert_own_complaints" ON complaints
  FOR INSERT
  WITH CHECK (citizen_id = auth.uid());

-- Allow admins to view and manage all complaints
CREATE POLICY "admins_can_manage_complaints" ON complaints
  FOR ALL
  USING (is_admin());

-- Alternative approach: Create a service role policy
-- If you want to bypass RLS for admin operations, you can create policies that allow service role access

-- For users table - allow service role to do everything
CREATE POLICY "service_role_users_access" ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For departments table - allow service role to do everything
CREATE POLICY "service_role_departments_access" ON departments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For categories table - allow service role to do everything
CREATE POLICY "service_role_categories_access" ON categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
