import heroPhoto from "../assets/hero.jpg";
import splitPhoto from "../assets/split.jpg";
import missionPhoto from "../assets/mission.jpg";

export function Landing({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <>
      <section className="hero-photo full-bleed">
        <div className="photo-bg" style={{ backgroundImage: `url(${heroPhoto})` }} />
        <nav className="hero-nav">
          <span className="hero-wordmark">Verso Network</span>
          <div className="hero-nav-actions">
            <button type="button" className="hero-nav-login" onClick={onLoginClick}>
              Log In
            </button>
            <a href="#apply" className="btn btn-outline">
              Apply Now
            </a>
          </div>
        </nav>
        <div className="hero-photo-content">
          <span className="eyebrow">Invite Only</span>
          <h1>Your Expertise, Reimagined.</h1>
          <p>
            Join Verso — a curated network connecting exceptional professionals with AI research
            and training projects.
          </p>
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
          <h2>Created for People With Niche Expertise</h2>
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
          <p className="mission-disclosure">
            Your data is never used to train or evaluate AI models without your separate, explicit
            agreement for that specific project.
          </p>
        </div>
      </section>
    </>
  );
}
