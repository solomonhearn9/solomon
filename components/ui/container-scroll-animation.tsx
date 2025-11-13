"use client";

import React, { useRef } from "react";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";

type ScrollProgressContextValue = {
  scrollProgress: MotionValue<number>;
  containerRef: React.RefObject<HTMLDivElement>;
};

const ScrollProgressContext = React.createContext<ScrollProgressContextValue | null>(null);

export const useContainerScrollProgress = () => {
  const context = React.useContext(ScrollProgressContext);
  if (!context) {
    throw new Error("useContainerScrollProgress must be used within a ContainerScroll card.");
  }
  return context;
};

export const ContainerScroll = ({
  titleComponent,
  children
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const animationRange = [0, 0.35, 0.6, 0.85, 1];
  const rotate = useTransform(scrollYProgress, animationRange, [-24, 0, 0, 8, 14]);
  const scaleValues = isMobile ? [0.85, 0.97, 0.97, 0.94, 0.9] : [1.08, 1, 1, 0.97, 0.94];
  const scale = useTransform(scrollYProgress, animationRange, scaleValues);
  const translate = useTransform(scrollYProgress, animationRange, [100, 0, 0, -20, -70]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.22, 0.45], [0, 0.85, 1]);
  const contentTranslate = useTransform(scrollYProgress, [0, 0.35, 0.6, 1], [80, 0, 0, -40]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.32, 0.5], [1, 1, 0]);

  return (
    <div
      className="relative flex h-[45rem] items-center justify-center p-2 md:h-[60rem] md:p-16"
      ref={containerRef}
    >
      <div
        className="relative w-full py-10 md:py-40"
        style={{
          perspective: "1000px"
        }}
      >
        <Header translate={translate} opacity={headerOpacity} titleComponent={titleComponent} />
        <Card
          rotate={rotate}
          translate={translate}
          scale={scale}
          contentOpacity={contentOpacity}
          contentTranslate={contentTranslate}
          scrollProgress={scrollYProgress}
          containerRef={containerRef}
        >
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  opacity,
  titleComponent
}: {
  translate: MotionValue<number>;
  opacity: MotionValue<number>;
  titleComponent: React.ReactNode | null;
}) => {
  if (!titleComponent) {
    return null;
  }
  return (
    <motion.div
      style={{
        translateY: translate,
        opacity
      }}
      className="div mx-auto max-w-5xl text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  translate,
  contentOpacity,
  contentTranslate,
  scrollProgress,
  containerRef,
  children
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  contentOpacity: MotionValue<number>;
  contentTranslate: MotionValue<number>;
  scrollProgress: MotionValue<number>;
  containerRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}) => {
  return (
    <ScrollProgressContext.Provider value={{ scrollProgress, containerRef }}>
      <motion.div
        style={{
          rotateX: rotate,
          scale,
          translateY: translate,
          transformStyle: "preserve-3d",
          boxShadow:
            "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003"
        }}
        className="mx-auto -mt-12 w-full max-w-5xl rounded-[46px] border border-white/12 bg-[#070709] p-[1.5px] shadow-[0_40px_120px_rgba(0,0,0,0.6)] md:p-[1.5px]"
      >
        <motion.div
          style={{
            opacity: contentOpacity,
            translateY: contentTranslate
          }}
          className="services-card-surface h-full w-full overflow-hidden rounded-[40px] text-white"
        >
          {children}
        </motion.div>
      </motion.div>
    </ScrollProgressContext.Provider>
  );
};


