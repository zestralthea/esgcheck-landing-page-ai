
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { WaitlistModalProvider } from "@/hooks/useWaitlistModal";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense } from 'react';
const Index = lazy(() => import('./pages/Index'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
import RouteTransitionOverlay from "@/components/RouteTransitionOverlay";
import RouteLoader from "@/components/RouteLoader";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  const { user } = useAuth();
  return (
    <>
      <RouteTransitionOverlay />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <Suspense fallback={<RouteLoader />}> 
            <Index />
          </Suspense>
        } />
        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : (
            <Suspense fallback={<RouteLoader />}> 
              <Auth />
            </Suspense>
          )}
        />
        <Route path="/dashboard" element={
          <Suspense fallback={<RouteLoader />}> 
            <Dashboard />
          </Suspense>
        } />
        <Route path="/admin" element={
          <Suspense fallback={<RouteLoader />}> 
            <Admin />
          </Suspense>
        } />
        <Route path="*" element={
          <Suspense fallback={<RouteLoader />}> 
            <NotFound />
          </Suspense>
        } />
      </Routes>
    </>
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <LanguageProvider>
            <WaitlistModalProvider>
              <Toaster />
              <BrowserRouter>
                <AnimatedRoutes />
              </BrowserRouter>
            </WaitlistModalProvider>
          </LanguageProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;



