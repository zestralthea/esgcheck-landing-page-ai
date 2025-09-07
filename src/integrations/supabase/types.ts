export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          correlation_id: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          correlation_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          correlation_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs_2025_08: {
        Row: {
          action: string
          correlation_id: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          correlation_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          correlation_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      activity_logs_2025_09: {
        Row: {
          action: string
          correlation_id: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          correlation_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          correlation_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      activity_logs_2025_10: {
        Row: {
          action: string
          correlation_id: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          correlation_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          correlation_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      background_jobs: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: number
          job_type: string
          payload: Json
          status: string | null
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: never
          job_type: string
          payload: Json
          status?: string | null
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: never
          job_type?: string
          payload?: Json
          status?: string | null
        }
        Relationships: []
      }
      document_access_logs: {
        Row: {
          access_type: string
          accessed_at: string | null
          correlation_id: string | null
          created_at: string
          document_id: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          document_id: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          document_id?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_access_logs_2025_08: {
        Row: {
          access_type: string
          accessed_at: string | null
          correlation_id: string | null
          created_at: string
          document_id: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          document_id: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          document_id?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      document_access_logs_2025_09: {
        Row: {
          access_type: string
          accessed_at: string | null
          correlation_id: string | null
          created_at: string
          document_id: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          document_id: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          document_id?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      document_access_logs_2025_10: {
        Row: {
          access_type: string
          accessed_at: string | null
          correlation_id: string | null
          created_at: string
          document_id: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          document_id: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          document_id?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          checksum: string | null
          created_at: string | null
          deleted_at: string | null
          file_name: string
          file_size: number
          file_type: string
          filename: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          mime_type: string | null
          organization_id: string | null
          storage_path: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          checksum?: string | null
          created_at?: string | null
          deleted_at?: string | null
          file_name: string
          file_size: number
          file_type: string
          filename?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          organization_id?: string | null
          storage_path: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          checksum?: string | null
          created_at?: string | null
          deleted_at?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          filename?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          organization_id?: string | null
          storage_path?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_analyses: {
        Row: {
          ai_model: string
          analysis_version: number
          confidence_score: number | null
          created_at: string | null
          deleted_at: string | null
          environmental_score: number | null
          framework_used: string
          full_analysis: Json
          governance_score: number | null
          id: string
          identified_gaps: Json | null
          is_latest: boolean | null
          job_id: string | null
          material_topics: Json | null
          overall_score: number | null
          processing_time_ms: number | null
          recommendations: Json | null
          report_id: string
          risk_assessment: Json | null
          social_score: number | null
          updated_at: string | null
        }
        Insert: {
          ai_model: string
          analysis_version?: number
          confidence_score?: number | null
          created_at?: string | null
          deleted_at?: string | null
          environmental_score?: number | null
          framework_used: string
          full_analysis: Json
          governance_score?: number | null
          id?: string
          identified_gaps?: Json | null
          is_latest?: boolean | null
          job_id?: string | null
          material_topics?: Json | null
          overall_score?: number | null
          processing_time_ms?: number | null
          recommendations?: Json | null
          report_id: string
          risk_assessment?: Json | null
          social_score?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_model?: string
          analysis_version?: number
          confidence_score?: number | null
          created_at?: string | null
          deleted_at?: string | null
          environmental_score?: number | null
          framework_used?: string
          full_analysis?: Json
          governance_score?: number | null
          id?: string
          identified_gaps?: Json | null
          is_latest?: boolean | null
          job_id?: string | null
          material_topics?: Json | null
          overall_score?: number | null
          processing_time_ms?: number | null
          recommendations?: Json | null
          report_id?: string
          risk_assessment?: Json | null
          social_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_analyses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esg_analyses_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "esg_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_analysis_exports: {
        Row: {
          analysis_id: string
          created_at: string | null
          deleted_at: string | null
          error_message: string | null
          expires_at: string | null
          export_type: string
          external_document_id: string | null
          generation_status: string | null
          id: string
          job_id: string | null
          storage_path: string | null
          updated_at: string | null
        }
        Insert: {
          analysis_id: string
          created_at?: string | null
          deleted_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_type: string
          external_document_id?: string | null
          generation_status?: string | null
          id?: string
          job_id?: string | null
          storage_path?: string | null
          updated_at?: string | null
        }
        Update: {
          analysis_id?: string
          created_at?: string | null
          deleted_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_type?: string
          external_document_id?: string | null
          generation_status?: string | null
          id?: string
          job_id?: string | null
          storage_path?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_analysis_exports_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "esg_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esg_analysis_exports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_frameworks: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          official_url: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          official_url?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          official_url?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      esg_guideline_embeddings: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          dimension: number | null
          embedding: string | null
          guideline_id: string
          id: string
          metadata: Json | null
          model_version: string | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          dimension?: number | null
          embedding?: string | null
          guideline_id: string
          id?: string
          metadata?: Json | null
          model_version?: string | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          dimension?: number | null
          embedding?: string | null
          guideline_id?: string
          id?: string
          metadata?: Json | null
          model_version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_guideline_embeddings_guideline_id_fkey"
            columns: ["guideline_id"]
            isOneToOne: false
            referencedRelation: "esg_guidelines"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_guidelines: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          description: string | null
          framework_id: string
          id: string
          metadata: Json | null
          requirements: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          framework_id: string
          id?: string
          metadata?: Json | null
          requirements?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          framework_id?: string
          id?: string
          metadata?: Json | null
          requirements?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_guidelines_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "esg_frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_insights: {
        Row: {
          actionable: boolean | null
          category: string
          created_at: string
          description: string
          gri_reference: string | null
          id: string
          impact_score: number | null
          implementation_effort: string | null
          insight_type: string
          priority: string
          report_id: string
          title: string
          updated_at: string
        }
        Insert: {
          actionable?: boolean | null
          category: string
          created_at?: string
          description: string
          gri_reference?: string | null
          id?: string
          impact_score?: number | null
          implementation_effort?: string | null
          insight_type: string
          priority?: string
          report_id: string
          title: string
          updated_at?: string
        }
        Update: {
          actionable?: boolean | null
          category?: string
          created_at?: string
          description?: string
          gri_reference?: string | null
          id?: string
          impact_score?: number | null
          implementation_effort?: string | null
          insight_type?: string
          priority?: string
          report_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      esg_report_analyses: {
        Row: {
          analysis_data: Json
          created_at: string | null
          framework: string
          id: string
          pdf_document_id: string | null
          pdf_download_url: string | null
          report_id: string
          updated_at: string | null
        }
        Insert: {
          analysis_data?: Json
          created_at?: string | null
          framework?: string
          id?: string
          pdf_document_id?: string | null
          pdf_download_url?: string | null
          report_id: string
          updated_at?: string | null
        }
        Update: {
          analysis_data?: Json
          created_at?: string | null
          framework?: string
          id?: string
          pdf_document_id?: string | null
          pdf_download_url?: string | null
          report_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_report_analyses_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "esg_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_reports: {
        Row: {
          company_name: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          document_id: string | null
          framework: string | null
          id: string
          industry: string | null
          metadata: Json | null
          organization_id: string
          published_at: string | null
          report_title: string | null
          report_type: string | null
          reporting_period_end: string
          reporting_period_start: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          document_id?: string | null
          framework?: string | null
          id?: string
          industry?: string | null
          metadata?: Json | null
          organization_id: string
          published_at?: string | null
          report_title?: string | null
          report_type?: string | null
          reporting_period_end: string
          reporting_period_start: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          document_id?: string | null
          framework?: string | null
          id?: string
          industry?: string | null
          metadata?: Json | null
          organization_id?: string
          published_at?: string | null
          report_title?: string | null
          report_type?: string | null
          reporting_period_end?: string
          reporting_period_start?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esg_reports_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esg_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "esg_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "esg_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_scores: {
        Row: {
          category: string
          confidence_level: number | null
          created_at: string
          gri_disclosure: string | null
          id: string
          max_score: number
          methodology: string | null
          report_id: string
          score: number
          subcategory: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          category: string
          confidence_level?: number | null
          created_at?: string
          gri_disclosure?: string | null
          id?: string
          max_score?: number
          methodology?: string | null
          report_id: string
          score: number
          subcategory?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          category?: string
          confidence_level?: number | null
          created_at?: string
          gri_disclosure?: string | null
          id?: string
          max_score?: number
          methodology?: string | null
          report_id?: string
          score?: number
          subcategory?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      feature_flag_organizations: {
        Row: {
          feature_flag_id: string
          organization_id: string
        }
        Insert: {
          feature_flag_id: string
          organization_id: string
        }
        Update: {
          feature_flag_id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flag_organizations_feature_flag_id_fkey"
            columns: ["feature_flag_id"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_flag_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "feature_flag_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "feature_flag_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flag_users: {
        Row: {
          feature_flag_id: string
          user_id: string
        }
        Insert: {
          feature_flag_id: string
          user_id: string
        }
        Update: {
          feature_flag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flag_users_feature_flag_id_fkey"
            columns: ["feature_flag_id"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          metadata: Json | null
          name: string
          rollout_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          name: string
          rollout_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          name?: string
          rollout_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      guideline_chunks: {
        Row: {
          content: string
          document_name: string
          embedding: string
          framework: string
          id: number
        }
        Insert: {
          content: string
          document_name: string
          embedding: string
          framework: string
          id?: number
        }
        Update: {
          content?: string
          document_name?: string
          embedding?: string
          framework?: string
          id?: number
        }
        Relationships: []
      }
      jobs: {
        Row: {
          attempts: number | null
          completed_at: string | null
          correlation_id: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          idempotency_key: string | null
          kind: string
          last_attempt_at: string | null
          max_attempts: number | null
          organization_id: string | null
          payload: Json
          priority: number | null
          result: Json | null
          scheduled_for: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          idempotency_key?: string | null
          kind: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          organization_id?: string | null
          payload?: Json
          priority?: number | null
          result?: Json | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          idempotency_key?: string | null
          kind?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          organization_id?: string | null
          payload?: Json
          priority?: number | null
          result?: Json | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          organization_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          country: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          industry: string | null
          is_public: boolean | null
          logo_url: string | null
          name: string
          settings: Json | null
          size: string | null
          slug: string
          subscription_expires_at: string | null
          subscription_tier: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          industry?: string | null
          is_public?: boolean | null
          logo_url?: string | null
          name: string
          settings?: Json | null
          size?: string | null
          slug: string
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          industry?: string | null
          is_public?: boolean | null
          logo_url?: string | null
          name?: string
          settings?: Json | null
          size?: string | null
          slug?: string
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          dashboard_access: boolean | null
          default_organization_id: string | null
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          phone_number: string | null
          preferences: Json | null
          role: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          dashboard_access?: boolean | null
          default_organization_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          phone_number?: string | null
          preferences?: Json | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          dashboard_access?: boolean | null
          default_organization_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone_number?: string | null
          preferences?: Json | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_organization_id_fkey"
            columns: ["default_organization_id"]
            isOneToOne: false
            referencedRelation: "organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "profiles_default_organization_id_fkey"
            columns: ["default_organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "profiles_default_organization_id_fkey"
            columns: ["default_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action_type: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          approved_at: string | null
          company_name: string | null
          company_size: string | null
          confirmation_sent_at: string | null
          confirmation_status: string | null
          converted_at: string | null
          converted_user_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          metadata: Json | null
          notes: string | null
          referral_source: string | null
          status: string | null
          updated_at: string | null
          use_case: string | null
        }
        Insert: {
          approved_at?: string | null
          company_name?: string | null
          company_size?: string | null
          confirmation_sent_at?: string | null
          confirmation_status?: string | null
          converted_at?: string | null
          converted_user_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          referral_source?: string | null
          status?: string | null
          updated_at?: string | null
          use_case?: string | null
        }
        Update: {
          approved_at?: string | null
          company_name?: string | null
          company_size?: string | null
          confirmation_sent_at?: string | null
          confirmation_status?: string | null
          converted_at?: string | null
          converted_user_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          referral_source?: string | null
          status?: string | null
          updated_at?: string | null
          use_case?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      organization_metrics: {
        Row: {
          avg_esg_score: number | null
          last_analysis_date: string | null
          last_report_date: string | null
          organization_id: string | null
          organization_name: string | null
          subscription_tier: string | null
          total_analyses: number | null
          total_members: number | null
          total_reports: number | null
          total_storage_bytes: number | null
        }
        Relationships: []
      }
      organization_stats: {
        Row: {
          analysis_count: number | null
          document_count: number | null
          last_analysis_created_at: string | null
          last_report_created_at: string | null
          member_count: number | null
          organization_id: string | null
          organization_name: string | null
          report_count: number | null
          subscription_tier: string | null
          total_storage_bytes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      check_function_exists: {
        Args: { function_name: string }
        Returns: boolean
      }
      check_waitlist_rate_limit: {
        Args: { user_email: string; user_ip?: unknown }
        Returns: boolean
      }
      claim_next_job: {
        Args: { worker_id: string }
        Returns: {
          attempts: number | null
          completed_at: string | null
          correlation_id: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          idempotency_key: string | null
          kind: string
          last_attempt_at: string | null
          max_attempts: number | null
          organization_id: string | null
          payload: Json
          priority: number | null
          result: Json | null
          scheduled_for: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
      }
      create_document_logs_monthly_partition: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_monthly_partition: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      gdpr_delete_user_data: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      get_document_access_summary: {
        Args: { include_public?: boolean; user_id_filter?: string }
        Returns: {
          document_id: string
          download_count: number
          failed_accesses: number
          filename: string
          is_public: boolean
          last_accessed: string
          owner_email: string
          owner_id: string
          signed_url_accesses: number
          success_rate: number
          total_accesses: number
          unique_accessors: number
          view_count: number
        }[]
      }
      get_system_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_feature_access: {
        Args: { feature_name: string; org_uuid?: string; user_uuid?: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_document_access: {
        Args: {
          access_type_param: string
          doc_id: string
          error_msg?: string
          success_param?: boolean
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          action_type_param: string
          error_msg?: string
          resource_id_param?: string
          resource_type_param: string
          success_param?: boolean
        }
        Returns: string
      }
      manually_verify_user: {
        Args: { user_identifier: string }
        Returns: Json
      }
      match_guideline_chunks: {
        Args: {
          framework_name: string
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          embedding: string
          id: number
          similarity: number
        }[]
      }
      refresh_organization_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_guidelines: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_framework_code?: string
          query_embedding: string
        }
        Returns: {
          chunk_index: number
          content: string
          framework_code: string
          guideline_code: string
          guideline_id: string
          similarity: number
          title: string
        }[]
      }
      user_organizations: {
        Args: { user_uuid: string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
