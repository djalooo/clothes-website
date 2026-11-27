import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectDropdownOption<Value extends string> = {
  value: Value;
  label: string;
};

type SelectDropdownProps<Value extends string> = {
  id?: string;
  ariaLabel: string;
  value: Value;
  options: readonly SelectDropdownOption<Value>[];
  onValueChange: (value: Value) => void;
  className?: string;
};

type SelectDropdownStateProps<Value extends string> = Pick<
  SelectDropdownProps<Value>,
  "id" | "value" | "options" | "onValueChange"
>;

function useSelectDropdown<Value extends string>({
  id,
  value,
  options,
  onValueChange,
}: SelectDropdownStateProps<Value>) {
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const generatedId = useId();
  const controlId = id ?? `select-${generatedId}`;
  const optionsId = `${controlId}-options`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  const chooseValue = (nextValue: Value) => {
    onValueChange(nextValue);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(selectedIndex);
      setOpen(true);
    }
  };

  const handleOptionKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;

    if (event.key === "ArrowDown") nextIndex = (index + 1) % options.length;
    if (event.key === "ArrowUp") nextIndex = (index - 1 + options.length) % options.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = options.length - 1;

    if (nextIndex !== undefined) {
      event.preventDefault();
      setActiveIndex(nextIndex);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const toggleOpen = () => {
    if (open) {
      setOpen(false);
    } else {
      setActiveIndex(selectedIndex);
      setOpen(true);
    }
  };

  return {
    activeIndex,
    controlId,
    handleOptionKeyDown,
    handleTriggerKeyDown,
    open,
    optionRefs,
    optionsId,
    rootRef,
    setOpen,
    toggleOpen,
    triggerRef,
    chooseValue,
  };
}

export function SelectDropdown<Value extends string>({
  id,
  ariaLabel,
  value,
  options,
  onValueChange,
  className,
}: SelectDropdownProps<Value>) {
  const {
    activeIndex,
    controlId,
    handleOptionKeyDown,
    handleTriggerKeyDown,
    open,
    optionRefs,
    optionsId,
    rootRef,
    setOpen,
    toggleOpen,
    triggerRef,
    chooseValue,
  } = useSelectDropdown({ id, value, options, onValueChange });

  return (
    <div
      ref={rootRef}
      className={cn("select-dropdown", className)}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        id={controlId}
        type="button"
        className="select-dropdown-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={optionsId}
        title={ariaLabel}
        onClick={toggleOpen}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{options.find((option) => option.value === value)?.label}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      <div
        id={optionsId}
        className="select-dropdown-options"
        role="listbox"
        aria-label={ariaLabel}
        hidden={!open}
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            ref={(element) => {
              optionRefs.current[index] = element;
            }}
            type="button"
            className="select-dropdown-option"
            role="option"
            aria-selected={value === option.value}
            tabIndex={activeIndex === index ? 0 : -1}
            onClick={() => chooseValue(option.value)}
            onKeyDown={(event) => handleOptionKeyDown(event, index)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
