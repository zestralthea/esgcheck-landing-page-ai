import { PropsWithChildren } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type PageTransitionProps = PropsWithChildren<{ className?: string }>;

export default function PageTransition({ children, className }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  const subtle = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.22, ease: 'easeOut' as const },
  } as const;

  const reduced = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.22, ease: 'easeOut' as const },
  } as const;

  const cfg = prefersReducedMotion ? reduced : subtle;

  return (
    <motion.div
      className={className}
      layout
      initial={cfg.initial}
      animate={cfg.animate}
      exit={cfg.exit}
      transition={cfg.transition}
    >
      {children}
    </motion.div>
  );
}
