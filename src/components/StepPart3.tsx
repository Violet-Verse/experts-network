import type { ApplicationFormData } from "../types";
import { SPECIALIZATIONS } from "../formConfig";
import { CheckboxGrid } from "./fields";

export function StepPart3({
  data,
  update,
}: {
  data: ApplicationFormData;
  update: <K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) => void;
}) {
  return (
    <>
      <div className="form-section">
        <h2>Part 3: Specializations</h2>
        <p className="section-sub">Check all that apply.</p>
      </div>

      <CheckboxGrid
        options={SPECIALIZATIONS}
        selected={data.specializations}
        onToggle={(val) => {
          const has = data.specializations.includes(val);
          update(
            "specializations",
            has ? data.specializations.filter((v) => v !== val) : [...data.specializations, val]
          );
        }}
      />
    </>
  );
}
