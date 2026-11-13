// src/lib/animations.ts
import { gsap } from 'gsap';

// Respeita a preferência de movimento reduzido (Acessibilidade WCAG 2.2)
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Animação suave em cascata (stagger) para cards de eventos e listas
 */
export const animateCardsEntrance = (
  targets: string | Element | Element[] | HTMLCollection | NodeListOf<Element>
) => {
  const elements =
    typeof targets === 'string'
      ? targets
      : targets instanceof Element
      ? targets
      : Array.from(targets);

  if (prefersReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0 });
    return;
  }

  gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 20,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power2.out',
    }
  );
};

/**
 * Animação elegante de entrada para banners institucionais e heros
 */
export const animateHeroEntrance = (target: string | Element) => {
  if (prefersReducedMotion()) {
    gsap.set(target, { opacity: 1, scale: 1 });
    return;
  }

  gsap.fromTo(
    target,
    {
      opacity: 0,
      y: 16,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
    }
  );
};

/**
 * Transição de abertura de modais e gavetas
 */
export const animateModalEntrance = (target: string | Element) => {
  if (prefersReducedMotion()) {
    gsap.set(target, { opacity: 1, scale: 1 });
    return;
  }

  gsap.fromTo(
    target,
    {
      opacity: 0,
      scale: 0.96,
      y: 12,
    },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.28,
      ease: 'back.out(1.2)',
    }
  );
};
