-- Create ESG Reports table
CREATE TABLE public.esg_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  report_title TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('annual', 'quarterly', 'sustainability', 'impact', 'custom')),
  gri_standards TEXT[] DEFAULT ARRAY[]::TEXT[],
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ESG Scores table
CREATE TABLE public.esg_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.esg_reports(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('environmental', 'social', 'governance', 'overall')),
  subcategory TEXT,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  max_score DECIMAL(5,2) NOT NULL DEFAULT 100,
  weight DECIMAL(3,2) DEFAULT 1.0,
  gri_disclosure TEXT,
  methodology TEXT,
  confidence_level DECIMAL(3,2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ESG Insights table
CREATE TABLE public.esg_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.esg_reports(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('strength', 'weakness', 'opportunity', 'risk', 'recommendation', 'benchmark')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('environmental', 'social', 'governance')),
  actionable BOOLEAN DEFAULT true,
  gri_reference TEXT,
  impact_score DECIMAL(3,2) CHECK (impact_score >= 0 AND impact_score <= 10),
  implementation_effort TEXT CHECK (implementation_effort IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all ESG tables
ALTER TABLE public.esg_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for esg_reports
CREATE POLICY "Users can view their own ESG reports" 
ON public.esg_reports 
FOR SELECT 
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can create their own ESG reports" 
ON public.esg_reports 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own ESG reports" 
ON public.esg_reports 
FOR UPDATE 
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete their own ESG reports" 
ON public.esg_reports 
FOR DELETE 
USING (user_id = auth.uid() OR is_admin());

-- Create RLS policies for esg_scores
CREATE POLICY "Users can view scores for their own reports" 
ON public.esg_scores 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.esg_reports 
  WHERE esg_reports.id = esg_scores.report_id 
  AND (esg_reports.user_id = auth.uid() OR is_admin())
));

CREATE POLICY "System can create ESG scores" 
ON public.esg_scores 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.esg_reports 
  WHERE esg_reports.id = esg_scores.report_id 
  AND (esg_reports.user_id = auth.uid() OR is_admin())
));

CREATE POLICY "Users can update scores for their own reports" 
ON public.esg_scores 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.esg_reports 
  WHERE esg_reports.id = esg_scores.report_id 
  AND (esg_reports.user_id = auth.uid() OR is_admin())
));

CREATE POLICY "Users can delete scores for their own reports" 
ON public.esg_scores 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.esg_reports 
  WHERE esg_reports.id = esg_scores.report_id 
  AND (esg_reports.user_id = auth.uid() OR is_admin())
));

-- Create RLS policies for esg_insights
CREATE POLICY "Users can view insights for their own reports" 
ON public.esg_insights 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.esg_reports 
  WHERE esg_reports.id = esg_insights.report_id 
  AND (esg_reports.user_id = auth.uid() OR is_admin())
));

CREATE POLICY "System can create ESG insights" 
ON public.esg_insights 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.esg_reports 
  WHERE esg_reports.id = esg_insights.report_id 
  AND (esg_reports.user_id = auth.uid() OR is_admin())
));

CREATE POLICY "Users can update insights for their own reports" 
ON public.esg_insights 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.esg_reports 
  WHERE esg_reports.id = esg_insights.report_id 
  AND (esg_reports.user_id = auth.uid() OR is_admin())
));

CREATE POLICY "Users can delete insights for their own reports" 
ON public.esg_insights 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.esg_reports 
  WHERE esg_reports.id = esg_insights.report_id 
  AND (esg_reports.user_id = auth.uid() OR is_admin())
));

-- Create indexes for better performance
CREATE INDEX idx_esg_reports_user_id ON public.esg_reports(user_id);
CREATE INDEX idx_esg_reports_status ON public.esg_reports(status);
CREATE INDEX idx_esg_reports_period ON public.esg_reports(reporting_period_start, reporting_period_end);
CREATE INDEX idx_esg_scores_report_id ON public.esg_scores(report_id);
CREATE INDEX idx_esg_scores_category ON public.esg_scores(category);
CREATE INDEX idx_esg_insights_report_id ON public.esg_insights(report_id);
CREATE INDEX idx_esg_insights_priority ON public.esg_insights(priority);
CREATE INDEX idx_esg_insights_category ON public.esg_insights(category);

-- Create triggers for updated_at columns
CREATE TRIGGER update_esg_reports_updated_at
  BEFORE UPDATE ON public.esg_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_esg_scores_updated_at
  BEFORE UPDATE ON public.esg_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_esg_insights_updated_at
  BEFORE UPDATE ON public.esg_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();