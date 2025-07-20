
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogImageAlt?: string;
  structuredData?: object;
  noindex?: boolean;
}

export default function SEOHead({
  title = "ESGCheck – AI-Powered ESG Report Insights for Startups & SMEs",
  description = "Transform your ESG compliance with AI-powered report analysis. Get instant insights across GRI, SASB, TCFD frameworks. Perfect for startups and SMEs. Try free analysis today.",
  keywords = "ESG compliance, sustainability reporting, AI analysis, GRI, SASB, TCFD, environmental reporting, startup ESG, SME sustainability",
  canonicalUrl = "https://esgcheck.lovable.app/",
  ogImage = "https://esgcheck.lovable.app/esgcheck_logo.svg",
  ogImageAlt = "ESGCheck - AI-Powered ESG Compliance Platform",
  structuredData,
  noindex = false
}: SEOHeadProps) {
  const structuredDataScript = structuredData ? JSON.stringify(structuredData) : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="ESGCheck" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@esgcheck" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
      
      {/* Structured Data */}
      {structuredDataScript && (
        <script type="application/ld+json">
          {structuredDataScript}
        </script>
      )}
    </Helmet>
  );
}
