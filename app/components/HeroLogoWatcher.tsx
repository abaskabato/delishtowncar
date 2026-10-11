"use client";

import { useEffect } from "react";

// On the home page the header starts see-through with no small badge (see the
// #hero-brand rules in globals.css), so the big hero badge isn't shown twice. As
// soon as the big badge starts sliding under the header, this adds
// "hero-logo-passed": the header turns solid and its small badge fades in, so the
// two never overlap.
export default function HeroLogoWatcher({ targetId }: { targetId: string }) {
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const root = document.documentElement;
    const header = document.querySelector<HTMLElement>(".site-header");
    const observer = new IntersectionObserver(
      ([entry]) => root.classList.toggle("hero-logo-passed", entry.intersectionRatio < 1),
      { rootMargin: `-${header?.offsetHeight ?? 0}px 0px 0px 0px`, threshold: [0, 1] },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      root.classList.remove("hero-logo-passed");
    };
  }, [targetId]);
  return null;
}
