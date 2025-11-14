"use client";

import * as React from "react";
import { motion, Variants } from "framer-motion";

import { cn } from "@/lib/utils";

interface AnimatedTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  duration?: number;
  delay?: number;
  startDelay?: number;
  replay?: boolean;
  className?: string;
  textClassName?: string;
  underlineClassName?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  underlineGradient?: string;
  underlineHeight?: string;
  underlineOffset?: string;
  onComplete?: () => void;
}

const AnimatedText = React.forwardRef<HTMLDivElement, AnimatedTextProps>(
  (
    {
      text,
      duration = 0.5,
      delay = 0.1,
      startDelay = 0,
      replay = true,
      className,
      textClassName,
      underlineClassName,
      as = "h1",
      underlineGradient = "from-blue-500 via-purple-500 to-pink-500",
      underlineHeight = "h-1",
      underlineOffset = "-bottom-2",
      onComplete,
      ...props
    },
    ref
  ) => {
    const letters = React.useMemo(() => Array.from(text), [text]);
    const words = React.useMemo(() => text.split(" "), [text]);
    const shouldSplitLines = textClassName?.includes("landing-hero__title--animated");
    
    // Calculate when to fire onComplete - fire when last letter starts animating
    // This ensures subtitle appears quickly after title animation
    const completionDelay = React.useMemo(() => {
      if (shouldSplitLines) {
        // For split lines: stagger between words, then stagger between letters
        const totalLetters = words.reduce((acc, word) => acc + word.length, 0);
        // Fire when last letter starts: startDelay + (words-1) * delay + (totalLetters-1) * duration
        // Add minimal buffer for visual completion (~0.1s)
        const staggerTime = startDelay + (words.length - 1) * delay + (totalLetters - 1) * duration;
        return staggerTime + 0.1;
      }
      // Fire when last letter starts + minimal buffer
      const staggerTime = startDelay + (letters.length - 1) * duration;
      return staggerTime + 0.1;
    }, [words, letters, delay, duration, startDelay, shouldSplitLines]);
    
    // Call onComplete early - when last letter starts animating (not when it fully settles)
    React.useEffect(() => {
      if (onComplete && replay) {
        const timer = setTimeout(() => {
          onComplete();
        }, completionDelay * 1000);
        
        return () => clearTimeout(timer);
      }
    }, [onComplete, replay, completionDelay]);

    const container: Variants = {
      hidden: {
        opacity: 0
      },
      visible: (i: number = 1) => ({
        opacity: 1,
        transition: {
          staggerChildren: duration,
          delayChildren: startDelay + (i * delay)
        }
      })
    };

    const child: Variants = {
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          damping: 12,
          stiffness: 200
        }
      },
      hidden: {
        opacity: 0,
        y: 20,
        transition: {
          type: "spring",
          damping: 12,
          stiffness: 200
        }
      }
    };

    const lineVariants: Variants = {
      hidden: {
        width: "0%",
        left: "50%"
      },
      visible: {
        width: "100%",
        left: "0%",
        transition: {
          delay: letters.length * delay,
          duration: 0.8,
          ease: "easeOut"
        }
      }
    };

    const MotionComponent = React.useMemo(() => {
      const motionElements = {
        h1: motion.h1,
        h2: motion.h2,
        h3: motion.h3,
        h4: motion.h4,
        h5: motion.h5,
        h6: motion.h6,
        p: motion.p,
        span: motion.span
      } as const;

      return motionElements[as] ?? motion.span;
    }, [as]);

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center gap-2", className)}
        {...props}
      >
        <div className="relative">
          <MotionComponent
            style={{ display: "flex", flexDirection: shouldSplitLines ? "column" : "row", overflow: "hidden" }}
            variants={container}
            initial="hidden"
            animate={replay ? "visible" : "hidden"}
            className={cn("text-4xl font-bold text-center", textClassName)}
          >
            {shouldSplitLines ? (
              words.map((word, wordIndex) => (
                <motion.div key={wordIndex} variants={container} style={{ display: "flex" }}>
                  {Array.from(word).map((letter, letterIndex) => (
                    <motion.span key={letterIndex} variants={child}>
                      {letter}
                    </motion.span>
                  ))}
                </motion.div>
              ))
            ) : (
              letters.map((letter, index) => (
                <motion.span key={index} variants={child}>
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))
            )}
          </MotionComponent>

          <motion.div
            variants={lineVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "absolute",
              underlineHeight,
              underlineOffset,
              "bg-gradient-to-r",
              underlineGradient,
              underlineClassName
            )}
          />
        </div>
      </div>
    );
  }
);

AnimatedText.displayName = "AnimatedText";

export { AnimatedText };






