-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create the 'leads' table to store collected emails
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    source TEXT DEFAULT 'hero_form',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) for data protection
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow serverless backend (using Service Role Key) to insert and select
CREATE POLICY "Allow service role full access" 
ON public.leads 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Optional: Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
