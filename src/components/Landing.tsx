import heroPhoto from "../assets/hero.jpg";
import splitPhoto from "../assets/split.jpg";
import missionPhoto from "../assets/mission.jpg";

export function Landing() {
  return (
    <>
      <section className="hero-photo full-bleed">
        <div className="photo-bg" style={{ backgroundImage: `url(${heroPhoto})` }} />
        <nav className="hero-nav">
          <span className="hero-wordmark">Verso Network</span>
          <a href="#apply" className="btn btn-outline">
            Apply Now
          </a>
        </nav>
        <div className="hero-photo-content">
          <span className="eyebrow">Invite Only</span>
          <h1>A Job Intelligence Service for the World's Most Dynamic Creators</h1>
          <p>
            We match creators with companies and projects built on ethical data capture. Get paid
            weekly. Work on the most cutting-edge projects out there.
          </p>
          <a href="#apply" className="btn btn-outline">
            Apply Now
          </a>
        </div>
      </section>

      <section className="split-section full-bleed">
        <div className="split-text">
          <span className="eyebrow">Creators · Research · AI Evaluation</span>
          <h2>Built for the Work You Actually Want</h2>
          <p>
            No cold DMs, no open calls. Every project on Verso Network is pre-vetted before it
            reaches you, pays on a weekly cadence, and puts you in the room with teams building
            the most interesting things in tech.
          </p>
          <a href="#apply" className="btn btn-primary">
            Apply Now
          </a>
        </div>
        <div className="split-photo photo-bg" style={{ backgroundImage: `url(${splitPhoto})` }} />
      </section>

      <section className="mission-photo full-bleed">
        <div className="photo-bg" style={{ backgroundImage: `url(${missionPhoto})` }} />
        <div className="mission-photo-overlay">
          <span className="eyebrow">Our Mission</span>
          <p>
            We believe in the power of intellectual capital — and we operate on ethical data and
            AI practices.
          </p>
        </div>
      </section>
    </>
  );
}
