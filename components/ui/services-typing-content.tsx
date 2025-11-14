"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useContainerScrollProgress } from "@/components/ui/container-scroll-animation";

type ServicesTypingContentProps = {
  serviceItems: string[];
};

const animationTriggerThreshold = 0.38;
const animationCompletionThreshold = 0.9;
const revealDelayMs = 160;
const totalStages = 4;

export function ServicesTypingContent({ serviceItems }: ServicesTypingContentProps) {
  const prefersReducedMotion = useReducedMotion();

  const [hasStarted, setHasStarted] = useState(false);
  // Start with all text visible - will animate if needed when scrolling
  const [visibleStage, setVisibleStage] = useState(totalStages);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number>(prefersReducedMotion ? 0 : 0);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollProgress } = useContainerScrollProgress();

  const servicesExpertiseRef = useRef<HTMLDivElement | null>(null);
  const labelWrapperRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const labelYOffsetRaw = useMotionValue(0);
  const labelYOffset = useSpring(labelYOffsetRaw, {
    stiffness: 300,
    damping: 30,
  });

  const serviceCount = serviceItems.length;
  const baseTransition = useMemo(
    () =>
      prefersReducedMotion
        ? { duration: 0 }
        : {
            duration: 0.45,
            ease: [0.32, 0.16, 0.24, 1],
          },
    [prefersReducedMotion],
  );

  useEffect(() => {
    // Initialize immediately to show content
    const currentProgress = scrollProgress.get();
    if (currentProgress >= animationTriggerThreshold || prefersReducedMotion) {
      setHasStarted(true);
      setVisibleStage(totalStages);
      setActiveServiceIndex(prefersReducedMotion ? 0 : 0);
      return undefined;
    }
  }, [prefersReducedMotion, scrollProgress]);

  useEffect(() => {
    if (hasStarted || prefersReducedMotion) {
      return undefined;
    }

    // Check initial scroll position
    const currentProgress = scrollProgress.get();
    if (currentProgress >= animationTriggerThreshold) {
      // Already past threshold, show everything immediately
      setHasStarted(true);
      setVisibleStage(totalStages);
      setActiveServiceIndex(0);
      return undefined;
    }

    // Listen for scroll to reach threshold
    const unsubscribe = scrollProgress.on("change", (value) => {
      if (value >= animationTriggerThreshold) {
        setHasStarted(true);
        // Trigger animation sequence when threshold is reached
      }
    });

    return () => {
      unsubscribe();
    };
  }, [hasStarted, prefersReducedMotion, scrollProgress]);

  useEffect(() => {
    if (!hasStarted || prefersReducedMotion) {
      return undefined;
    }

    // When animation starts, check if we should animate or keep visible
    const currentProgress = scrollProgress.get();
    
    // If already past threshold when animation starts, keep text visible
    if (currentProgress >= animationTriggerThreshold) {
      setVisibleStage(totalStages);
      setActiveServiceIndex(0);
      return undefined;
    }

    // Otherwise, animate the stages in sequence as user scrolls into view
    setVisibleStage(0);

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const triggerStage = (stage: number, delay: number) => {
      const timeoutId = setTimeout(() => {
        setVisibleStage(stage);
      }, delay);
      timeouts.push(timeoutId);
    };

    for (let stage = 1; stage <= totalStages; stage += 1) {
      triggerStage(stage, stage * revealDelayMs);
    }

    return () => {
      timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, [hasStarted, prefersReducedMotion, scrollProgress]);

  useEffect(() => {
    if (!hasStarted || prefersReducedMotion || serviceCount === 0) {
      return undefined;
    }

    const start = animationTriggerThreshold;
    const end = animationCompletionThreshold;
    const range = Math.max(end - start, 0.0001);

    const updateActiveIndex = (value: number) => {
      if (value < start) {
        setActiveServiceIndex((prev) => (prev === -1 ? prev : -1));
        return;
      }

      const clampedValue = Math.min(Math.max(value, start), end);
      const normalized = (clampedValue - start) / range;
      const nextIndex = Math.min(serviceCount - 1, Math.floor(normalized * serviceCount));

      setActiveServiceIndex((prev) => (prev !== nextIndex ? nextIndex : prev));
    };

    const unsubscribe = scrollProgress.on("change", updateActiveIndex);

    updateActiveIndex(scrollProgress.get());

    return () => {
      unsubscribe();
    };
  }, [hasStarted, prefersReducedMotion, scrollProgress, serviceCount]);

  const expertLabelShift = prefersReducedMotion ? 0 : -6;

  const updateLabelPosition = useCallback(
    (index: number) => {
      if (prefersReducedMotion || index < 0) {
        return;
      }

      const container = servicesExpertiseRef.current;
      const labelEl = labelRef.current;
      const itemEl = itemRefs.current[index];

      if (!container || !labelEl || !itemEl) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const itemRect = itemEl.getBoundingClientRect();
      const labelRect = labelEl.getBoundingClientRect();

      const offset = itemRect.top - containerRect.top + itemRect.height / 2 - labelRect.height / 2;
      labelYOffsetRaw.set(offset);
    },
    [prefersReducedMotion, labelYOffsetRaw],
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined;
    }

    if (visibleStage < 4 || activeServiceIndex < 0) {
      labelYOffsetRaw.set(0);
      return undefined;
    }

    const raf = requestAnimationFrame(() => updateLabelPosition(activeServiceIndex));
    return () => cancelAnimationFrame(raf);
  }, [activeServiceIndex, prefersReducedMotion, updateLabelPosition, visibleStage, labelYOffsetRaw]);

  useEffect(() => {
    if (prefersReducedMotion || typeof window === "undefined") {
      return undefined;
    }

    const handleResize = () => {
      if (visibleStage >= 4 && activeServiceIndex >= 0) {
        updateLabelPosition(activeServiceIndex);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [prefersReducedMotion, activeServiceIndex, updateLabelPosition, visibleStage]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);

    const handleChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return (
    <div className="services-card services-card--scroll">
      <div className="services-card-copy">
        <span
          className={`section-eyebrow services-eyebrow services-fade${visibleStage >= 1 ? " services-fade--visible" : ""}`}
          style={{ opacity: visibleStage >= 1 ? 1 : 0 }}
        >
          Services
        </span>
        <h2 
          className={`services-title services-fade${visibleStage >= 2 ? " services-fade--visible" : ""}`}
          style={{ opacity: visibleStage >= 2 ? 1 : 0 }}
        >
          Every Detail, Perfectly Designed to Last.
        </h2>
      </div>
      <div
        className={`services-expertise services-expertise--scroll services-fade${
          visibleStage >= 4 ? " services-fade--visible" : ""
        }`}
        style={{ opacity: visibleStage >= 4 ? 1 : 0 }}
        ref={servicesExpertiseRef}
      >
        <div className="expert-label-wrapper" ref={labelWrapperRef}>
          <motion.span
            className="expert-label"
            aria-hidden="true"
            ref={labelRef}
            initial={false}
            style={{
              y: prefersReducedMotion ? expertLabelShift : labelYOffset,
            }}
            animate={{
              opacity: visibleStage >= 4 ? 1 : 0.7,
            }}
            transition={baseTransition}
          >
            Offering
          </motion.span>
        </div>
        <ul
          className="services-list services-list--scroll"
          aria-label="Areas of expertise"
          aria-live="polite"
        >
          {serviceItems.map((service, index) => {
            const isActive = index === activeServiceIndex || (prefersReducedMotion && index === 0);

            return (
              <motion.li
                key={service}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                className={`service-item service-item--scroll${isActive ? " is-active" : ""}`}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0.32,
                  color: isActive ? "#f0f4ff" : "rgba(255, 255, 255, 0.45)",
                  y: isActive ? (isMobile ? -3 : -4) : 0,
                }}
                whileHover={{ color: "#b4c7e8" }}
                transition={baseTransition}
                aria-current={isActive ? "true" : undefined}
              >
                <motion.span
                  className="service-item__pulse"
                  aria-hidden="true"
                  initial={false}
                  animate={{
                    opacity: isActive ? 0.72 : 0.28,
                    scaleY: isActive && !prefersReducedMotion ? 1.1 : 1,
                  }}
                  transition={baseTransition}
                />
                <span className="service-item__label">
                  <span className="service-label">{service}</span>
                  <motion.span
                    className="service-item__underline"
                    aria-hidden="true"
                    initial={false}
                    animate={{
                      scaleX: isActive ? 1 : 0,
                      opacity: isActive ? 0.88 : 0.32,
                    }}
                    whileHover={{ backgroundColor: "#526d9c" }}
                    transition={baseTransition}
                  />
                </span>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

