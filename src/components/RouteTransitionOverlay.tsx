import { useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function RouteTransitionOverlay() {
  const location = useLocation();
  const controls = useAnimationControls();
  const [active, setActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setActive(true);
      try { document.documentElement.classList.add('route-transitioning'); } catch {}
      await controls.start({ opacity: 1, transition: { duration: 0.12, ease: 'easeOut' } });
      await new Promise((r) => setTimeout(r, 60));
      await controls.start({ opacity: 0, transition: { duration: 0.16, ease: 'easeOut' } });
      if (!cancelled) {
        setActive(false);
        try { document.documentElement.classList.remove('route-transitioning'); } catch {}
      }
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!active) return null;

  return (
    <motion.div
      className="route-loader fixed inset-0 z-[100] grid place-items-center bg-background/95"
      initial={{ opacity: 0 }}
      animate={controls}
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    </motion.div>
  );
}
