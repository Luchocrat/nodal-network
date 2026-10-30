import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/Badge";
import type { Tag } from "@/lib/scenario";
import StoryFilm from "./StoryFilm";
import s from "./story.module.css";

import hero from "@/assets/story/hero.jpg";
import ridgeDayOne from "@/assets/story/ridge-day-one.jpg";
import ridgeYearsOn from "@/assets/story/ridge-years-on.jpg";
import coreCoral from "@/assets/story/core-coral.jpg";
import seafloor from "@/assets/story/seafloor.jpg";
import atolSunset from "@/assets/story/atol-sunset.jpg";
import umbilical from "@/assets/story/umbilical.jpg";
import orbit from "@/assets/story/orbit.jpg";
import cartridge from "@/assets/story/cartridge-exploded.jpg";
import protocolShot from "@/assets/story/protocol.jpg";
import flashCanyon from "@/assets/story/flash-canyon.png";
import flashConnector from "@/assets/story/flash-connector.png";
import flashRidge from "@/assets/story/flash-ridge.png";

const SOURCES = {
  floridaCurrent: "https://www.aoml.noaa.gov/phod/floridacurrent/data_access.php",
  bleaching: "https://coralreefwatch.noaa.gov/product/5km/tutorial/crw10a_dhw_product.php",
  repo: "https://github.com/Luchocrat/nodal-network",
};

/** Signature Move, Tether rule: the claim, a hairline and its evidence boundary on one baseline. */
function Tether({ tag, children }: { tag: Tag; children: React.ReactNode }) {
  return (
    <p className={s.tether}>
      <span>{children}</span>
      <span className={s.tetherLine} aria-hidden="true" />
      <Badge tag={tag} />
    </p>
  );
}

const FAMILIES = [
  { id: "canyon", img: flashCanyon, name: "CANYON", line: "Climbs, the way a piece runs up a spine." },
  { id: "connector", img: flashConnector, name: "CONNECTOR", line: "The filler work in a sleeve. The flowing background that turns separate pieces into one design." },
  { id: "ridge", img: flashRidge, name: "RIDGE", line: "Lies low across a slope, the way a piece wraps a shoulder." },
];

const READS = ["Topography", "What the seabed is made of", "Where living coral already grows", "Current direction and speed", "Tides, calm months and storm months", "Temperature from the surface down"];
const DECIDES = ["Where each pod sits", "Which way each shell faces", "How open the lattice is", "How far apart the units stand", "The angle of every connector arm"];

const LEDGER: { what: string; answer: string }[] = [
  { what: "Temperature at depth", answer: "A sensor ATOL is designed to carry" },
  { what: "Local currents", answer: "A sensor ATOL is designed to carry" },
  { what: "Health of the reef", answer: "Monitoring ATOL is designed to carry" },
  { what: "Seabed survey", answer: "Surveyed once, before anything is built" },
  { what: "Permitting", answer: "Stays human" },
];

export default function Story() {
  return (
    <div className={s.story}>
      <a className="skip" href="#heat">Skip to the story</a>

      <header className={s.nav}>
        <Link href="/" className={s.navLogo} aria-label="NODAL home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/nodal-white.svg" alt="NODAL" width={1997} height={314} />
        </Link>
        <Link href="/protocol" className={`${s.btn} ${s.ghost}`}>Open the protocol</Link>
      </header>

      <main>
        {/* ---------- hero ---------- */}
        <section className={s.hero} aria-labelledby="hero-h">
          <Image
            src={hero}
            alt="Concept film still: the ATOL surface hub floats above a network of bone-white NODAL pods on a sunlit reef."
            fill
            sizes="100vw"
            placeholder="blur"
            loading="eager"
            fetchPriority="high"
            className={s.heroImg}
          />
          <div className={`${s.wrap} ${s.heroInner}`}>
            <h1 id="hero-h" className={s.heroTitle} style={{ "--i": 0 } as React.CSSProperties}>A reef written by the water.</h1>
            <p className={s.heroSub} style={{ "--i": 1 } as React.CSSProperties}>
              Data center pods drawn like bio-organic tattoos, shaped by the seafloor and designed to let the current carry their heat.
            </p>
            <div className={s.ctas} style={{ "--i": 2 } as React.CSSProperties}>
              <a href="#heat" className={s.btn}>Read the story</a>
              <Link href="/protocol" className={`${s.btn} ${s.ghost}`}>Open the protocol</Link>
            </div>
            <div className={s.heroTether} style={{ "--i": 3 } as React.CSSProperties}>
              <Tether tag="CONCEPTUAL">Concept film still, AI-generated</Tether>
            </div>
          </div>
        </section>

        {/* ---------- the heat ---------- */}
        <section id="heat" className={s.chapter} aria-labelledby="heat-h">
          <div className={s.wrap}>
            <h2 id="heat-h" className={`${s.display} ${s.reveal}`}>Miami in August feels like breathing through a warm towel.</h2>
            <div className={s.heatGrid}>
              <div className={`${s.prose} ${s.reveal}`}>
                <p>
                  Now picture a data center there. Thousands of machines, each one a small furnace, sitting in air that’s already hot and wet.
                  Cooling them on land is like keeping ice cream frozen in a parked car with the windows up. You can do it, but you pay for it all day,
                  in electricity and often in fresh water evaporated into the sky.
                </p>
                <p>
                  Now look east. A few miles off the coast, the ocean is moving. Under the warm surface, the water gets cooler the deeper you go,
                  and it never stops.
                </p>
                <p className={s.lead}>
                  NODAL starts with a slightly reckless question. What if the computer moved to where the cool, moving water already is, and gave
                  something back to the place it moved into?
                </p>
              </div>
              <aside className={`${s.current} ${s.reveal}`} aria-label="The Florida Current">
                <p className={s.currentFig}>32<span> million m³</span></p>
                <p className={s.currentText}>of water move through the Straits of Florida every second, carried by the Florida Current.</p>
                <Tether tag="OBSERVED">
                  Long-term mean, NOAA cable record since 1982. <a href={SOURCES.floridaCurrent}>Source</a>
                </Tether>
              </aside>
            </div>
          </div>
        </section>

        {/* ---------- the sigil ---------- */}
        <section id="sigil" className={s.chapter} aria-labelledby="sigil-h">
          <div className={s.wrap}>
            <h2 id="sigil-h" className={`${s.display} ${s.reveal}`}>Two tattoo traditions live inside NODAL.</h2>
            <div className={s.sigilSplit}>
              <figure className={`${s.figure} ${s.reveal}`}>
                <Image src={ridgeDayOne} alt="A NODAL RIDGE pod in a white studio: a thorned, bone-white lattice shell wrapped around a titanium compute core." sizes="(min-width: 960px) 58vw, 100vw" placeholder="blur" className={s.img} />
                <figcaption><Tether tag="CONCEPTUAL">NODAL / RIDGE, concept film still</Tether></figcaption>
              </figure>
              <div className={`${s.traditions} ${s.reveal}`}>
                <div>
                  <h3 className={s.h3}>Cybersigilism gives it its line.</h3>
                  <p>Thin, thorned strokes branch and hook like a nervous system drawn in ink.</p>
                </div>
                <div>
                  <h3 className={s.h3}>Bio-organic tattooing gives it its body.</h3>
                  <p>Bone, tissue, shells and roots, drawn with so much depth they look like they’re under the skin.</p>
                </div>
              </div>
            </div>

            <blockquote className={`${s.pull} ${s.reveal}`}>
              <p>Lay a design flat across a shoulder and it looks like a sticker on a fridge. Let it wrap the shoulder blade, and it looks like it grew there.</p>
            </blockquote>
            <div className={`${s.prose} ${s.narrow} ${s.indent} ${s.reveal}`}>
              <p>
                The best bio-organic pieces look like the needle didn’t add anything. It just uncovered what was already in the body.
                NODAL’s pods are drawn the same way, because the seafloor has an anatomy too. Ridges are its bones and the current is its pulse.
                A pod dropped flat on the bottom is that fridge sticker. A pod that settles along a ridge and turns its shoulder to the current looks like the seafloor grew it.
              </p>
            </div>

            <figure className={s.flash} aria-labelledby="flash-cap">
              <ul className={s.flashGrid}>
                {FAMILIES.map((f) => (
                  <li key={f.id} className={`${s.flashItem} ${s[`flash_${f.id}`]} ${s.reveal}`}>
                    <Image src={f.img} alt={`Side and top silhouettes of NODAL / ${f.name}`} sizes="(min-width: 960px) 30vw, 80vw" className={s.flashImg} />
                    <p className={s.famName}>NODAL / {f.name}</p>
                    <p className={s.famLine}>{f.line}</p>
                  </li>
                ))}
              </ul>
              <figcaption id="flash-cap"><Tether tag="CONCEPTUAL">Side and top silhouettes from the NODAL Blender maquette</Tether></figcaption>
            </figure>

            <div className={`${s.flourish} ${s.reveal}`}>
              <h3 className={s.h3big}>A heat sink drawn by a tattoo artist.</h3>
              <div className={s.prose}>
                <p>
                  The dark compute core inside each bone shell comes from the biomechanical side of the same family: the machine under the skin.
                  And every flourish has a job. Branching gives the most surface for the least material, the same trick lungs and radiator fins use,
                  so there are more places for heat to leave. The curves steer the current like a hand cupped in a river. The gaps between the thorns
                  are shelter. A fish doesn’t care about aesthetics. It cares about a gap a barracuda can’t fit through.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- the reading ---------- */}
        <section id="reading" className={s.chapter} aria-labelledby="reading-h">
          <div className={s.wrap}>
            <h2 id="reading-h" className={`${s.display} ${s.reveal}`}>Before anything is drawn, the site gets read.</h2>
            <div className={`${s.prose} ${s.narrow} ${s.reveal}`}>
              <p>
                A bio-organic artist studies the body before the needle touches skin: where the muscle swells, and how the skin stretches when the arm moves.
                NODAL does the same thing with an algorithm, then grows the reef from what it learns.
              </p>
            </div>
          </div>
          <figure className={`${s.bleed} ${s.reveal}`}>
            <div className={s.bleedFrame}>
              <Image src={seafloor} alt="Aerial view of NODAL pods settled into the ridges and hollows of a reef seafloor, linked by cables." sizes="100vw" placeholder="blur" className={s.bleedImg} />
            </div>
            <figcaption className={s.wrap}><Tether tag="CONCEPTUAL">Pods settled into the seafloor, concept film still</Tether></figcaption>
          </figure>
          <div className={s.wrap}>
            <div className={`${s.reading} ${s.reveal}`}>
              <div className={s.readCol}>
                <h3 className={s.h3}>It reads</h3>
                <ul>{READS.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              <div className={s.readArrow} aria-hidden="true">→</div>
              <div className={s.readCol}>
                <h3 className={s.h3}>It decides</h3>
                <ul>{DECIDES.map((d) => <li key={d}>{d}</li>)}</ul>
              </div>
            </div>
            <div className={s.readStatus}>
              <Tether tag="CONCEPTUAL">The reading algorithm is the next thing to build. It doesn’t exist yet.</Tether>
            </div>
            <div className={`${s.prose} ${s.narrow} ${s.reveal}`}>
              <p>
                Think about the wind between the towers on Brickell. The buildings squeeze the air, and it comes through the gaps hard enough to flip your umbrella.
                NODAL wants to do that on purpose, underwater. Each shell is shaped so the current speeds up exactly where the compute core needs it and carries its heat away.
                No tattoo artist puts the same piece on a forearm and a back, so no two NODAL reefs are the same either.
              </p>
            </div>
            <p className={`${s.closer} ${s.reveal}`}>The designer sets the language. The water writes the sentence.</p>
          </div>
        </section>

        {/* ---------- the fever line ---------- */}
        <section id="fever" className={`${s.chapter} ${s.fever}`} aria-labelledby="fever-h">
          <div className={`${s.wrap} ${s.center}`}>
            <h2 id="fever-h" className={`${s.manifesto} ${s.reveal}`}>One more degree is the emergency.</h2>
            <div className={`${s.prose} ${s.centerProse} ${s.reveal}`}>
              <p>
                Tropical coral already lives close to its limit. Push the water a degree above its normal summer peak, hold it there,
                and the heat stress builds until a reef can bleach (<a href={SOURCES.bleaching}>NOAA Coral Reef Watch</a>).
              </p>
              <p>
                A data center is a heat machine. So in the tropics, the most dangerous thing NODAL could put in the water is the very thing it exists to get rid of.
              </p>
            </div>
            <div className={`${s.rule} ${s.reveal}`}>
              <p className={s.ruleJobs}>Cool the core. Protect the reef from the core.</p>
              <p>
                The shape has to break up the warm water and mix it into the current fast enough that it’s gone before it reaches anything alive.
                If a site’s water can’t carry the heat away, the site fails. No amount of beautiful geometry rescues it.
              </p>
            </div>
          </div>
          <figure className={`${s.cinema} ${s.reveal}`}>
            <div className={s.cinemaFrame}>
              <Image src={coreCoral} alt="Close-up of a titanium compute core inside a bone shell covered in illustrative coral." sizes="(min-width: 1320px) 1320px, 100vw" placeholder="blur" className={s.bleedImg} />
            </div>
            <figcaption><Tether tag="CONCEPTUAL">The core inside an inhabited shell. Coral is illustration, not a predicted outcome</Tether></figcaption>
          </figure>
        </section>

        {/* ---------- the protocol ---------- */}
        <section id="protocol" className={s.chapter} aria-labelledby="protocol-h">
          <div className={`${s.wrap} ${s.protocolSplit}`}>
            <div className={`${s.protocolText} ${s.reveal}`}>
              <h2 id="protocol-h" className={s.display2}>That’s why NODAL comes with an observatory.</h2>
              <p>
                The NODAL Protocol is a working prototype built at Hack for Humanity Miami 2026. It pairs live NOAA observations with an explicit energy
                simulation, a fixed-rule assessment and a plain-language AI explanation. It can say &ldquo;do not deploy yet,&rdquo; and it’s built to mean it.
              </p>
              <dl className={s.labels}>
                <div><dt><Badge tag="OBSERVED" /></dt><dd>Measured by NOAA at a shore station, with its source and time.</dd></div>
                <div><dt><Badge tag="SIMULATED" /></dt><dd>A scenario you set, and the math built on it.</dd></div>
                <div><dt><Badge tag="CONCEPTUAL" /></dt><dd>Architecture that hasn’t been surveyed or engineered.</dd></div>
                <div><dt><Badge tag="UNKNOWN" /></dt><dd>Evidence nobody has yet. Site suitability stays undetermined.</dd></div>
              </dl>
              <div className={s.ctas}>
                <Link href="/protocol" className={s.btn}>Open the protocol</Link>
              </div>
            </div>
            <figure className={`${s.figure} ${s.shot} ${s.reveal}`}>
              <Link href="/protocol" className={s.shotLink} aria-label="Open the protocol">
                <Image src={protocolShot} alt="Screenshot of the NODAL Protocol dashboard: NOAA readings, the network section view, a simulated power balance and site suitability marked undetermined." sizes="(min-width: 960px) 58vw, 100vw" placeholder="blur" className={s.img} />
              </Link>
              <figcaption className={s.shotCap}>Screenshot taken October 30, 2026. The readings in it were live when captured; the protocol shows current ones.</figcaption>
            </figure>
          </div>
        </section>

        {/* ---------- ATOL ---------- */}
        <section id="atol" className={s.chapter} aria-labelledby="atol-h">
          <figure className={`${s.bleed} ${s.reveal}`}>
            <div className={s.bleedFrameTall}>
              <Image src={atolSunset} alt="The ATOL surface hub at sunset: a pale floating canopy with solar panels and a central mast." sizes="100vw" placeholder="blur" className={s.bleedImg} />
            </div>
            <figcaption className={s.wrap}><Tether tag="CONCEPTUAL">NODAL / ATOL, concept film still</Tether></figcaption>
          </figure>
          <div className={s.wrap}>
            <h2 id="atol-h" className={`${s.display} ${s.reveal}`}>ATOL harvests sunlight and signal.</h2>
            <p className={`${s.lead} ${s.narrow} ${s.reveal}`}>
              On the surface, ATOL is the network’s lungs and ears. A low, wide float with a pale canopy that looks like it came out of the same tattoo sketchbook as the reef below.
            </p>
            <div className={`${s.atolPair} ${s.reveal}`}>
              <div>
                <h3 className={s.h3big}>Sunlight</h3>
                <p>The canopy carries solar panels. ATOL stores and manages the power, and the umbilical sends it down to the pods.</p>
              </div>
              <div>
                <h3 className={s.h3big}>Signal</h3>
                <p>ATOL is where the network talks to the shore, and more importantly, where it listens to the ocean. It’s designed to turn UNKNOWN into OBSERVED, one reading at a time.</p>
              </div>
            </div>
            <table className={`${s.ledger} ${s.reveal}`}>
              <caption className="sr-only">What the protocol marks unknown today, and how each gap would be answered</caption>
              <thead>
                <tr><th scope="col">Evidence</th><th scope="col">Today</th><th scope="col">How it gets answered</th></tr>
              </thead>
              <tbody>
                {LEDGER.map((row) => (
                  <tr key={row.what}><th scope="row">{row.what}</th><td><Badge tag="UNKNOWN" /></td><td>{row.answer}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <figure className={s.vote}>
            <Image src={umbilical} alt="Underwater view of cables descending from the surface to pods on the seafloor." fill sizes="100vw" placeholder="blur" className={s.voteImg} />
            <div className={`${s.wrap} ${s.voteInner}`}>
              <p className={s.voteText}>
                If warm water creeps toward living coral in a hot September, the telemetry sees it and the compute load comes down.
              </p>
              <p className={s.voteLine}>The ocean gets a vote.</p>
            </div>
            <figcaption className={`${s.wrap} ${s.voteCap}`}><Tether tag="CONCEPTUAL">The umbilical, concept film still</Tether></figcaption>
          </figure>
        </section>

        {/* ---------- two clocks ---------- */}
        <section id="clocks" className={s.chapter} aria-labelledby="clocks-h">
          <div className={s.wrap}>
            <h2 id="clocks-h" className={`${s.clocks} ${s.reveal}`}>
              <span>A chip is old at five.</span>
              <span>A reef is young at twenty-five.</span>
            </h2>
            <div className={s.diptych}>
              <figure className={`${s.figure} ${s.reveal}`}>
                <Image src={ridgeDayOne} alt="A clean RIDGE pod on day one." sizes="(min-width: 960px) 50vw, 100vw" placeholder="blur" className={s.img} />
                <figcaption className={s.dipCap}><strong>Day one.</strong> Clean shell, fresh core.</figcaption>
              </figure>
              <figure className={`${s.figure} ${s.reveal}`}>
                <Image src={ridgeYearsOn} alt="The same RIDGE pod years later, its shell covered in illustrative coral." sizes="(min-width: 960px) 50vw, 100vw" placeholder="blur" className={s.img} />
                <figcaption className={s.dipCap}><strong>Years on.</strong> The shell is home to something. The core has been swapped.</figcaption>
              </figure>
            </div>
            <Tether tag="CONCEPTUAL">Concept film stills. Coral is illustration, not a predicted outcome</Tether>

            <div className={`${s.prose} ${s.narrow} ${s.reveal}`}>
              <p>
                So the shell and the core live separate lives. The bone shell is permanent; once life moves in, nobody evicts it.
                The compute core is a cartridge that slides out. Upgrading NODAL works like a hermit crab in reverse: the house stays put and the tenant gets swapped.
              </p>
            </div>
            <figure className={`${s.strip} ${s.reveal}`}>
              <Image src={cartridge} alt="Exploded view of a NODAL pod: bone shell sections, thermal fins, the sealed compute cartridge and the anchor base." sizes="(min-width: 900px) 852px, 100vw" placeholder="blur" className={s.img} />
              <figcaption><Tether tag="CONCEPTUAL">Exploded cartridge anatomy, reference board</Tether></figcaption>
            </figure>
            <div className={`${s.atolPair} ${s.reveal}`}>
              <div>
                <h3 className={s.h3big}>Service corridors</h3>
                <p>The CONNECTOR arms carry cables through protected passages. A diver or an underwater robot follows the connector instead of crawling across living reef. ATOL is the service dock, where cartridges come up, get refreshed and go back down.</p>
              </div>
              <div>
                <h3 className={s.h3big}>Clean surfaces</h3>
                <p>Life wants to grow on everything. On the shell that’s welcome, but a coat of barnacles on a heat exchanger works like a wool sweater on a radiator. So the clean surfaces stay apart from the inhabited ones, and they come up with the cartridge.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- earthbound ---------- */}
        <section id="earthbound" className={`${s.chapter} ${s.earth}`} aria-labelledby="earth-h">
          <div className={s.wrap}>
            <h2 id="earth-h" className={`${s.display} ${s.reveal}`}>A sigil the size of a coastline.</h2>
            <div className={`${s.prose} ${s.narrow} ${s.reveal}`}>
              <p>
                Pull the camera up, past ATOL and past the clouds, until Florida is a shape and the Atlantic is a dark sheet. Now picture it repeating wherever
                the land is too hot to compute cheaply and the sea keeps moving, from the Caribbean to the islands of the Pacific. Each one read first and written
                by its own water, with an observatory beside it that can say no.
              </p>
            </div>
            <figure className={`${s.film} ${s.reveal}`}>
              <StoryFilm poster={orbit.src} describedBy="film-desc" className={s.video} />
              <figcaption>
                <Tether tag="CONCEPTUAL">Concept film, 47 s. AI-generated Seedance clips edited in Remotion; generated ambience</Tether>
                <p id="film-desc" className={s.filmBoundary}>
                  A speculative vision of RIDGE, CANYON, CONNECTOR and the ATOL surface hub, not engineered hardware. Coral growing on the structures is illustration.
                  The film places the network on a reef, and reef habitat is exactly the evidence NODAL treats as unknown until surveyed. The orbital view shows imagined
                  scale only: no sites have been selected or surveyed. <strong>Nothing in this film changes the assessment: site suitability is undetermined.</strong>
                </p>
                <details className={s.filmDetails}>
                  <summary>What the film shows (text description)</summary>
                  <ol>
                    <li><span className="mono">0:00-0:09</span> A RIDGE unit activates in a studio; illustrative coral grows over its shell.</li>
                    <li><span className="mono">0:09-0:18</span> The camera passes the RIDGE compute core, then ATOL floats at sea under its solar canopy.</li>
                    <li><span className="mono">0:17-0:27</span> Descent below ATOL along the umbilical into the connected underwater units.</li>
                    <li><span className="mono">0:26-0:36</span> Rise from the reef to an orbital view of Florida and the Atlantic with an imagined network of light.</li>
                    <li><span className="mono">0:35-0:47</span> The network converges; the NODAL wordmark and the author’s mark; silence.</li>
                  </ol>
                </details>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ---------- close ---------- */}
        <section id="next" className={`${s.chapter} ${s.close}`} aria-labelledby="close-h">
          <div className={`${s.wrap} ${s.center}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/nodal-white.svg" alt="" width={1997} height={314} className={s.closeLogo} />
            <h2 id="close-h" className={`${s.manifesto} ${s.reveal}`}>
              Computing shouldn’t simply move into the ocean. It should be accountable to the ocean.
            </h2>
            <p className={`${s.lead} ${s.centerProse} ${s.reveal}`}>
              What comes next: a marine partner and a year of current and temperature data from one stretch of seafloor. That’s the first reading, and the first sigil.
            </p>
            <div className={`${s.ctas} ${s.ctasCenter}`}>
              <Link href="/protocol" className={s.btn}>Open the protocol</Link>
              <a href={SOURCES.repo} className={`${s.btn} ${s.ghost}`}>Source on GitHub</a>
            </div>
          </div>
        </section>
      </main>

      <footer className={s.footer}>
        <div className={s.wrap}>
          <p>Built at Hack for Humanity Miami, October 10, 2026, with AI coding agents under Lucho Escobar’s direction. NODAL logo by Lucho Escobar Studio.</p>
          <p>
            All imagery is concept art, not engineering drawings: film stills from AI-generated Seedance clips edited in Remotion, reference boards made with generative tools,
            and silhouettes from the NODAL Blender maquette.
          </p>
          <p>Data: NOAA CO-OPS, NOAA AOML and NOAA Coral Reef Watch. Type: Aspekta, Nyght Serif by Maksym Kobuzan (Tunera Type Foundry), IBM Plex Mono.</p>
        </div>
      </footer>
    </div>
  );
}
