import { PropsWithChildren } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type PageTransitionProps = PropsWithChildren<{ className?: string }>;

export default function PageTransition({ children, className }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  const subtle = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.18, ease: 'easeOut' as const },
  } as const;

  const reduced = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.18, ease: 'easeOut' as const },
  } as const;

  const cfg = prefersReducedMotion ? reduced : subtle;

  return (
    <motion.div
      className={className}
      style={{ willChange: 'opacity', transform: 'translateZ(0)', isolation: 'isolate' }}
      initial={cfg.initial}
      animate={cfg.animate}
      exit={cfg.exit}
      transition={cfg.transition}
      onAnimationStart={() => {
        try {
          const w = window as any;
          w.__routeTransitions = (w.__routeTransitions || 0) + 1;
          document.documentElement.classList.add('route-transitioning');
        } catch {}
      }}
      onAnimationComplete={() => {
        try {
          const w = window as any;
          w.__routeTransitions = Math.max(0, (w.__routeTransitions || 1) - 1);
          if (w.__routeTransitions === 0) {
            document.documentElement.classList.remove('route-transitioning');
          }
        } catch {}
      }}
    >
      {children}
    </motion.div>
  );
}
