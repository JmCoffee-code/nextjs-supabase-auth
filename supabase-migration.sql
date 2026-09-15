-- Create task table 

CREATE TABLE IF NOT EXISTS tasks (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    title TEXT NOT NULL,

    description TEXT,

    status TEXT NOT NULL DEFAULT 'pending'

        CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),

    priority TEXT NOT NULL DEFAULT 'medium'

        CHECK(status IN ('low', 'medium', 'high', 'urgent')),

    assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);

-- Create index for query performance 

CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by); 

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to); 

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status); 

-- Enable Row Level Security (RLS) 

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY; 

-- Policy: 1. Users can view all tasks (shared tasks) 

DROP POLICY IF EXISTS "User can view all tasks" ON tasks;

CREATE POLICY "User can view all tasks" 

    ON tasks 

    FOR SELECT 

    USING(true); 

-- Policy: 2. Users can create tasks 

DROP POLICY IF EXISTS "Users can create tasks" ON tasks;

CREATE POLICY "Users can create tasks" 

    ON tasks 

    FOR INSERT 

    WITH CHECK(auth.uid() = created_by); 

-- Policy: 3. User can update tasks they create so are assigned to them 

DROP POLICY IF EXISTS "Users can update ther own or assigned tasks" ON tasks;

CREATE POLICY "Users can update ther own or assigned tasks" 

    ON tasks 

    FOR UPDATE 

    USING (auth.uid() = created_by OR auth.uid() = assigned_to)

    WITH CHECK (auth.uid() = created_by OR auth.uid() = assigned_to); 

-- Policy: 4. Only creators can delete tasks 

DROP POLICY IF EXISTS "Only creators can delete tasks" ON tasks;

CREATE POLICY "Only creators can delete tasks" 

    ON tasks 

    FOR DELETE 

    USING (auth.uid() = created_by); 

-- Function to update update_at_timestamp 

CREATE OR REPLACE FUNCTION update_updated_at_column() 

RETURNS TRIGGER AS $$ 

BEGIN 

  NEW.updated_at = NOW(); 

  RETURN NEW; 

END; 

$$ LANGUAGE plpgsql; 

-- Trigger to automatically update updated_at 

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

CREATE TRIGGER update_tasks_updated_at 

    BEFORE UPDATE ON tasks 

    FOR EACH ROW 

    EXECUTE FUNCTION update_updated_at_column();