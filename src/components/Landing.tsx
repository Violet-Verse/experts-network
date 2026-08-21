export function Landing() {
  return (
    <>
      <div className="wordmark-banner">
        <span className="wordmark">Violet Verse Experts</span>
      </div>

      <div className="landing-hero">
        <span className="eyebrow">Invite Only</span>
        <h1>Join the Experts Network</h1>
        <p>
          A private network of writers, researchers, evaluators, and strategists working at the
          intersection of media, marketing, and emerging technology — matched with paid research,
          AI evaluation, and content opportunities as they come up.
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
            Writers worldwide — media, marketing, and crypto experts built over a decade of
            editorial and brand partnerships.
          </p>
        </div>
      </div>
    </>
  );
}
