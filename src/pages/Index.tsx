
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import WaitlistCTA from "@/components/WaitlistCTA";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import SEOHead from "@/components/SEOHead";
import { Helmet } from "react-helmet-async";
import CredibilitySection from "@/components/CredibilitySection";
import AudienceSection from "@/components/AudienceSection";
import TeamSection from "@/components/TeamSection";
import FAQSection from "@/components/FAQSection";
import {
  defaultLanguage,
  getLocaleUrl,
  languageMetadata,
  siteBaseUrl,
  supportedLanguages,
  useLanguage,
} from "@/contexts/LanguageContext";

const faqItems = ["certification", "documents", "audience", "pricing"] as const;

const Index = () => {
  const { t, language } = useLanguage();
  const structuredDataLanguage = languageMetadata[language].hrefLang;
  const canonicalUrl = getLocaleUrl(language);
  const logoUrl = `${siteBaseUrl}/esgcheck_logo.svg`;
  const organizationId = `${siteBaseUrl}/#organization`;
  const websiteId = `${siteBaseUrl}/#website`;
  const alternateLinks = [
    ...supportedLanguages.map((lang) => ({
      hrefLang: languageMetadata[lang].hrefLang,
      href: getLocaleUrl(lang),
    })),
    {
      hrefLang: "x-default",
      href: getLocaleUrl(defaultLanguage),
    },
  ];

  const homeStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      "name": "ESGCheck",
      "url": siteBaseUrl,
      "logo": logoUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      "name": "ESGCheck",
      "url": siteBaseUrl,
      "inLanguage": structuredDataLanguage,
      "publisher": {
        "@id": organizationId,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "ESGCheck",
      "description": t("seo.structuredData.description"),
      "url": canonicalUrl,
      "logo": logoUrl,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "inLanguage": structuredDataLanguage,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "CHF",
        "availability": "https://schema.org/InStock"
      },
      "provider": {
        "@id": organizationId
      },
      "featureList": [
        t("seo.structuredData.featureList.documentFirst"),
        t("seo.structuredData.featureList.scoreRationale"),
        t("seo.structuredData.featureList.strengthsGaps"),
        t("seo.structuredData.featureList.nextSteps"),
        t("seo.structuredData.featureList.swissPrivacy")
      ],
      "keywords": t("seo.keywords")
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "url": `${canonicalUrl}#faq`,
      "inLanguage": structuredDataLanguage,
      "mainEntity": faqItems.map((item) => ({
        "@type": "Question",
        "name": t(`faq.items.${item}.question`),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t(`faq.items.${item}.answer`),
        },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <link rel="preload" as="video" href="/ESGCheck_hero_compressed.webm" type="video/webm" />
      </Helmet>
      <SEOHead
        title={t("seo.title")}
        description={t("seo.description")}
        keywords={t("seo.keywords")}
        canonicalUrl={canonicalUrl}
        ogImageAlt={t("seo.ogImageAlt")}
        alternateLinks={alternateLinks}
        structuredData={homeStructuredData}
      />

      <Header />
      <Hero />
      <Features />
      <AboutSection />
      <CredibilitySection />
      <AudienceSection />
      <TeamSection />
      <FAQSection />
      <WaitlistCTA />
      <Footer />
    </div>
  );
};

export default Index;
