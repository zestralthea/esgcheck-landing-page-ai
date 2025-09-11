import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWaitlistModal } from "@/hooks/useWaitlistModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { Link, useLocation } from "react-router-dom";
import LanguageToggle from "./LanguageToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const smoothScrollTo = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 2);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const { openModal } = useWaitlistModal();
  const { t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const { isEnabled } = useFeatureFlags();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const prefetchAuth = () => {
    import('@/pages/Auth');
  };
  const prefetchDashboard = () => {
    if (isEnabled('dashboard_enabled')) {
      import('@/pages/Dashboard');
      // Warm common heavy panels to avoid first-paint jank
      import('@/components/ESGInsightsPanel');
      import('@/components/ESGScoreSnapshot');
      import('@/components/ESGReportsTable');
    }
  };

  const handleNavClick = (sectionId: string) => {
    if (isHomePage) {
      smoothScrollTo(sectionId);
    } else {
      // Navigate to home page with hash
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        <div className="container mx-auto px-2 md:px-4">
          <div
            className={
              `hairline-sep-b backdrop-blur transition-colors duration-300 rounded-xl md:rounded-2xl ring-1 ring-border/10 ` +
              (scrolled
                ? "bg-background/55 supports-[backdrop-filter]:bg-background/45"
                : "bg-background/90 supports-[backdrop-filter]:bg-background/70")
            }
          >
            <div className="h-14 md:h-16 relative flex items-center px-2 md:px-4">
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src="/esgcheck_logo.svg" 
                  alt="ESGCheck Logo" 
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-foreground">ESGCheck</span>
              </Link>
        
              <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
              <button 
                onClick={() => handleNavClick('features')}
                className="transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {t('header.features')}
              </button>
              <button 
                onClick={() => handleNavClick('about')}
                className="transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {t('header.about')}
              </button>
              </nav>
        
              <div className="flex items-center space-x-2 ml-auto">
              {user ? (
                <>
                  {/* Dashboard button - only show if dashboard is enabled and user has access */}
                  {isEnabled('dashboard_enabled') && profile?.dashboard_access && (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/dashboard" onMouseEnter={prefetchDashboard} onFocus={prefetchDashboard}>Dashboard</Link>
                    </Button>
                  )}
                  
                  {/* User menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {profile?.full_name 
                              ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                              : user.email?.[0]?.toUpperCase() || '?'
                            }
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          {profile?.full_name && (
                            <p className="font-medium">{profile.full_name}</p>
                          )}
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      {isEnabled('dashboard_enabled') && profile?.dashboard_access && (
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard">Dashboard</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={signOut}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="hero" size="sm" onClick={openModal}>
                    {t('header.joinWaitlist')}
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/auth" onMouseEnter={prefetchAuth} onFocus={prefetchAuth}>Sign In</Link>
                  </Button>
                </>
              )}
              <LanguageToggle />
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Spacer to offset fixed header height */}
      <div className="h-14 md:h-16" />
    </>
  );
}
