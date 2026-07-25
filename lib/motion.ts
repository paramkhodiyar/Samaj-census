/**
 * Shared Motion Variants & Transition Configurations
 * Conforms to Apple-like motion specs defined in docs/01_DESIGN_SYSTEM.md
 */

// Apple-style ease-out-quart
export const APPLE_EASE = [0.22, 1, 0.36, 1] as const;

// Helper to check prefers-reduced-motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 1. Page / Route Transition Variant (200ms fade + 8px slide-up)
export const pageTransitionVariant = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: APPLE_EASE },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: APPLE_EASE },
  },
};

// 2. Modal / Dialog Scale + Fade (150ms)
export const modalScaleVariant = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15, ease: APPLE_EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.12, ease: APPLE_EASE },
  },
};

// 3. Staggered Container for Lists (Cap at 6 items stagger, 30ms delay per item)
export const listContainerVariant = {
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02,
    },
  },
};

// 4. Staggered Item Child
export const listItemVariant = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: APPLE_EASE },
  },
};

// 5. Card Removal Collapse-Out (250ms height collapse + fade)
export const cardCollapseVariant = {
  animate: { opacity: 1, height: 'auto' },
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    transition: { duration: 0.25, ease: APPLE_EASE },
  },
};
