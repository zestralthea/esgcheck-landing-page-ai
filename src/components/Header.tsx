import { useLayoutEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, Languages } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getLocalePath, languageMetadata, supportedLanguages, useLanguage } from "@/contexts/LanguageContext";
import { microSpring } from "@/lib/motion";
import LanguageToggle, { type LanguageToggleMode } from "./LanguageToggle";

const trustStripScrollThreshold = 4;
const languageLabels = supportedLanguages.map((code) => languageMetadata[code].label);
const preferredLanguageToggleModes = ["compact", "icon"] as const;

function LanguageToggleMeasure({ mode }: { mode: LanguageToggleMode }) {
  if (mode === "full") {
    return (
      <div className="inline-flex h-11 shrink-0 items-center justify-center gap-1 rounded-full border border-border bg-background/90 p-1 shadow-sm">
        {languageLabels.map((label, index) => (
          <span
            key={label}
            className={
              index === 0
                ? "inline-flex h-full min-w-[3.1rem] items-center justify-center rounded-full bg-primary px-3 text-xs font-medium leading-none text-primary-foreground shadow-sm"
                : "inline-flex h-full min-w-[3.1rem] items-center justify-center rounded-full px-3 text-xs font-medium leading-none text-muted-foreground"
            }
          >
            {label}
          </span>
        ))}
      </div>
    );
  }

  if (mode === "compact") {
    return (
      <div className="inline-flex h-11 shrink-0 items-center justify-center gap-1 rounded-full border border-border bg-background/90 p-1 shadow-sm">
        <span className="inline-flex h-full min-w-[3.1rem] items-center justify-center rounded-full bg-primary px-3 text-xs font-medium leading-none text-primary-foreground shadow-sm">
          DE
        </span>
        <span className="inline-flex h-full min-w-[2.75rem] items-center justify-center rounded-full px-2.5 text-foreground/75">
          <ChevronDown className="h-3.5 w-3.5" />
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm">
      <Languages className="h-[18px] w-[18px]" />
    </div>
  );
}

function ActionMeasure({
  mode,
  ctaLabel,
}: {
  mode: LanguageToggleMode;
  ctaLabel: string;
}) {
  return (
    <div className="flex items-center gap-2 leading-none">
      <span className="hidden rounded-xl px-4 py-2 text-sm font-medium leading-none md:inline-flex">
        {ctaLabel}
      </span>
      <LanguageToggleMeasure mode={mode} />
    </div>
  );
}

export default function Header() {
  const { t, language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [languageToggleMode, setLanguageToggleMode] = useState<LanguageToggleMode>("compact");
  const [headerStackHeight, setHeaderStackHeight] = useState(108);
  const [trustStripHeight, setTrustStripHeight] = useState(36);
  const [showTrustStrip, setShowTrustStrip] = useState(true);

  const trustStripInnerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const headerRowRef = useRef<HTMLDivElement>(null);
  const brandMeasureRef = useRef<HTMLDivElement>(null);
  const fullActionsMeasureRef = useRef<HTMLDivElement>(null);
  const compactActionsMeasureRef = useRef<HTMLDivElement>(null);
  const iconActionsMeasureRef = useRef<HTMLDivElement>(null);

  const trustItems = [
    t("header.trustStrip.swissBuilt"),
    t("header.trustStrip.privacy"),
    t("header.trustStrip.growingSmes"),
  ];

  const homePath = getLocalePath(language);
  const sectionHref = (hash: string) => `${homePath}${hash}`;
  const earlyAccessHref = sectionHref("#waitlist");

  const links = [
    { href: sectionHref("#product"), label: t("header.product") },
    { href: sectionHref("#how-it-works"), label: t("header.howItWorks") },
    { href: sectionHref("#why-esgcheck"), label: t("header.whyEsgCheck") },
    { href: sectionHref("#team"), label: t("header.team") },
    { href: sectionHref("#faq"), label: t("header.faq") },
  ];

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const row = headerRowRef.current;
    const brand = brandMeasureRef.current;
    const fullActions = fullActionsMeasureRef.current;
    const compactActions = compactActionsMeasureRef.current;
    const iconActions = iconActionsMeasureRef.current;

    if (!row || !brand || !fullActions || !compactActions || !iconActions) {
      return;
    }

    const pickBestMode = () => {
      const rowWidth = row.clientWidth;
      const brandWidth = brand.offsetWidth;
      const columnGap = Number.parseFloat(getComputedStyle(row).columnGap || "0") || 0;
      const actionWidths: Record<LanguageToggleMode, number> = {
        full: fullActions.offsetWidth,
        compact: compactActions.offsetWidth,
        icon: iconActions.offsetWidth,
      };
      const nextMode =
        preferredLanguageToggleModes.find(
          (mode) => brandWidth + actionWidths[mode] + columnGap <= rowWidth
        ) ?? "icon";

      setLanguageToggleMode((current) => (current === nextMode ? current : nextMode));
    };

    let frameId = 0;
    const scheduleModeCheck = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(pickBestMode);
    };

    scheduleModeCheck();

    const resizeObserver = new ResizeObserver(() => {
      scheduleModeCheck();
    });

    [row, brand, fullActions, compactActions, iconActions].forEach((element) =>
      resizeObserver.observe(element)
    );

    window.addEventListener("resize", scheduleModeCheck);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleModeCheck);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const trustStrip = trustStripInnerRef.current;
    const header = headerRef.current;

    if (!trustStrip || !header) {
      return;
    }

    const updateHeaderStackHeight = () => {
      const nextTrustStripHeight = trustStrip.offsetHeight;
      const nextHeaderHeight = nextTrustStripHeight + header.offsetHeight;

      setTrustStripHeight((current) =>
        current === nextTrustStripHeight ? current : nextTrustStripHeight
      );
      setHeaderStackHeight((current) =>
        current === nextHeaderHeight ? current : nextHeaderHeight
      );
      document.documentElement.style.setProperty("--header-height", `${nextHeaderHeight}px`);
    };

    updateHeaderStackHeight();

    const resizeObserver = new ResizeObserver(updateHeaderStackHeight);
    resizeObserver.observe(trustStrip);
    resizeObserver.observe(header);

    window.addEventListener("resize", updateHeaderStackHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeaderStackHeight);
      document.documentElement.style.removeProperty("--header-height");
    };
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateTrustStripVisibility = () => {
      const nextShowTrustStrip = window.scrollY <= trustStripScrollThreshold;

      setShowTrustStrip((current) =>
        current === nextShowTrustStrip ? current : nextShowTrustStrip
      );
    };

    let frameId = 0;
    const scheduleTrustStripVisibilityUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateTrustStripVisibility);
    };

    updateTrustStripVisibility();
    window.addEventListener("scroll", scheduleTrustStripVisibilityUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleTrustStripVisibilityUpdate);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50">
        <div
          aria-hidden={!showTrustStrip}
          className={`overflow-hidden bg-primary text-primary-foreground transition-[max-height,opacity,transform] duration-300 ease-out ${
            showTrustStrip ? "opacity-100 translate-y-0" : "pointer-events-none -translate-y-2 opacity-0"
          }`}
          style={{ maxHeight: showTrustStrip ? trustStripHeight : 0 }}
        >
          <div ref={trustStripInnerRef} className="container mx-auto flex min-h-9 flex-nowrap items-center justify-center gap-x-[clamp(0.4rem,1.2vw,1.25rem)] overflow-x-auto px-4 py-2 whitespace-nowrap text-[clamp(0.5rem,0.8vw,0.75rem)] font-medium">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-[clamp(0.25rem,0.55vw,0.375rem)] whitespace-nowrap">
                <CheckCircle2 className="h-[clamp(0.625rem,1vw,0.875rem)] w-[clamp(0.625rem,1vw,0.875rem)] shrink-0" />
                <span className="leading-none">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <header
          ref={headerRef}
          className="border border-border/80 bg-background/95 shadow-card backdrop-blur-md"
        >
          <div
            ref={headerRowRef}
            className="container mx-auto grid h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 lg:grid-cols-[auto_1fr_auto]"
          >
            <a href={sectionHref("#product")} className="flex h-full min-w-0 items-center gap-3 self-center overflow-hidden">
              <img
                src="/esgcheck_logo.svg"
                alt="ESGCheck Logo"
                className="h-8 w-8 shrink-0"
              />
              <span className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight text-foreground">
                ESGCheck
              </span>
            </a>

            <nav className="hidden h-full items-center justify-center gap-6 self-center lg:flex">
              {links.map((link) => (
                <m.a
                  key={link.href}
                  href={link.href}
                  className="inline-flex h-9 items-center text-sm font-medium leading-none text-foreground/75 transition-colors hover:text-foreground"
                  whileHover={shouldReduceMotion ? undefined : { y: -1, transition: { duration: 0.18 } }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
                >
                  {link.label}
                </m.a>
              ))}
            </nav>

            <div className="flex h-full items-center justify-self-end gap-2 self-center leading-none">
              <m.div
                whileHover={shouldReduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98, transition: microSpring }}
              >
                <Button asChild variant="hero" size="sm" className="hidden self-center rounded-xl px-4 leading-none transition-[box-shadow,opacity] hover:shadow-glow md:inline-flex">
                  <a href={earlyAccessHref}>{t("header.joinWaitlist")}</a>
                </Button>
              </m.div>
              <div className="shrink-0">
                <LanguageToggle mode={languageToggleMode} />
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute left-4 top-0 -z-10 flex w-max flex-col gap-2 opacity-0">
            <div
              ref={brandMeasureRef}
              className="flex items-center gap-3 whitespace-nowrap text-2xl font-semibold leading-none tracking-tight"
            >
              <img src="/esgcheck_logo.svg" alt="" className="h-8 w-8 shrink-0" />
              <span>ESGCheck</span>
            </div>
            <div ref={fullActionsMeasureRef}>
              <ActionMeasure mode="full" ctaLabel={t("header.joinWaitlist")} />
            </div>
            <div ref={compactActionsMeasureRef}>
              <ActionMeasure mode="compact" ctaLabel={t("header.joinWaitlist")} />
            </div>
            <div ref={iconActionsMeasureRef}>
              <ActionMeasure mode="icon" ctaLabel={t("header.joinWaitlist")} />
            </div>
          </div>
        </header>
      </div>

      <div aria-hidden="true" style={{ height: headerStackHeight }} />
    </>
  );
}
