/** NODAL logo supplied by the human designer (public/brand/nodal-white.svg, unmodified). */
export default function Wordmark() {
  return (
    <h1 className="wordmark">
      <a href="/" className="home" aria-label="NODAL, back to the story">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/nodal-white.svg" alt="NODAL" width={1997} height={314} className="logo" />
      </a>
      <small>Marine Observatory</small>
    </h1>
  );
}
