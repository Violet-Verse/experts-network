import type { ReactNode } from "react";

export function Card({
  icon,
  title,
  hint,
  children,
  span2,
}: {
  icon: string;
  title: string;
  hint?: string;
  children: ReactNode;
  span2?: boolean;
}) {
  return (
    <div className={`card${span2 ? " span-2" : ""}`}>
      <span className="card-icon">{icon}</span>
      <label className="card-title">{title}</label>
      {hint && <p className="card-hint">{hint}</p>}
      {children}
    </div>
  );
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function ChipGroup({
  options,
  selected,
  onToggle,
  max,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  max?: number;
}) {
  return (
    <div className="chip-group">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        const isDisabled = !isSelected && !!max && selected.length >= max;
        return (
          <button
            type="button"
            key={opt}
            className={`chip${isSelected ? " selected" : ""}${isDisabled ? " disabled" : ""}`}
            onClick={() => !isDisabled && onToggle(opt)}
            disabled={isDisabled}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

