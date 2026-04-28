import { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { domAnimation, LazyMotion, MotionConfig } from "framer-motion";
import { getSitePageFromPathname, LanguageProvider, type SitePage } from "@/contexts/LanguageContext";
import Confirmation from "./pages/Confirmation";
import Index from "./pages/Index";
import ThankYou from "./pages/ThankYou";

const getCurrentPage = (): SitePage =>
  typeof window === "undefined" ? "home" : getSitePageFromPathname(window.location.pathname);

function RouteSwitch() {
  const [page, setPage] = useState<SitePage>(getCurrentPage);

  useEffect(() => {
    const syncPageFromLocation = () => {
      setPage(getCurrentPage());
    };

    window.addEventListener("popstate", syncPageFromLocation);

    return () => {
      window.removeEventListener("popstate", syncPageFromLocation);
    };
  }, []);

  if (page === "confirmation") {
    return <Confirmation />;
  }

  return page === "thankYou" ? <ThankYou /> : <Index />;
}

const App = () => (
  <HelmetProvider>
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <LanguageProvider>
          <RouteSwitch />
          <Analytics />
        </LanguageProvider>
      </LazyMotion>
    </MotionConfig>
  </HelmetProvider>
);

export default App;

