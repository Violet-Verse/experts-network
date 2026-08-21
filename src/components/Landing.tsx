export function Landing() {
  return (
    <>
      <div className="wordmark-banner">
        <span className="wordmark">Verso Network</span>
      </div>

      <div className="landing-hero">
        <span className="eyebrow">Invite Only</span>
        <h1>A Job Intelligence Service for the World's Most Dynamic Creators</h1>
        <p>
          We match creators with companies and projects built on ethical data capture. Get paid
          weekly. Work on the most cutting-edge projects out there.
        </p>
      </div>

      <div className="landing-grid">
        <div className="card bio-card">
          <span className="eyebrow">The Network</span>
          <h3 className="bio-name">Melissa Henderson</h3>
          <p className="bio-title">Founder, Violet Verse</p>
          <p className="bio-line">
            14 years building at the intersection of media, marketing, and emerging technology.
          </p>

          <div className="stat-row">
            <span className="stat-label">Published</span>
            <span className="stat-value">Elle, Essence, HuffPost, Women in Clothes (Penguin)</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Spoke At</span>
            <span className="stat-value">ETHDenver '22 '23 '24, ISSUU Creator Summit</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Worked With</span>
            <span className="stat-value">Nike, Netflix, Samsung, Cash App, Block, Scale AI, La Prairie, Delta</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Recognized</span>
            <span className="stat-value">Fashion Group International Award, Miami Tourism Board Award</span>
          </div>
        </div>

        <div className="card accent">
          <span className="eyebrow">The Network</span>
          <div className="accent-number">300+</div>
          <p className="accent-desc">
            Creators worldwide — media, marketing, and crypto experts built over a decade of
            editorial and brand partnerships.
          </p>
        </div>
      </div>

      <div className="mission-block">
        <span className="eyebrow">Our Mission</span>
        <p>
          We believe in the power of intellectual capital — and we operate on ethical data and AI
          practices.
        </p>
      </div>
    </>
  );
}
