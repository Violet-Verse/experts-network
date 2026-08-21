import type { ApplicationFormData } from "../../types";
import {
  PROJECT_TYPES,
  INDUSTRY_OPTIONS,
  CONTRACT_LENGTHS,
  COMPENSATION_TYPES,
  HOURS_PER_WEEK_OPTIONS,
  COMPENSATION_BAND_OPTIONS,
} from "../../formConfig";
import { Card, ChipGroup, SelectField } from "../fields";

export function NetworkFitSection({
  data,
  update,
  errors,
}: {
  data: ApplicationFormData;
  update: <K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) => void;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
}) {
  return (
    <>
      <div className="form-section">
        <h2 style={{ fontSize: 20 }}>Network Fit</h2>
      </div>

      <div className="card-grid">
        <Card icon="💼" title="Preferred project types" span2>
          <ChipGroup
            options={PROJECT_TYPES}
            selected={data.preferredProjectTypes}
            onToggle={(val) => {
              const has = data.preferredProjectTypes.includes(val);
              update(
                "preferredProjectTypes",
                has
                  ? data.preferredProjectTypes.filter((v) => v !== val)
                  : [...data.preferredProjectTypes, val]
              );
            }}
          />
          {errors.preferredProjectTypes && <p className="error-text">{errors.preferredProjectTypes}</p>}
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

        <Card icon="⏰" title="Availability" hint="Hours per week and preferred contract length.">
          <SelectField
            value={data.hoursPerWeek}
            onChange={(v) => update("hoursPerWeek", v)}
            options={HOURS_PER_WEEK_OPTIONS}
            placeholder="Hours / week…"
          />
          <SelectField
            value={data.preferredContractLength}
            onChange={(v) => update("preferredContractLength", v)}
            options={CONTRACT_LENGTHS}
            placeholder="Preferred contract length…"
          />
        </Card>

        <Card icon="💰" title="Compensation expectations" hint="Hourly, project-based, or flexible.">
          <SelectField
            value={data.compensationType}
            onChange={(v) => update("compensationType", v)}
            options={COMPENSATION_TYPES}
            placeholder="Select type…"
          />
          <SelectField
            value={data.compensationDetails}
            onChange={(v) => update("compensationDetails", v)}
            options={COMPENSATION_BAND_OPTIONS}
            placeholder="Select a rate band…"
          />
        </Card>
      </div>
    </>
  );
}
