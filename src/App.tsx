
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";

const App = () => (
  <HelmetProvider>
    <LanguageProvider>
      <Index />
    </LanguageProvider>
  </HelmetProvider>
);

export default App;



