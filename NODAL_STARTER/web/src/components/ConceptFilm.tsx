"use client";

import { useEffect, useState } from "react";
import Badge from "./Badge";

/**
 * Concept film (CH-08). Click-to-play only: preload="none", no autoplay, no loop.
 * The 1080p source is chosen at mount for viewports >= 1280px, otherwise the 720p source
 * (the `media` attribute on <source> is not honoured for <video> in Chromium, so this is done here).
 */
export default function ConceptFilm() {
  const [hi, setHi] = useState(false);
  useEffect(() => { setHi(window.matchMedia("(min-width: 1280px)").matches); }, []);
  return (
    <section className="panel stratum s-film" aria-labelledby="film-h">
      <h2 id="film-h">Proposed architecture <Badge tag="CONCEPTUAL" /></h2>
      <p className="film-meta">Concept film · 47 s · AI-generated (Seedance clips, edited in Remotion) · sound: generated ambience</p>
      <video
        key={hi ? "hi" : "lo"}
        className="film"
        controls
        preload="none"
        playsInline
        poster="/media/nodal-concept-poster.jpg"
        aria-describedby="film-desc"
      >
        <source src={hi ? "/media/nodal-concept-1080.mp4" : "/media/nodal-concept-720.mp4"} type="video/mp4" />
      </video>
      <p id="film-desc" className="film-boundary">
        A speculative vision of the NODAL families — RIDGE, CANYON, CONNECTOR and the ATOL surface hub — not engineered hardware.
        Coral and marine life growing on the structures are illustration, not a predicted or measured outcome.
        The film places the network on a reef; reef habitat is exactly the evidence NODAL treats as unknown until surveyed.
        The orbital view of Florida and the Atlantic shows imagined scale only: no sites have been selected or surveyed.{" "}
        <strong>Nothing in this film changes the assessment: site ecological suitability is undetermined.</strong>
      </p>
      <details>
        <summary>What the film shows (text description)</summary>
        <ol className="film-chapters">
          <li><span className="mono">0:00–0:09</span> A RIDGE unit activates in a studio; illustrative coral grows over its shell.</li>
          <li><span className="mono">0:09–0:18</span> The camera passes the RIDGE compute core, then the ATOL surface hub floats at sea under its solar canopy.</li>
          <li><span className="mono">0:17–0:27</span> Descent below ATOL along the umbilical into the connected underwater units.</li>
          <li><span className="mono">0:26–0:36</span> Rise from the reef to an orbital view of Florida and the Atlantic with an imagined network of light.</li>
          <li><span className="mono">0:35–0:47</span> The network converges; NODAL wordmark and the author&apos;s mark; silence.</li>
        </ol>
      </details>
    </section>
  );
}
