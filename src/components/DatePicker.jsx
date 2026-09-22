import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function parseDate(value) {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function formatInputDate(date, dateFormat) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (dateFormat === "MM/DD/YYYY") {
    return `${month}/${day}/${year}`;
  }

  if (dateFormat === "YYYY-MM-DD") {
    return `${year}-${month}-${day}`;
  }

  return `${day}/${month}/${year}`;
}

function formatDateForStorage(date) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function DatePicker({
  value,
  onChange,
  dateFormat = "DD/MM/YYYY",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const inputRef = useRef(null);

  const selectedDate = parseDate(value);

  useEffect(() => {
    setInputValue(value ? formatInputDate(selectedDate, dateFormat) : "");
  }, [value, dateFormat]);

  function handleCalendarSelect(date) {
    if (!date) return;

    const formatted = formatDateForStorage(date);

    onChange(formatted);
    setInputValue(formatInputDate(date, dateFormat));
    setOpen(false);
  }

  function handleInputChange(event) {
    setInputValue(event.target.value);
  }

  function handleInputBlur() {
    if (!inputValue.trim()) {
      onChange("");
      return;
    }

    const parsed = parseTypedDate(inputValue, dateFormat);

    if (parsed) {
      const formatted = formatDateForStorage(parsed);

      onChange(formatted);
      setInputValue(formatInputDate(parsed, dateFormat));
    } else {
      setInputValue(value ? formatInputDate(selectedDate, dateFormat) : "");
    }
  }

  function handleInputKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();

      handleInputBlur();
      setOpen(false);
    }

    if (event.key === "Escape") {
      event.preventDefault();

      setInputValue(value ? formatInputDate(selectedDate, dateFormat) : "");

      setOpen(false);
    }
  }

  function parseTypedDate(input, format) {
    const parts = input
      .trim()
      .split(/[\/-]/)
      .map((part) => Number(part));

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      return null;
    }

    let year;
    let month;
    let day;

    if (format === "DD/MM/YYYY") {
      [day, month, year] = parts;
    } else if (format === "MM/DD/YYYY") {
      [month, day, year] = parts;
    } else {
      [year, month, day] = parts;
    }

    if (
      !year ||
      !month ||
      !day ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        className={`flex w-full items-center overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-border/80 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10 ${className}`}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex shrink-0 items-center justify-center px-4 text-muted-foreground transition-colors hover:text-primary"
            aria-label="Open calendar"
          >
            <CalendarDays size={17} />
          </button>
        </PopoverTrigger>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={dateFormat}
          className="min-w-0 flex-1 bg-transparent py-3 pr-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
        />

        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex shrink-0 items-center justify-center px-4 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Open calendar"
          >
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                open ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>
        </PopoverTrigger>
      </div>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="z-[300] w-auto overflow-hidden rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"
      >
        <div className="max-h-[min(24rem,60vh)] overflow-y-auto [scrollbar-color:hsl(var(--muted-foreground)/0.35)_transparent] [scrollbar-width:thin]">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            initialFocus
            className="rounded-xl"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
