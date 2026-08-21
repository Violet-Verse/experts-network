import type { ApplicationFormData } from "../../types";
import { PRIMARY_ROLES, EXPERTISE_AREA_OPTIONS } from "../../formConfig";
import { Card, ChipGroup, SelectField } from "../fields";
import { wordCount } from "../../lib/validateApplication";

export function ExpertiseSection({
  data,
  update,
  errors,
}: {
  data: ApplicationFormData;
  update: <K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) => void;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
}) {
  const bioWords = wordCount(data.bio);
  const bioOutOfRange = data.bio.length > 0 && (bioWords < 100 || bioWords > 150);

  return (
    <>
      <div className="form-section">
        <h2>Tell Us About Your Expertise</h2>
        <p className="section-sub">
          Help us understand your background so we can match you with future paid research, AI
          evaluation, and content opportunities.
        </p>
      </div>

      <div className="card-grid">
        <Card icon="👤" title="One primary role" hint="Writer, researcher, evaluator, engineer, product marketer, designer, strategist, etc.">
          <SelectField
            value={data.primaryRole}
            onChange={(v) => update("primaryRole", v)}
            options={PRIMARY_ROLES}
            placeholder="Select a role…"
          />
          {errors.primaryRole && <p className="error-text">{errors.primaryRole}</p>}
        </Card>

        <Card icon="⭐" title="Three areas of expertise" hint="Choose the topics you're most confident contributing to.">
          <ChipGroup
            options={EXPERTISE_AREA_OPTIONS}
            selected={data.expertiseAreas}
            max={3}
            onToggle={(val) => {
              const has = data.expertiseAreas.includes(val);
              update(
                "expertiseAreas",
                has ? data.expertiseAreas.filter((v) => v !== val) : [...data.expertiseAreas, val]
              );
            }}
          />
          <span className="word-count">{data.expertiseAreas.length} / 3 selected</span>
          {errors.expertiseAreas && <p className="error-text">{errors.expertiseAreas}</p>}
        </Card>

        <Card icon="📝" title="One short bio" hint="Tell us about your experience in 100–150 words." span2>
          <textarea
            value={data.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={5}
            placeholder="I'm a…"
          />
          <span className={`word-count${bioOutOfRange ? " warn" : ""}`}>{bioWords} words (100–150)</span>
          {errors.bio && <p className="error-text">{errors.bio}</p>}
        </Card>

        <Card icon="🔗" title="Portfolio" hint="Share your best work, LinkedIn, GitHub, website, or writing samples." span2>
          <textarea
            value={data.portfolioLinks}
            onChange={(e) => update("portfolioLinks", e.target.value)}
            rows={2}
            placeholder="https://linkedin.com/in/..., https://github.com/..., https://..."
          />
          {errors.portfolioLinks && <p className="error-text">{errors.portfolioLinks}</p>}
        </Card>
      </div>
    </>
  );
}
