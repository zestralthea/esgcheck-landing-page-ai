export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      esg_analyses: {
        Row: {
          id: string
          report_id: string
          analysis_version: number
          framework_used: string
          ai_model: string
          environmental_score: number | null
          social_score: number | null
          governance_score: number | null
          overall_score: number | null
          material_topics: Json | null
          identified_gaps: Json | null
          recommendations: Json | null
          risk_assessment: Json | null
          full_analysis: Json
          insights: ESGInsight[] | null
          confidence_score: number | null
          processing_time_ms: number | null
          is_latest: boolean | null
          job_id: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          report_id: string
          analysis_version?: number
          framework_used: string
          ai_model: string
          environmental_score?: number | null
          social_score?: number | null
          governance_score?: number | null
          overall_score?: number | null
          material_topics?: Json | null
          identified_gaps?: Json | null
          recommendations?: Json | null
          risk_assessment?: Json | null
          full_analysis: Json
          insights?: ESGInsight[] | null
          confidence_score?: number | null
          processing_time_ms?: number | null
          is_latest?: boolean | null
          job_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          report_id?: string
          analysis_version?: number
          framework_used?: string
          ai_model?: string
          environmental_score?: number | null
          social_score?: number | null
          governance_score?: number | null
          overall_score?: number | null
          material_topics?: Json | null
          identified_gaps?: Json | null
          recommendations?: Json | null
          risk_assessment?: Json | null
          full_analysis?: Json
          insights?: ESGInsight[] | null
          confidence_score?: number | null
          processing_time_ms?: number | null
          is_latest?: boolean | null
          job_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
      }
      esg_reports: {
        Row: {
          id: string
          organization_id: string
          created_by: string | null
          document_id: string | null
          title: string
          description: string | null
          report_type: string | null
          reporting_period_start: string
          reporting_period_end: string
          company_name: string | null
          industry: string | null
          framework: string | null
          status: string | null
          visibility: string | null
          tags: string[] | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
          published_at: string | null
          deleted_at: string | null
          report_title: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          created_by?: string | null
          document_id?: string | null
          title: string
          description?: string | null
          report_type?: string | null
          reporting_period_start: string
          reporting_period_end: string
          company_name?: string | null
          industry?: string | null
          framework?: string | null
          status?: string | null
          visibility?: string | null
          tags?: string[] | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
          published_at?: string | null
          deleted_at?: string | null
          report_title?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          created_by?: string | null
          document_id?: string | null
          title?: string
          description?: string | null
          report_type?: string | null
          reporting_period_start?: string
          reporting_period_end?: string
          company_name?: string | null
          industry?: string | null
          framework?: string | null
          status?: string | null
          visibility?: string | null
          tags?: string[] | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
          published_at?: string | null
          deleted_at?: string | null
          report_title?: string | null
          user_id?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone_number: string | null
          timezone: string | null
          default_organization_id: string | null
          preferences: Json | null
          onboarding_completed: boolean | null
          created_at: string | null
          updated_at: string | null
          email: string | null
          role: string | null
          dashboard_access: boolean | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone_number?: string | null
          timezone?: string | null
          default_organization_id?: string | null
          preferences?: Json | null
          onboarding_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          email?: string | null
          role?: string | null
          dashboard_access?: boolean | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone_number?: string | null
          timezone?: string | null
          default_organization_id?: string | null
          preferences?: Json | null
          onboarding_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          email?: string | null
          role?: string | null
          dashboard_access?: boolean | null
        }
      }
    }
    Views: {
      esg_insights_view: {
        Row: {
          analysis_id: string | null
          report_id: string | null
          insight_type: string | null
          title: string | null
          description: string | null
          priority: string | null
          category: string | null
          actionable: boolean | null
          impact_score: number | null
          implementation_effort: string | null
          gri_reference: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ESG-specific types
export interface ESGInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'risk' | 'recommendation' | 'benchmark'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'environmental' | 'social' | 'governance'
  actionable: boolean
  impact_score?: number
  implementation_effort?: 'low' | 'medium' | 'high'
  gri_reference?: string
}

export interface ESGAnalysis {
  id: string
  report_id: string
  analysis_version: number
  framework_used: string
  ai_model: string
  environmental_score: number | null
  social_score: number | null
  governance_score: number | null
  overall_score: number | null
  material_topics: string[] | null
  identified_gaps: string[] | null
  recommendations: string[] | null
  risk_assessment: Record<string, any> | null
  full_analysis: Record<string, any>
  insights: ESGInsight[] | null
  confidence_score: number | null
  processing_time_ms: number | null
  is_latest: boolean | null
  job_id: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

export interface ESGReport {
  id: string
  organization_id: string
  created_by: string | null
  document_id: string | null
  title: string
  description: string | null
  report_type: string | null
  reporting_period_start: string
  reporting_period_end: string
  company_name: string | null
  industry: string | null
  framework: string | null
  status: string | null
  visibility: string | null
  tags: string[] | null
  metadata: Record<string, any> | null
  created_at: string | null
  updated_at: string | null
  published_at: string | null
  deleted_at: string | null
  report_title: string | null
  user_id: string | null
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
