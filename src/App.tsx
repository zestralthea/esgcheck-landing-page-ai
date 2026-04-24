
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";

const App = () => (
  <HelmetProvider>
    <LanguageProvider>
      <Index />
      <Analytics />
    </LanguageProvider>
  </HelmetProvider>
);

export default App;



