"use client";

import { Hero } from "@/components/ui/animated-hero";
import { ShimmerButton } from "@/components/ui/shimmer-button";

function HeroDemo() {
  return (
    <div className="block">
      <Hero />
    </div>
  );
}

function ShimmerButtonDemo() {
  return (
    <div className="z-10 flex min-h-64 items-center justify-center">
      <ShimmerButton className="shadow-2xl">
        <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
          Shimmer Button
        </span>
      </ShimmerButton>
    </div>
  );
}

export default function ModifiedClassicLoader() {
  return (
    <div className="border-primary ml-3 h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 ease-linear"></div>
  );
}

export { HeroDemo, ShimmerButtonDemo };


