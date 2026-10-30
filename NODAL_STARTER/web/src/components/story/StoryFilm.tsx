"use client";

import { useEffect, useState } from "react";

/**
 * Concept film on the story page. Same rules as ConceptFilm (CH-08): click-to-play only,
 * preload="none", no autoplay, no loop. 1080p is chosen at mount for wide viewports because
 * Chromium ignores the `media` attribute on <source> inside <video>.
 */
export default function StoryFilm({ poster, describedBy, className }: { poster: string; describedBy: string; className?: string }) {
  const [hi, setHi] = useState(false);
  useEffect(() => { setHi(window.matchMedia("(min-width: 1280px)").matches); }, []);
  return (
    <video key={hi ? "hi" : "lo"} className={className} controls preload="none" playsInline poster={poster} aria-describedby={describedBy}>
      <source src={hi ? "/media/nodal-concept-1080.mp4" : "/media/nodal-concept-720.mp4"} type="video/mp4" />
    </video>
  );
}
