import type { Step2Data } from "../types";
import type { Step2Errors } from "../lib/validateApplication";
import {
  PRIMARY_ROLES,
  EXPERTISE_AREA_OPTIONS,
  INDUSTRY_OPTIONS,
  HOURS_PER_WEEK_OPTIONS,
  COMPENSATION_BAND_OPTIONS,
} from "../formConfig";
import { Card, ChipGroup, SelectField } from "./fields";

export function Step2Form({
  data,
  update,
  errors,
}: {
  data: Step2Data;
  update: <K extends keyof Step2Data>(key: K, value: Step2Data[K]) => void;
  errors: Step2Errors;
}) {
  return (
    <>
      <div className="form-section">
        <h2>A Few More Questions</h2>
        <p className="section-sub">Help us understand your background so we can match you with the right opportunities.</p>
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

        <Card icon="⏰" title="Availability" hint="Hours per week you're able to commit.">
          <SelectField
            value={data.hoursPerWeek}
            onChange={(v) => update("hoursPerWeek", v)}
            options={HOURS_PER_WEEK_OPTIONS}
            placeholder="Hours / week…"
          />
          {errors.hoursPerWeek && <p className="error-text">{errors.hoursPerWeek}</p>}
        </Card>

        <Card icon="💰" title="Compensation expectations" hint="Choose the band that fits best.">
          <SelectField
            value={data.compensationDetails}
            onChange={(v) => update("compensationDetails", v)}
            options={COMPENSATION_BAND_OPTIONS}
            placeholder="Select a rate band…"
          />
          {errors.compensationDetails && <p className="error-text">{errors.compensationDetails}</p>}
        </Card>

        <Card icon="🌍" title="Primary industries" hint="Fintech, AI, Crypto, Fashion, Beauty, Travel, Media, Healthcare, etc." span2>
          <ChipGroup
            options={INDUSTRY_OPTIONS}
            selected={data.primaryIndustries}
            onToggle={(val) => {
              const has = data.primaryIndustries.includes(val);
              update(
                "primaryIndustries",
                has ? data.primaryIndustries.filter((v) => v !== val) : [...data.primaryIndustries, val]
              );
            }}
          />
          {errors.primaryIndustries && <p className="error-text">{errors.primaryIndustries}</p>}
        </Card>
      </div>
    </>
  );
}
