import { useState, useEffect, useRef } from 'react';

export interface HeroScrollOptions {
  /** The element ID of the hero section. Defaults to 'section-0' */
  heroId?: string;
  /** Total number of narrative sections (0 to N-1). Defaults to 5 */
  sectionCount?: number;
  /** Smoothing interpolation factor (0.05 - 0.3). Defaults to 0.1 */
  smoothing?: number;
}

export interface HeroScrollProgress {
  /** Normalized progress through the hero section [0.0 to 1.0] (0 = top, 1 = scrolled through hero) */
  heroProgress: number;
  /** Smoothed progress through the hero section for fluid cinematic 60fps animations */
  smoothHeroProgress: number;
  /** Normalized progress of the entire page [0.0 to 1.0] */
  pageProgress: number;
  /** Smoothed full-page progress [0.0 to 1.0] */
  smoothPageProgress: number;
  /** Currently active section index (0 to sectionCount - 1) */
  activeSection: number;
  /** Whether the hero section is currently intersecting / visible in the viewport */
  isHeroVisible: boolean;
  /** Current scroll velocity normalized */
  scrollVelocity: number;
}

/**
 * Custom scroll-driven animation hook that calculates high-precision, normalized
 * scroll progress across the landing page hero section and passes normalized values
 * for subtle, cinematic 3D globe rotation and camera transitions.
 */
export function useHeroScrollProgress(options: HeroScrollOptions = {}): HeroScrollProgress {
  const {
    heroId = 'section-0',
    sectionCount = 5,
    smoothing = 0.1,
  } = options;

  const [state, setState] = useState<HeroScrollProgress>({
    heroProgress: 0,
    smoothHeroProgress: 0,
    pageProgress: 0,
    smoothPageProgress: 0,
    activeSection: 0,
    isHeroVisible: true,
    scrollVelocity: 0,
  });

  // Mutable refs for high-frequency RAF loop updates
  const targetHeroProgress = useRef<number>(0);
  const currentHeroProgress = useRef<number>(0);
  const targetPageProgress = useRef<number>(0);
  const currentPageProgress = useRef<number>(0);
  const currentActiveSection = useRef<number>(0);
  const isHeroVisibleRef = useRef<boolean>(true);
  const lastScrollY = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const calculateScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const windowHeight = window.innerHeight || 1;
      const totalDocHeight = document.documentElement.scrollHeight - windowHeight;

      // 1. Overall page progress [0, 1]
      const rawPageProgress = totalDocHeight > 0 ? Math.min(1, Math.max(0, scrollY / totalDocHeight)) : 0;
      targetPageProgress.current = rawPageProgress;

      // 2. Hero-specific progress [0, 1]
      const heroEl = document.getElementById(heroId);
      if (heroEl) {
        const heroRect = heroEl.getBoundingClientRect();
        const heroHeight = heroEl.offsetHeight || windowHeight;
        const heroTop = heroEl.offsetTop || 0;

        // Progress from top of hero (0) to bottom of hero exiting view (1)
        const scrolledInHero = scrollY - heroTop;
        const rawHeroProgress = Math.min(1, Math.max(0, scrolledInHero / Math.max(1, heroHeight)));
        targetHeroProgress.current = rawHeroProgress;

        // Check visibility
        isHeroVisibleRef.current = heroRect.bottom > 0 && heroRect.top < windowHeight;
      } else {
        // Fallback: estimate hero as 1 full viewport height
        targetHeroProgress.current = Math.min(1, Math.max(0, scrollY / windowHeight));
        isHeroVisibleRef.current = scrollY < windowHeight * 1.2;
      }

      // 3. Calculate active section
      const scrollMiddle = scrollY + windowHeight * 0.45;
      let activeIdx = 0;

      for (let i = 0; i < sectionCount; i++) {
        const secEl = document.getElementById(`section-${i}`);
        if (secEl) {
          const top = secEl.offsetTop;
          const height = secEl.offsetHeight;
          if (scrollMiddle >= top && scrollMiddle < top + height) {
            activeIdx = i;
            break;
          }
        }
      }
      currentActiveSection.current = activeIdx;

      // 4. Calculate instantaneous scroll velocity
      const deltaScroll = Math.abs(scrollY - lastScrollY.current);
      velocityRef.current = Math.min(1, deltaScroll / 50);
      lastScrollY.current = scrollY;
    };

    // Smooth RAF loop for 60fps cinematic interpolation
    const updateLoop = () => {
      if (prefersReducedMotion) {
        setState({
          heroProgress: 0,
          smoothHeroProgress: 0,
          pageProgress: 0,
          smoothPageProgress: 0,
          activeSection: currentActiveSection.current,
          isHeroVisible: isHeroVisibleRef.current,
          scrollVelocity: 0,
        });
        return;
      }

      // Exponential damping
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      currentHeroProgress.current = lerp(currentHeroProgress.current, targetHeroProgress.current, smoothing);
      currentPageProgress.current = lerp(currentPageProgress.current, targetPageProgress.current, smoothing);
      velocityRef.current = lerp(velocityRef.current, 0, 0.1);

      setState((prev) => {
        const heroDiff = Math.abs(prev.smoothHeroProgress - currentHeroProgress.current);
        const pageDiff = Math.abs(prev.smoothPageProgress - currentPageProgress.current);
        const rawHeroDiff = Math.abs(prev.heroProgress - targetHeroProgress.current);
        const sectionChanged = prev.activeSection !== currentActiveSection.current;
        const visChanged = prev.isHeroVisible !== isHeroVisibleRef.current;

        // Avoid unnecessary React state updates when idle
        if (
          heroDiff < 0.0002 &&
          pageDiff < 0.0002 &&
          rawHeroDiff < 0.0002 &&
          !sectionChanged &&
          !visChanged
        ) {
          return prev;
        }

        return {
          heroProgress: targetHeroProgress.current,
          smoothHeroProgress: currentHeroProgress.current,
          pageProgress: targetPageProgress.current,
          smoothPageProgress: currentPageProgress.current,
          activeSection: currentActiveSection.current,
          isHeroVisible: isHeroVisibleRef.current,
          scrollVelocity: velocityRef.current,
        };
      });

      rafId.current = requestAnimationFrame(updateLoop);
    };

    calculateScroll();
    rafId.current = requestAnimationFrame(updateLoop);

    const onScroll = () => {
      calculateScroll();
    };

    const onResize = () => {
      calculateScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [heroId, sectionCount, smoothing]);

  return state;
}
