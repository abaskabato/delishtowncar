"use client";

import { useEffect } from "react";

// On the home page the header logo starts hidden (see .hero-brand rules in
// globals.css) so the big hero badge isn't shown twice. Once the badge scrolls
// under the sticky header, this adds "hero-logo-passed" and the header logo fades in.
export default function HeroLogoWatcher({ targetId }: { targetId: string }) {
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const root = document.documentElement;
    const header = document.querySelector<HTMLElement>(".site-header");
    const observer = new IntersectionObserver(
      ([entry]) => root.classList.toggle("hero-logo-passed", !entry.isIntersecting),
      { rootMargin: `-${header?.offsetHeight ?? 0}px 0px 0px 0px` },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      root.classList.remove("hero-logo-passed");
    };
  }, [targetId]);
  return null;
}
