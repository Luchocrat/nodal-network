import type { Tag } from "@/lib/scenario";

const GLYPH: Record<Tag, string> = { OBSERVED: "●", SIMULATED: "◐", CONCEPTUAL: "◇", UNKNOWN: "?" };
const TITLE: Record<Tag, string> = {
  OBSERVED: "Measured by an external source (NOAA); not from a NODAL sensor",
  SIMULATED: "Scenario value set by the user; not a measurement",
  CONCEPTUAL: "Architecture concept; unvalidated and not engineering-approved",
  UNKNOWN: "Evidence not available",
};

export default function Badge({ tag }: { tag: Tag }) {
  return (
    <span className={`badge badge-${tag}`} title={TITLE[tag]}>
      <span className="g" aria-hidden="true">{GLYPH[tag]}</span>
      {tag}
    </span>
  );
}
