
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import WaitlistCTA from "@/components/WaitlistCTA";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import SEOHead from "@/components/SEOHead";
import { Helmet } from "react-helmet-async";
import CredibilitySection from "@/components/CredibilitySection";
import RoadmapSection from "@/components/RoadmapSection";
import AudienceSection from "@/components/AudienceSection";
import TeamSection from "@/components/TeamSection";
import FAQSection from "@/components/FAQSection";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t, language } = useLanguage();
  const structuredDataLanguage =
    language === "de" ? "de-CH" : language === "fr" ? "fr-CH" : "en";

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ESGCheck",
    "description": t("seo.structuredData.description"),
    "url": "https://esgcheck.lovable.app/",
    "logo": "https://esgcheck.lovable.app/esgcheck_logo.svg",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "inLanguage": structuredDataLanguage,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "provider": {
      "@type": "Organization",
      "name": "ESGCheck",
      "url": "https://esgcheck.lovable.app/"
    },
    "featureList": [
      t("seo.structuredData.featureList.documentFirst"),
      t("seo.structuredData.featureList.scoreRationale"),
      t("seo.structuredData.featureList.strengthsGaps"),
      t("seo.structuredData.featureList.nextSteps"),
      t("seo.structuredData.featureList.swissPrivacy")
    ],
    "keywords": t("seo.keywords")
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <link rel="preload" as="video" href="/ESGCheck_hero_compressed.webm" type="video/webm" />
      </Helmet>
      <SEOHead
        title={t("seo.title")}
        description={t("seo.description")}
        keywords={t("seo.keywords")}
        ogImageAlt={t("seo.ogImageAlt")}
        structuredData={homeStructuredData}
      />

      <Header />
      <Hero />
      <Features />
      <AboutSection />
      <CredibilitySection />
      <RoadmapSection />
      <AudienceSection />
      <TeamSection />
      <FAQSection />
      <WaitlistCTA />
      <Footer />
    </div>
  );
};

export default Index;
