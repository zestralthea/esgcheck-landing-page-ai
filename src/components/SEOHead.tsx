import { Helmet } from "react-helmet-async";

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
  title = "ESGCheck - Practical ESG Assessment Platform for Growing SMEs",
  description = "A practical ESG assessment platform for growing SMEs. Turn policies, internal records, and company reports into clear scores, visible gaps, and practical next steps.",
  keywords = "ESG assessment, SME ESG, GRI, Swiss ESG, sustainability assessment, document-based ESG, ESG for growing companies",
  canonicalUrl = "https://esgcheck.lovable.app/",
  ogImage = "https://esgcheck.lovable.app/esgcheck_logo.svg",
  ogImageAlt = "ESGCheck - practical ESG assessment platform for growing SMEs",
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

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="ESGCheck" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={ogImageAlt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

      {structuredDataScript && (
        <script type="application/ld+json">
          {structuredDataScript}
        </script>
      )}
    </Helmet>
  );
}
