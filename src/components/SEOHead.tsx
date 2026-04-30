import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  ogImage?: string;
  ogImageType?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
  alternateLinks?: Array<{ hrefLang: string; href: string }>;
  structuredData?: object | object[];
  noindex?: boolean;
}

export default function SEOHead({
  title = "ESGCheck | Praxisnahe ESG-Ersteinschätzung für wachsende KMU",
  description = "Machen Sie aus Unternehmensunterlagen eine klare erste ESG-Einschätzung mit strukturierten Scores, sichtbaren Lücken und konkreten nächsten Schritten für steigende ESG-Informationsanfragen.",
  keywords = "ESG-Einschätzung, ESG für KMU, VSME-Readiness, GRI, Swiss ESG, ESG-Informationsanfragen, Nachhaltigkeitsbewertung, dokumentenbasierte ESG-Einschätzung",
  canonicalUrl = "https://esgcheck.ch/de/",
  author = "ESGCheck",
  publishedTime = "2026-04-28T00:00:00+02:00",
  modifiedTime = "2026-04-30T00:00:00+02:00",
  ogImage = "https://esgcheck.ch/og-image.jpg",
  ogImageType = "image/jpeg",
  ogImageWidth = 1200,
  ogImageHeight = 630,
  ogImageAlt = "ESGCheck praxisnahe ESG-Ersteinschätzung für wachsende KMU",
  alternateLinks = [],
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
      <meta name="author" content={author} />
      <meta name="date" content={publishedTime} />
      <link rel="canonical" href={canonicalUrl} />
      {alternateLinks.map(({ hrefLang, href }) => (
        <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={href} />
      ))}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="ESGCheck" />
      <meta property="article:author" content={author} />
      <meta property="article:published_time" content={publishedTime} />
      <meta property="article:modified_time" content={modifiedTime} />
      <meta property="og:updated_time" content={modifiedTime} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:type" content={ogImageType} />
      <meta property="og:image:width" content={String(ogImageWidth)} />
      <meta property="og:image:height" content={String(ogImageHeight)} />
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
