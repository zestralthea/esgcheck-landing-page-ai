create sequence "public"."guideline_chunks_id_seq";

drop trigger if exists "update_documents_updated_at" on "public"."documents";

drop trigger if exists "update_esg_reports_updated_at" on "public"."esg_reports";

drop trigger if exists "update_feature_flags_updated_at" on "public"."feature_flags";

drop trigger if exists "update_profiles_updated_at" on "public"."profiles";

alter table "public"."waitlist_entries" drop constraint "waitlist_entries_confirmation_status_check";

drop index if exists "public"."idx_waitlist_entries_confirmation_status";

create table "public"."background_jobs" (
    "id" bigint generated always as identity not null,
    "job_type" text not null,
    "payload" jsonb not null,
    "status" text default 'pending'::text,
    "error_message" text,
    "created_at" timestamp with time zone default now(),
    "completed_at" timestamp with time zone,
    "attempts" integer default 0
);


alter table "public"."background_jobs" enable row level security;

create table "public"."esg_insights" (
    "id" uuid not null default gen_random_uuid(),
    "report_id" uuid not null,
    "insight_type" text not null,
    "title" text not null,
    "description" text not null,
    "priority" text not null default 'medium'::text,
    "category" text not null,
    "actionable" boolean default true,
    "gri_reference" text,
    "impact_score" numeric(3,2),
    "implementation_effort" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."esg_insights" enable row level security;

create table "public"."esg_scores" (
    "id" uuid not null default gen_random_uuid(),
    "report_id" uuid not null,
    "category" text not null,
    "subcategory" text,
    "score" numeric(5,2) not null,
    "max_score" numeric(5,2) not null default 100,
    "weight" numeric(3,2) default 1.0,
    "gri_disclosure" text,
    "methodology" text,
    "confidence_level" numeric(3,2),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."esg_scores" enable row level security;

create table "public"."guideline_chunks" (
    "id" bigint not null default nextval('guideline_chunks_id_seq'::regclass),
    "framework" text not null,
    "document_name" text not null,
    "content" text not null,
    "embedding" vector(3072) not null
);


alter table "public"."guideline_chunks" enable row level security;

create table "public"."security_audit_log" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "action_type" text not null,
    "resource_type" text not null,
    "resource_id" text,
    "success" boolean not null default true,
    "error_message" text,
    "ip_address" inet,
    "user_agent" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."security_audit_log" enable row level security;

alter table "public"."waitlist_entries" drop column "confirmation_sent_at";

alter table "public"."waitlist_entries" drop column "confirmation_status";

alter sequence "public"."guideline_chunks_id_seq" owned by "public"."guideline_chunks"."id";

drop extension if exists "vector";

CREATE UNIQUE INDEX background_jobs_pkey ON public.background_jobs USING btree (id);

CREATE UNIQUE INDEX esg_insights_pkey ON public.esg_insights USING btree (id);

CREATE UNIQUE INDEX esg_scores_pkey ON public.esg_scores USING btree (id);

CREATE UNIQUE INDEX guideline_chunks_pkey ON public.guideline_chunks USING btree (id);

CREATE INDEX idx_background_jobs_status ON public.background_jobs USING btree (status);

CREATE INDEX idx_background_jobs_type_status ON public.background_jobs USING btree (job_type, status);

CREATE INDEX idx_esg_insights_category ON public.esg_insights USING btree (category);

CREATE INDEX idx_esg_insights_priority ON public.esg_insights USING btree (priority);

CREATE INDEX idx_esg_insights_report_id ON public.esg_insights USING btree (report_id);

CREATE INDEX idx_esg_scores_category ON public.esg_scores USING btree (category);

CREATE INDEX idx_esg_scores_report_id ON public.esg_scores USING btree (report_id);

CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log USING btree (user_id);

CREATE UNIQUE INDEX security_audit_log_pkey ON public.security_audit_log USING btree (id);

alter table "public"."background_jobs" add constraint "background_jobs_pkey" PRIMARY KEY using index "background_jobs_pkey";

alter table "public"."esg_insights" add constraint "esg_insights_pkey" PRIMARY KEY using index "esg_insights_pkey";

alter table "public"."esg_scores" add constraint "esg_scores_pkey" PRIMARY KEY using index "esg_scores_pkey";

alter table "public"."guideline_chunks" add constraint "guideline_chunks_pkey" PRIMARY KEY using index "guideline_chunks_pkey";

alter table "public"."security_audit_log" add constraint "security_audit_log_pkey" PRIMARY KEY using index "security_audit_log_pkey";

alter table "public"."background_jobs" add constraint "background_jobs_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text]))) not valid;

alter table "public"."background_jobs" validate constraint "background_jobs_status_check";

alter table "public"."esg_insights" add constraint "esg_insights_category_check" CHECK ((category = ANY (ARRAY['environmental'::text, 'social'::text, 'governance'::text]))) not valid;

alter table "public"."esg_insights" validate constraint "esg_insights_category_check";

alter table "public"."esg_insights" add constraint "esg_insights_impact_score_check" CHECK (((impact_score >= (0)::numeric) AND (impact_score <= (10)::numeric))) not valid;

alter table "public"."esg_insights" validate constraint "esg_insights_impact_score_check";

alter table "public"."esg_insights" add constraint "esg_insights_implementation_effort_check" CHECK ((implementation_effort = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))) not valid;

alter table "public"."esg_insights" validate constraint "esg_insights_implementation_effort_check";

alter table "public"."esg_insights" add constraint "esg_insights_insight_type_check" CHECK ((insight_type = ANY (ARRAY['strength'::text, 'weakness'::text, 'opportunity'::text, 'risk'::text, 'recommendation'::text, 'benchmark'::text]))) not valid;

alter table "public"."esg_insights" validate constraint "esg_insights_insight_type_check";

alter table "public"."esg_insights" add constraint "esg_insights_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))) not valid;

alter table "public"."esg_insights" validate constraint "esg_insights_priority_check";

alter table "public"."esg_insights" add constraint "esg_insights_report_id_fkey" FOREIGN KEY (report_id) REFERENCES legacy_backup.esg_reports(id) ON DELETE CASCADE not valid;

alter table "public"."esg_insights" validate constraint "esg_insights_report_id_fkey";

alter table "public"."esg_scores" add constraint "esg_scores_category_check" CHECK ((category = ANY (ARRAY['environmental'::text, 'social'::text, 'governance'::text, 'overall'::text]))) not valid;

alter table "public"."esg_scores" validate constraint "esg_scores_category_check";

alter table "public"."esg_scores" add constraint "esg_scores_confidence_level_check" CHECK (((confidence_level >= (0)::numeric) AND (confidence_level <= (1)::numeric))) not valid;

alter table "public"."esg_scores" validate constraint "esg_scores_confidence_level_check";

alter table "public"."esg_scores" add constraint "esg_scores_report_id_fkey" FOREIGN KEY (report_id) REFERENCES legacy_backup.esg_reports(id) ON DELETE CASCADE not valid;

alter table "public"."esg_scores" validate constraint "esg_scores_report_id_fkey";

alter table "public"."esg_scores" add constraint "esg_scores_score_check" CHECK (((score >= (0)::numeric) AND (score <= (100)::numeric))) not valid;

alter table "public"."esg_scores" validate constraint "esg_scores_score_check";

alter table "public"."security_audit_log" add constraint "security_audit_log_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."security_audit_log" validate constraint "security_audit_log_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_function_exists(function_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  function_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE p.proname = function_name
  ) INTO function_exists;
  
  RETURN function_exists;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_waitlist_rate_limit(user_email text, user_ip inet DEFAULT NULL::inet)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check for recent signups from same email (last 5 minutes)
  SELECT COUNT(*) INTO recent_count
  FROM public.waitlist
  WHERE email = user_email 
    AND created_at > (NOW() - INTERVAL '5 minutes');
  
  IF recent_count > 0 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_document_access_summary(user_id_filter uuid DEFAULT NULL::uuid, include_public boolean DEFAULT true)
 RETURNS TABLE(document_id uuid, filename text, owner_id uuid, owner_email text, is_public boolean, total_accesses bigint, unique_accessors bigint, last_accessed timestamp with time zone, view_count bigint, download_count bigint, signed_url_accesses bigint, failed_accesses bigint, success_rate numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        d.id as document_id,
        d.filename,
        d.user_id as owner_id,
        p.email as owner_email,
        d.is_public,
        COUNT(dal.id) as total_accesses,
        COUNT(DISTINCT dal.user_id) as unique_accessors,
        MAX(dal.accessed_at) as last_accessed,
        COUNT(dal.id) FILTER (WHERE dal.access_type = 'view') as view_count,
        COUNT(dal.id) FILTER (WHERE dal.access_type = 'download') as download_count,
        COUNT(dal.id) FILTER (WHERE dal.is_signed_url = true) as signed_url_accesses,
        COUNT(dal.id) FILTER (WHERE dal.success = false) as failed_accesses,
        ROUND(
            (COUNT(dal.id) FILTER (WHERE dal.success = true)::NUMERIC / NULLIF(COUNT(dal.id), 0)) * 100, 
            2
        ) as success_rate
    FROM public.documents d
    LEFT JOIN public.profiles p ON d.user_id = p.id
    LEFT JOIN public.document_access_logs dal ON d.id = dal.document_id
    WHERE (
        -- Admin can see all
        public.is_admin()
        OR
        -- User can see their own documents
        (user_id_filter IS NULL AND d.user_id = auth.uid())
        OR
        (user_id_filter IS NOT NULL AND d.user_id = user_id_filter AND d.user_id = auth.uid())
        OR
        -- Public documents if enabled
        (include_public AND d.is_public = true)
    )
    GROUP BY d.id, d.filename, d.user_id, p.email, d.is_public
    ORDER BY d.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_document_access(doc_id uuid, access_type_param text, success_param boolean DEFAULT true, error_msg text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.document_access_logs (
        document_id,
        user_id,
        access_type,
        success,
        error_message
    ) VALUES (
        doc_id,
        auth.uid(),
        access_type_param,
        success_param,
        error_msg
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_security_event(action_type_param text, resource_type_param text, resource_id_param text DEFAULT NULL::text, success_param boolean DEFAULT true, error_msg text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_audit_log (
        user_id,
        action_type,
        resource_type,
        resource_id,
        success,
        error_message
    ) VALUES (
        auth.uid(),
        action_type_param,
        resource_type_param,
        resource_id_param,
        success_param,
        error_msg
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.manually_verify_user(user_identifier text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    user_record record;
    result jsonb;
BEGIN
    -- Find user by email or ID
    SELECT id, email, email_confirmed_at, confirmed_at, raw_user_meta_data
    INTO user_record
    FROM auth.users
    WHERE email = user_identifier OR id::text = user_identifier;
    
    -- Check if user exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User not found'
        );
    END IF;
    
    -- Check if user is already verified
    IF user_record.email_confirmed_at IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User is already verified',
            'user_email', user_record.email
        );
    END IF;
    
    -- Update the user to mark as verified
    -- Note: confirmed_at can only be set to DEFAULT, not to now()
    UPDATE auth.users
    SET 
        email_confirmed_at = now(),
        confirmed_at = DEFAULT,
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"email_verified": true}'::jsonb,
        updated_at = now()
    WHERE id = user_record.id;
    
    -- Return success result
    RETURN jsonb_build_object(
        'success', true,
        'message', 'User successfully verified',
        'user_id', user_record.id,
        'user_email', user_record.email,
        'verified_at', now()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error verifying user: ' || SQLERRM
        );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.match_guideline_chunks(query_embedding vector, match_threshold double precision, match_count integer, framework_name text)
 RETURNS TABLE(id bigint, content text, embedding vector, similarity double precision)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    gc.id,
    gc.content,
    gc.embedding,
    1 - (gc.embedding <=> query_embedding) AS similarity
  FROM
    guideline_chunks gc
  WHERE
    (framework_name IS NULL OR gc.framework = framework_name)
    AND (1 - (gc.embedding <=> query_embedding)) > match_threshold
  ORDER BY
    gc.embedding <=> query_embedding
  LIMIT
    match_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.send_waitlist_confirmation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Insert a job into the background jobs table for email sending
    INSERT INTO public.background_jobs (
        job_type, 
        payload, 
        status
    ) VALUES (
        'send_waitlist_email',
        jsonb_build_object(
            'name', NEW.name,
            'email', NEW.email,
            'inserted_at', NOW()
        ),
        'pending'
    );

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."background_jobs" to "anon";

grant insert on table "public"."background_jobs" to "anon";

grant references on table "public"."background_jobs" to "anon";

grant select on table "public"."background_jobs" to "anon";

grant trigger on table "public"."background_jobs" to "anon";

grant truncate on table "public"."background_jobs" to "anon";

grant update on table "public"."background_jobs" to "anon";

grant delete on table "public"."background_jobs" to "authenticated";

grant insert on table "public"."background_jobs" to "authenticated";

grant references on table "public"."background_jobs" to "authenticated";

grant select on table "public"."background_jobs" to "authenticated";

grant trigger on table "public"."background_jobs" to "authenticated";

grant truncate on table "public"."background_jobs" to "authenticated";

grant update on table "public"."background_jobs" to "authenticated";

grant delete on table "public"."background_jobs" to "service_role";

grant insert on table "public"."background_jobs" to "service_role";

grant references on table "public"."background_jobs" to "service_role";

grant select on table "public"."background_jobs" to "service_role";

grant trigger on table "public"."background_jobs" to "service_role";

grant truncate on table "public"."background_jobs" to "service_role";

grant update on table "public"."background_jobs" to "service_role";

grant delete on table "public"."esg_insights" to "anon";

grant insert on table "public"."esg_insights" to "anon";

grant references on table "public"."esg_insights" to "anon";

grant select on table "public"."esg_insights" to "anon";

grant trigger on table "public"."esg_insights" to "anon";

grant truncate on table "public"."esg_insights" to "anon";

grant update on table "public"."esg_insights" to "anon";

grant delete on table "public"."esg_insights" to "authenticated";

grant insert on table "public"."esg_insights" to "authenticated";

grant references on table "public"."esg_insights" to "authenticated";

grant select on table "public"."esg_insights" to "authenticated";

grant trigger on table "public"."esg_insights" to "authenticated";

grant truncate on table "public"."esg_insights" to "authenticated";

grant update on table "public"."esg_insights" to "authenticated";

grant delete on table "public"."esg_insights" to "service_role";

grant insert on table "public"."esg_insights" to "service_role";

grant references on table "public"."esg_insights" to "service_role";

grant select on table "public"."esg_insights" to "service_role";

grant trigger on table "public"."esg_insights" to "service_role";

grant truncate on table "public"."esg_insights" to "service_role";

grant update on table "public"."esg_insights" to "service_role";

grant delete on table "public"."esg_scores" to "anon";

grant insert on table "public"."esg_scores" to "anon";

grant references on table "public"."esg_scores" to "anon";

grant select on table "public"."esg_scores" to "anon";

grant trigger on table "public"."esg_scores" to "anon";

grant truncate on table "public"."esg_scores" to "anon";

grant update on table "public"."esg_scores" to "anon";

grant delete on table "public"."esg_scores" to "authenticated";

grant insert on table "public"."esg_scores" to "authenticated";

grant references on table "public"."esg_scores" to "authenticated";

grant select on table "public"."esg_scores" to "authenticated";

grant trigger on table "public"."esg_scores" to "authenticated";

grant truncate on table "public"."esg_scores" to "authenticated";

grant update on table "public"."esg_scores" to "authenticated";

grant delete on table "public"."esg_scores" to "service_role";

grant insert on table "public"."esg_scores" to "service_role";

grant references on table "public"."esg_scores" to "service_role";

grant select on table "public"."esg_scores" to "service_role";

grant trigger on table "public"."esg_scores" to "service_role";

grant truncate on table "public"."esg_scores" to "service_role";

grant update on table "public"."esg_scores" to "service_role";

grant delete on table "public"."guideline_chunks" to "anon";

grant insert on table "public"."guideline_chunks" to "anon";

grant references on table "public"."guideline_chunks" to "anon";

grant select on table "public"."guideline_chunks" to "anon";

grant trigger on table "public"."guideline_chunks" to "anon";

grant truncate on table "public"."guideline_chunks" to "anon";

grant update on table "public"."guideline_chunks" to "anon";

grant delete on table "public"."guideline_chunks" to "authenticated";

grant insert on table "public"."guideline_chunks" to "authenticated";

grant references on table "public"."guideline_chunks" to "authenticated";

grant select on table "public"."guideline_chunks" to "authenticated";

grant trigger on table "public"."guideline_chunks" to "authenticated";

grant truncate on table "public"."guideline_chunks" to "authenticated";

grant update on table "public"."guideline_chunks" to "authenticated";

grant delete on table "public"."guideline_chunks" to "service_role";

grant insert on table "public"."guideline_chunks" to "service_role";

grant references on table "public"."guideline_chunks" to "service_role";

grant select on table "public"."guideline_chunks" to "service_role";

grant trigger on table "public"."guideline_chunks" to "service_role";

grant truncate on table "public"."guideline_chunks" to "service_role";

grant update on table "public"."guideline_chunks" to "service_role";

grant delete on table "public"."security_audit_log" to "anon";

grant insert on table "public"."security_audit_log" to "anon";

grant references on table "public"."security_audit_log" to "anon";

grant select on table "public"."security_audit_log" to "anon";

grant trigger on table "public"."security_audit_log" to "anon";

grant truncate on table "public"."security_audit_log" to "anon";

grant update on table "public"."security_audit_log" to "anon";

grant delete on table "public"."security_audit_log" to "authenticated";

grant insert on table "public"."security_audit_log" to "authenticated";

grant references on table "public"."security_audit_log" to "authenticated";

grant select on table "public"."security_audit_log" to "authenticated";

grant trigger on table "public"."security_audit_log" to "authenticated";

grant truncate on table "public"."security_audit_log" to "authenticated";

grant update on table "public"."security_audit_log" to "authenticated";

grant delete on table "public"."security_audit_log" to "service_role";

grant insert on table "public"."security_audit_log" to "service_role";

grant references on table "public"."security_audit_log" to "service_role";

grant select on table "public"."security_audit_log" to "service_role";

grant trigger on table "public"."security_audit_log" to "service_role";

grant truncate on table "public"."security_audit_log" to "service_role";

grant update on table "public"."security_audit_log" to "service_role";

create policy "Admins can delete background jobs"
on "public"."background_jobs"
as permissive
for delete
to public
using (is_admin());


create policy "Admins can insert background jobs"
on "public"."background_jobs"
as permissive
for insert
to public
with check (is_admin());


create policy "Admins can update background jobs"
on "public"."background_jobs"
as permissive
for update
to public
using (is_admin());


create policy "Admins can view background jobs"
on "public"."background_jobs"
as permissive
for select
to public
using (is_admin());


create policy "System can create ESG insights"
on "public"."esg_insights"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM legacy_backup.esg_reports
  WHERE ((esg_reports.id = esg_insights.report_id) AND ((esg_reports.user_id = auth.uid()) OR is_admin())))));


create policy "Users can delete insights for their own reports"
on "public"."esg_insights"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM legacy_backup.esg_reports
  WHERE ((esg_reports.id = esg_insights.report_id) AND ((esg_reports.user_id = auth.uid()) OR is_admin())))));


create policy "Users can update insights for their own reports"
on "public"."esg_insights"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM legacy_backup.esg_reports
  WHERE ((esg_reports.id = esg_insights.report_id) AND ((esg_reports.user_id = auth.uid()) OR is_admin())))));


create policy "Users can view insights for their own reports"
on "public"."esg_insights"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM legacy_backup.esg_reports
  WHERE ((esg_reports.id = esg_insights.report_id) AND ((esg_reports.user_id = auth.uid()) OR is_admin())))));


create policy "System can create ESG scores"
on "public"."esg_scores"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM legacy_backup.esg_reports
  WHERE ((esg_reports.id = esg_scores.report_id) AND ((esg_reports.user_id = auth.uid()) OR is_admin())))));


create policy "Users can delete scores for their own reports"
on "public"."esg_scores"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM legacy_backup.esg_reports
  WHERE ((esg_reports.id = esg_scores.report_id) AND ((esg_reports.user_id = auth.uid()) OR is_admin())))));


create policy "Users can update scores for their own reports"
on "public"."esg_scores"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM legacy_backup.esg_reports
  WHERE ((esg_reports.id = esg_scores.report_id) AND ((esg_reports.user_id = auth.uid()) OR is_admin())))));


create policy "Users can view scores for their own reports"
on "public"."esg_scores"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM legacy_backup.esg_reports
  WHERE ((esg_reports.id = esg_scores.report_id) AND ((esg_reports.user_id = auth.uid()) OR is_admin())))));


create policy "Admins can view all security audit logs"
on "public"."security_audit_log"
as permissive
for select
to public
using (is_admin());


create policy "System can insert security audit logs"
on "public"."security_audit_log"
as permissive
for insert
to public
with check (true);


CREATE TRIGGER update_esg_insights_updated_at BEFORE UPDATE ON public.esg_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_esg_scores_updated_at BEFORE UPDATE ON public.esg_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


