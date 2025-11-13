"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type AnimatedHeadlineProps = {
  prefix?: string;
  prefixMobile?: string;
  words?: string[];
  interval?: number;
};

const defaultWords = ["amazing", "new", "wonderful", "beautiful", "smart"];

function AnimatedHeadline({
  prefix = "This is something",
  prefixMobile,
  words = defaultWords,
  interval = 2200
}: AnimatedHeadlineProps) {
  const memoizedWords = useMemo(() => words, [words]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (memoizedWords.length <= 1) {
      return;
    }

    const timeout = setTimeout(() => {
      setActiveIndex((current) =>
        current === memoizedWords.length - 1 ? 0 : current + 1
      );
    }, interval);

    return () => clearTimeout(timeout);
  }, [activeIndex, interval, memoizedWords]);

  return (
    <span className="projects-dynamic-headline">
      <span className="projects-dynamic-prefix">
        <span className="projects-dynamic-prefix-desktop">{prefix}</span>
        {prefixMobile && (
          <>
            <span className="projects-dynamic-prefix-mobile">{prefixMobile}</span>
            <br className="projects-dynamic-break" />
          </>
        )}
      </span>
      {prefixMobile && (
        <span className="projects-dynamic-second-line">
          <span className="projects-dynamic-with-mobile">with </span>
          <span className="projects-dynamic-wrapper" aria-live="polite" aria-atomic="true">
            <AnimatePresence mode="wait">
              <motion.span
                key={memoizedWords[activeIndex]}
                className="projects-dynamic-word"
                initial={{ opacity: 0, y: "80%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "-80%" }}
                transition={{ type: "spring", stiffness: 140, damping: 18 }}
              >
                {memoizedWords[activeIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
      )}
      {!prefixMobile && (
        <span className="projects-dynamic-wrapper" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            <motion.span
              key={memoizedWords[activeIndex]}
              className="projects-dynamic-word"
              initial={{ opacity: 0, y: "80%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-80%" }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
            >
              {memoizedWords[activeIndex]}
            </motion.span>
          </AnimatePresence>
        </span>
      )}
    </span>
  );
}

export { AnimatedHeadline };


