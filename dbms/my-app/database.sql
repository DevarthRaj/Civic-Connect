-- Database schema for Complaint Management System

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    role VARCHAR NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'officer')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger function for automatically creating user records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (user_id, email, name, role)
    VALUES (
        new.id,
        new.email,
        SPLIT_PART(new.email, '@', 1),
        'citizen'
    )
    ON CONFLICT (email) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Citizens table
CREATE TABLE citizens (
    citizen_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    address TEXT,
    phone VARCHAR,
    city VARCHAR,
    pincode VARCHAR,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
    department_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_name VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Complaints table
CREATE TABLE complaints (
    complaint_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id UUID REFERENCES citizens(citizen_id),
    category_id UUID REFERENCES categories(category_id),
    department_id UUID REFERENCES departments(department_id),
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    photo_url TEXT,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'resolved', 'rejected')),
    priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE feedback (
    feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(complaint_id),
    citizen_id UUID REFERENCES citizens(citizen_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX idx_complaints_category ON complaints(category_id);
CREATE INDEX idx_complaints_department ON complaints(department_id);
CREATE INDEX idx_feedback_complaint ON feedback(complaint_id);

-- Row Level Security (RLS) Policies

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to view and update their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = user_id::text
    );

-- Allow anyone to insert during registration
CREATE POLICY "Anyone can register" ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = user_id::text);

-- Policy for user registration
CREATE POLICY users_insert_policy ON users
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Citizens table policies
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;

CREATE POLICY citizens_view_policy ON citizens
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Complaints table policies
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY complaints_view_policy ON complaints
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM citizens 
            WHERE citizens.citizen_id = complaints.citizen_id 
            AND citizens.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY complaints_insert_policy ON complaints
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM citizens 
            WHERE citizens.citizen_id = complaints.citizen_id 
            AND citizens.user_id = auth.uid()
        )
    );

-- Feedback table policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY feedback_view_policy ON feedback
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM citizens 
            WHERE citizens.citizen_id = feedback.citizen_id 
            AND citizens.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY feedback_insert_policy ON feedback
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM citizens 
            WHERE citizens.citizen_id = feedback.citizen_id 
            AND citizens.user_id = auth.uid()
        )
    );

-- Categories and Departments tables policies (admin only)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_admin_policy ON categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY departments_admin_policy ON departments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );