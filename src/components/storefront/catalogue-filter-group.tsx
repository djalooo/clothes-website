import { cn } from "@/lib/utils";

export function FilterGroup({
  label,
  values,
  selected,
  allLabel,
  onClear,
  onToggle,
}: {
  label: string;
  values: string[];
  selected: string[];
  allLabel: string;
  onClear: () => void;
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="catalogue-filter-group flex flex-col gap-2">
      <legend className="text-xs font-semibold uppercase tracking-[0.03em] text-on-surface-muted">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onClear}
          aria-pressed={selected.length === 0}
          className={cn("chip", selected.length === 0 && "filled")}
        >
          {allLabel}
        </button>
        {values.map((value) => {
          const isOn = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              aria-pressed={isOn}
              className={cn("chip", isOn && "filled")}
            >
              {value}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
