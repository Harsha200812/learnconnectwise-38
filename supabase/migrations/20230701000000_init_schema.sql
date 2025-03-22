
-- Create profiles table if it doesn't exist
CREATE OR REPLACE FUNCTION init_profiles_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the table if it doesn't exist
  CREATE TABLE IF NOT EXISTS profiles (
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

  -- Create policies
  DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
  CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
  CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);
END;
$$;

-- Create quizzes table if it doesn't exist
CREATE OR REPLACE FUNCTION init_quizzes_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the table if it doesn't exist
  CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    questions JSONB NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    time_limit INTEGER NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Set up Row Level Security
  ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

  -- Create policies
  DROP POLICY IF EXISTS "Quizzes are viewable by everyone" ON quizzes;
  CREATE POLICY "Quizzes are viewable by everyone"
    ON quizzes FOR SELECT
    USING (true);

  DROP POLICY IF EXISTS "Authenticated users can create quizzes" ON quizzes;
  CREATE POLICY "Authenticated users can create quizzes"
    ON quizzes FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

  DROP POLICY IF EXISTS "Users can update their own quizzes" ON quizzes;
  CREATE POLICY "Users can update their own quizzes"
    ON quizzes FOR UPDATE
    USING (auth.uid() = created_by);
END;
$$;

-- Create quiz_results table if it doesn't exist
CREATE OR REPLACE FUNCTION init_quiz_results_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the table if it doesn't exist
  CREATE TABLE IF NOT EXISTS quiz_results (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    time_taken INTEGER NOT NULL,
    completed BOOLEAN DEFAULT true,
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Set up Row Level Security
  ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

  -- Create policies
  DROP POLICY IF EXISTS "Users can view their own quiz results" ON quiz_results;
  CREATE POLICY "Users can view their own quiz results"
    ON quiz_results FOR SELECT
    USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert their own quiz results" ON quiz_results;
  CREATE POLICY "Users can insert their own quiz results"
    ON quiz_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can update their own quiz results" ON quiz_results;
  CREATE POLICY "Users can update their own quiz results"
    ON quiz_results FOR UPDATE
    USING (auth.uid() = user_id);
END;
$$;
