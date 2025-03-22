
-- Optimize RLS policy for profiles table
CREATE OR REPLACE FUNCTION create_profiles_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- If table exists, just update the policies
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    CREATE POLICY "Users can view their own profile"
      ON profiles FOR SELECT
      USING (id = (SELECT auth.uid())); -- Optimized with subquery

    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
    CREATE POLICY "Users can insert their own profile"
      ON profiles FOR INSERT
      WITH CHECK (id = (SELECT auth.uid())); -- Optimized with subquery

    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    CREATE POLICY "Users can update their own profile"
      ON profiles FOR UPDATE
      USING (id = (SELECT auth.uid())); -- Optimized with subquery
  ELSE
    -- Create the table if it doesn't exist
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT,
      role TEXT CHECK (role IN ('tutor', 'learner')),
      subjects TEXT[],
      availability TEXT[],
      bio TEXT,
      hourly_rate INTEGER,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Set up Row Level Security
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    -- Create policies with optimized query performance
    CREATE POLICY "Users can view their own profile"
      ON profiles FOR SELECT
      USING (id = (SELECT auth.uid())); -- Optimized with subquery

    CREATE POLICY "Users can insert their own profile"
      ON profiles FOR INSERT
      WITH CHECK (id = (SELECT auth.uid())); -- Optimized with subquery

    CREATE POLICY "Users can update their own profile"
      ON profiles FOR UPDATE
      USING (id = (SELECT auth.uid())); -- Optimized with subquery
  END IF;
END;
$$;

-- Execute the function to ensure the policies are created or updated
SELECT create_profiles_table();
