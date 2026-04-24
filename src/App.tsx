import { HelmetProvider } from "react-helmet-async";
import { domAnimation, LazyMotion, MotionConfig } from "framer-motion";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";

const App = () => (
  <HelmetProvider>
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <LanguageProvider>
          <Index />
        </LanguageProvider>
      </LazyMotion>
    </MotionConfig>
  </HelmetProvider>
);

export default App;

