import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  /** ISO YYYY-MM-DD value stored for the DB */
  value: string;
  /** Emits ISO YYYY-MM-DD (or "" when cleared) */
  onChange: (isoDate: string) => void;
  /** Minimum selectable date as ISO YYYY-MM-DD */
  min?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

function isoToDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const d = parse(iso, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

function dateToIso(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function DateField({
  value,
  onChange,
  min,
  disabled,
  required,
  placeholder = "DD/MM/YYYY",
  ariaLabel,
  className,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const selected = isoToDate(value);
  const minDate = isoToDate(min || "");
  const display = selected ? format(selected, "dd/MM/yyyy") : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel || placeholder}
          className={cn(
            "input-base flex items-center justify-between gap-2 text-left w-full",
            !display && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{display || placeholder}</span>
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            if (d) {
              onChange(dateToIso(d));
              setOpen(false);
            } else {
              onChange("");
            }
          }}
          disabled={(date) => {
            if (minDate) {
              const dd = new Date(date);
              dd.setHours(0, 0, 0, 0);
              const md = new Date(minDate);
              md.setHours(0, 0, 0, 0);
              if (dd < md) return true;
            }
            return false;
          }}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
      {/* Hidden input to preserve HTML required semantics */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          value={value}
          onChange={() => {}}
          required
        />
      )}
    </Popover>
  );
}
