"use client";

import { useCallback } from "react";

import { ShimmerButton } from "@/components/ui/shimmer-button";

export function SiteHeaderCta() {
  const handleClick = useCallback(() => {
    const contactSection = document.getElementById("contact");

    contactSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="site-header__cta">
      <ShimmerButton
        onClick={handleClick}
        className="px-7 py-3 text-sm font-semibold uppercase tracking-[0.3em] shadow-[0_0_18px_rgba(255,255,255,0.15)] transition-shadow duration-300 hover:shadow-[0_0_45px_rgba(255,255,255,0.5)]"
      >
        <span className="text-white">lets connect</span>
      </ShimmerButton>
    </div>
  );
}


