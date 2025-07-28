-- Add RLS policies for background_jobs table
-- Only admins should be able to manage background jobs

-- Policy for admins to view background jobs
CREATE POLICY "Admins can view background jobs" ON public.background_jobs
FOR SELECT USING (is_admin());

-- Policy for admins to insert background jobs (system functionality)
CREATE POLICY "Admins can insert background jobs" ON public.background_jobs
FOR INSERT WITH CHECK (is_admin());

-- Policy for admins to update background jobs
CREATE POLICY "Admins can update background jobs" ON public.background_jobs
FOR UPDATE USING (is_admin());

-- Policy for admins to delete background jobs
CREATE POLICY "Admins can delete background jobs" ON public.background_jobs
FOR DELETE USING (is_admin());