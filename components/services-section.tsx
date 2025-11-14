/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import { PhoneCall, Sparkles, Wrench } from "lucide-react";
import {
  ContainerScroll,
  useContainerScrollProgress
} from "@/components/ui/container-scroll-animation";
import { Button } from "@/components/ui/button";

const services = [
  {
    title: "Advisory Sessions",
    description:
      "Work one-on-one with our consultants to build a roadmap that unlocks new growth opportunities for your brand.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    icon: Sparkles
  },
  {
    title: "Operations Automation",
    description:
      "Streamline repetitive workflows with bespoke automations that keep your team focused on the work that matters.",
    image:
      "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1200&q=80",
    icon: Wrench
  },
  {
    title: "Concierge Support",
    description:
      "Access a dedicated partner who keeps your initiatives on track with proactive, data-driven recommendations.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    icon: PhoneCall
  }
];

export function ServicesSection() {
  return (
    <section
      id="services"
      className="relative mx-auto w-full max-w-6xl overflow-visible px-6 pb-32 pt-24 lg:px-12"
    >
      <ContainerScroll
        titleComponent={
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              End-to-end services crafted for modern teams
            </h2>
            <p className="text-lg text-muted-foreground md:text-xl">
              From whiteboard strategy to sustained delivery, we keep your
              business moving with flexible support, automated workflows, and a
              dedicated concierge partner.
            </p>
          </div>
        }
      >
        <ServicesContent />
      </ContainerScroll>
    </section>
  );
}

const ServicesContent = () => {
  const { scrollProgress } = useContainerScrollProgress();
  const servicesOpacity = useTransform(scrollProgress, [0.28, 0.34, 0.7, 0.8], [1, 0.04, 0.04, 1]);

  return (
    <div className="relative h-full">
      <ExpertiseSpotlight />
      <motion.div
        style={{ opacity: servicesOpacity }}
        className="relative z-10 grid h-full gap-8 p-4 md:grid-cols-3 md:p-6"
      >
          {services.map((service) => (
            <article
              key={service.title}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-2xl"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  priority={service.title === "Advisory Sessions"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col gap-6 p-8">
                <div className="flex items-center gap-3 text-primary">
                  <service.icon className="h-6 w-6" />
                  <span className="text-sm font-medium uppercase tracking-[0.2em]">
                    {service.title}
                  </span>
                </div>
                <p className="text-base text-muted-foreground">
                  {service.description}
                </p>
                <Button
                  variant="link"
                  className="px-0 text-base font-semibold"
                  aria-label={`Learn more about ${service.title}`}
                >
                  Learn more
                </Button>
              </div>
            </article>
          ))}
      </motion.div>
        </div>
  );
};

const expertiseHighlights = ["Web Design", "SEO", "Branding", "Marketing"];

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const ExpertiseSpotlight = () => {
  const { scrollProgress } = useContainerScrollProgress();
  
  // Overlay fades in when card is flat, fades out when card tilts away
  const overlayOpacity = useTransform(scrollProgress, [0.24, 0.3, 0.7, 0.76], [0, 1, 1, 0]);
  
  // Animation happens between these scroll progress values
  const animationStart = 0.3;
  const animationEnd = 0.65;
  
  const listWrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const [labelOffset, setLabelOffset] = useState(28);
  const [itemPositions, setItemPositions] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    if (!labelRef.current) {
      return;
    }
    const { height } = labelRef.current.getBoundingClientRect();
    setLabelOffset(Math.round(height + 16));
  }, []);

  useLayoutEffect(() => {
    const computePositions = () => {
      if (!listWrapperRef.current || !listRef.current) {
        return;
      }

      const wrapperRect = listWrapperRef.current.getBoundingClientRect();
      const items = Array.from(
        listRef.current.querySelectorAll<HTMLElement>("[data-expertise-item]")
      );

      if (!items.length) {
        return;
      }

      const offsets = items.map((item) => item.getBoundingClientRect().top - wrapperRect.top);
      setItemPositions(offsets);
      setActiveIndex(0);
    };

    computePositions();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", computePositions);
    }

    let resizeObserver: ResizeObserver | undefined;
    if (
      typeof window !== "undefined" &&
      "ResizeObserver" in window &&
      listWrapperRef.current
    ) {
      resizeObserver = new ResizeObserver(computePositions);
      resizeObserver.observe(listWrapperRef.current);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", computePositions);
      }
      resizeObserver?.disconnect();
    };
  }, []);

  const { progressStops, targetOffsets, indexStops, easeStops } = useMemo(() => {
    if (itemPositions.length <= 1) {
      const singleOffset = (itemPositions[0] ?? 0) - labelOffset;
      return {
        progressStops: [animationStart, animationEnd],
        targetOffsets: [singleOffset, singleOffset],
        indexStops: [0, 0],
        easeStops: [easeInOutCubic]
      };
    }

    const steps = itemPositions.length - 1;
    const range = animationEnd - animationStart;

    const stops = itemPositions.map(
      (_, index) => animationStart + (range * index) / steps
    );
    const offsets = itemPositions.map((position) => position - labelOffset);
    const indexes = itemPositions.map((_, index) => index);
    const easeArray = new Array(stops.length - 1).fill(easeInOutCubic);

    return {
      progressStops: stops,
      targetOffsets: offsets,
      indexStops: indexes,
      easeStops: easeArray
    };
  }, [itemPositions, labelOffset, animationStart, animationEnd]);

  const containerTarget = useTransform(
    scrollProgress,
    progressStops,
    targetOffsets,
    { ease: easeStops, clamp: true }
  );

  const containerShift = useSpring(containerTarget, {
    damping: 22,
    stiffness: 200,
    mass: 0.72
  });

  const activeIndexValue = useTransform(
    scrollProgress,
    progressStops,
    indexStops,
    { ease: easeStops, clamp: true }
  );

  useMotionValueEvent(activeIndexValue, "change", (latest) => {
    const nextIndex = Math.round(latest);
    if (!Number.isNaN(nextIndex) && nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  });

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
    <motion.div
      style={{ opacity: overlayOpacity }}
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#111113]/75 backdrop-blur-sm"
    >
      <div className="flex w-full max-w-lg flex-col gap-8 px-4 text-left">
        <div ref={listWrapperRef} className="relative w-full">
          <motion.span
            ref={labelRef}
            style={{ y: containerShift }}
            className="pointer-events-none absolute left-0 top-0 text-xs font-semibold uppercase tracking-[0.35em] text-primary md:text-sm"
          >
            {isMobile ? "Expert" : "Expert in"}
          </motion.span>
          <ul
            ref={listRef}
            style={{ paddingTop: labelOffset }}
            className="flex flex-col gap-6 md:gap-8"
          >
            {expertiseHighlights.map((highlight, index) => (
              <li
                key={highlight}
                data-expertise-item
                className="relative border-b border-white/10 pb-5 last:border-b-0 md:pb-6"
              >
                <span
                  className={`block text-lg font-semibold tracking-tight transition-colors duration-200 md:text-2xl ${
                    activeIndex === index ? "text-white" : "text-white/40"
                  }`}
                  style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontWeight: 700 }}
                >
                  {highlight}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-white/70 md:text-base">
          Guided roadmaps, measurable outcomes, and hands-on partnership across the initiatives that
          move your brand.
        </p>
      </div>
    </motion.div>
  );
};


