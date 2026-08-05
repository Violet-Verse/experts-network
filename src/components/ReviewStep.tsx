import type { ApplicationFormData } from "../types";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="review-row">
      <div className="k">{label}</div>
      <div className="v">{value || "—"}</div>
    </div>
  );
}

export function ReviewStep({ data }: { data: ApplicationFormData }) {
  return (
    <>
      <div className="form-section">
        <h2>Review Your Application</h2>
        <p className="section-sub">Double-check everything below, then submit.</p>
      </div>

      <div className="review-block">
        <h3>PART 1 · EXPERTISE &amp; NETWORK FIT</h3>
        <Row label="Primary role" value={data.primaryRole} />
        <Row label="Areas of expertise" value={data.expertiseAreas.join(", ")} />
        <Row label="Bio" value={data.bio} />
        <Row label="Portfolio" value={data.portfolioLinks} />
        <Row label="Preferred project types" value={data.preferredProjectTypes.join(", ")} />
        <Row label="Primary industries" value={data.primaryIndustries.join(", ")} />
        <Row label="Availability" value={`${data.hoursPerWeek || "—"} hrs/wk, ${data.preferredContractLength || "—"}`} />
        <Row label="Compensation" value={`${data.compensationType || "—"} — ${data.compensationDetails || "—"}`} />
        <Row label="Future opportunities" value={data.futureOpportunities} />
      </div>

      <div className="review-block">
        <h3>PART 2 · EXPERIENCE</h3>
        <Row label="Companies" value={data.companiesWorkedWith} />
        <Row label="AI experience" value={data.aiExperience} />
        <Row label="Technical skills" value={data.technicalSkills} />
        <Row label="Languages" value={data.languages} />
        <Row label="Research methods" value={data.researchMethods} />
      </div>

      <div className="review-block">
        <h3>PART 3 · SPECIALIZATIONS</h3>
        <Row label="Selected" value={data.specializations.join(", ")} />
      </div>

      <div className="review-block">
        <h3>PART 4 · MATCHING</h3>
        <Row label="Exciting projects" value={data.excitingProjects} />
        <Row label="Deep industries" value={data.deepIndustries} />
        <Row label="Long-term collaborations" value={data.longTermInterest} />
        <Row label="Remote only" value={data.remoteOnly} />
        <Row label="Time zone" value={data.timeZone} />
        <Row label="Earliest availability" value={data.earliestAvailability} />
        <Row label="Name" value={data.fullName} />
        <Row label="Email" value={data.email} />
      </div>
    </>
  );
}
