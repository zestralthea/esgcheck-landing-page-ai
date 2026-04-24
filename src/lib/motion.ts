import type { Transition, Variants } from "framer-motion";

type ReducedMotion = boolean | undefined;

export const viewportOnce = {
  once: true,
  amount: 0.18,
  margin: "0px 0px -35% 0px",
} as const;

export const entranceEase = [0.22, 1, 0.36, 1] as const;

export const entranceTransition: Transition = {
  duration: 0.58,
  ease: entranceEase,
};

export const microSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.8,
};

const reducedTransition: Transition = {
  duration: 0.01,
};

const createReveal = (x: number, y: number, duration = entranceTransition.duration ?? 0.58): Variants => ({
  hidden: (reduced: ReducedMotion) => (reduced ? { opacity: 0 } : { opacity: 0, x, y }),
  visible: (reduced: ReducedMotion) =>
    reduced
      ? { opacity: 1, x: 0, y: 0, transition: reducedTransition }
      : {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration,
            ease: entranceEase,
          },
        },
});

export const revealUp = createReveal(0, 24);
export const revealLeft = createReveal(-28, 0, 0.65);
export const revealRight = createReveal(28, 0, 0.65);

export const staggerContainer: Variants = {
  hidden: {},
  visible: (reduced: ReducedMotion) =>
    reduced
      ? {
          transition: {
            when: "beforeChildren",
            ...reducedTransition,
          },
        }
      : {
          transition: {
            delayChildren: 0.06,
            staggerChildren: 0.08,
          },
        },
};

export const cardHover = {
  whileHover: {
    y: -3,
    scale: 1.01,
    transition: {
      duration: 0.22,
      ease: entranceEase,
    },
  },
  whileTap: {
    scale: 0.98,
    transition: microSpring,
  },
} as const;

export const timelineLineX: Variants = {
  hidden: (reduced: ReducedMotion) =>
    reduced ? { opacity: 0 } : { opacity: 0, scaleX: 0, originX: 0 },
  visible: (reduced: ReducedMotion) =>
    reduced
      ? { opacity: 1, scaleX: 1, transition: reducedTransition }
      : {
          opacity: 1,
          scaleX: 1,
          originX: 0,
          transition: {
            duration: 0.72,
            ease: entranceEase,
          },
        },
};

export const timelineLineY: Variants = {
  hidden: (reduced: ReducedMotion) =>
    reduced ? { opacity: 0 } : { opacity: 0, scaleY: 0, originY: 0 },
  visible: (reduced: ReducedMotion) =>
    reduced
      ? { opacity: 1, scaleY: 1, transition: reducedTransition }
      : {
          opacity: 1,
          scaleY: 1,
          originY: 0,
          transition: {
            duration: 0.72,
            ease: entranceEase,
          },
        },
};

export const faqExpand: Variants = {
  collapsed: (reduced: ReducedMotion) =>
    reduced
      ? {
          opacity: 0,
          height: 0,
          transition: reducedTransition,
        }
      : {
          opacity: 0,
          height: 0,
          transition: {
            height: {
              duration: 0.24,
              ease: entranceEase,
            },
            opacity: {
              duration: 0.16,
            },
          },
        },
  open: (reduced: ReducedMotion) =>
    reduced
      ? {
          opacity: 1,
          height: "auto",
          transition: reducedTransition,
        }
      : {
          opacity: 1,
          height: "auto",
          transition: {
            height: {
              duration: 0.28,
              ease: entranceEase,
            },
            opacity: {
              duration: 0.2,
              delay: 0.03,
            },
          },
        },
};
