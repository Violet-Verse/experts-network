import type { ApplicationFormData } from "../types";
import { Card } from "./fields";

export function StepPart2({
  data,
  update,
}: {
  data: ApplicationFormData;
  update: <K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) => void;
}) {
  return (
    <>
      <div className="form-section">
        <h2>Part 2: Experience</h2>
        <p className="section-sub">Tell us more about the work you've done and how you work.</p>
      </div>

      <div className="card-grid">
        <Card icon="🏢" title="Companies you've worked with" hint="List the organizations or clients you've worked with, comma-separated." span2>
          <textarea
            rows={2}
            value={data.companiesWorkedWith}
            onChange={(e) => update("companiesWorkedWith", e.target.value)}
            placeholder="Company A, Company B, Freelance clients…"
          />
        </Card>

        <Card icon="🤖" title="AI experience" hint="Describe your hands-on experience with AI tools, models, or evaluation." span2>
          <textarea
            rows={3}
            value={data.aiExperience}
            onChange={(e) => update("aiExperience", e.target.value)}
          />
        </Card>

        <Card icon="🛠️" title="Technical skills" hint="Tools, frameworks, or platforms you're proficient in, comma-separated.">
          <textarea
            rows={2}
            value={data.technicalSkills}
            onChange={(e) => update("technicalSkills", e.target.value)}
            placeholder="Python, SQL, Figma…"
          />
        </Card>

        <Card icon="🗣️" title="Languages" hint="Languages you can work in, comma-separated.">
          <textarea
            rows={2}
            value={data.languages}
            onChange={(e) => update("languages", e.target.value)}
            placeholder="English (native), Spanish (fluent)…"
          />
        </Card>

        <Card icon="🔬" title="Research methods" hint="Methods you're experienced with, comma-separated." span2>
          <textarea
            rows={2}
            value={data.researchMethods}
            onChange={(e) => update("researchMethods", e.target.value)}
            placeholder="Interviews, surveys, usability testing, A/B testing…"
          />
        </Card>
      </div>
    </>
  );
}
