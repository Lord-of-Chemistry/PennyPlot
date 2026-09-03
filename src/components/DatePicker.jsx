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

  /* =========================
     SYNC DISPLAY VALUE
  ========================= */

  useEffect(() => {
    setInputValue(value ? formatInputDate(selectedDate, dateFormat) : "");
  }, [value, dateFormat]);

  /* =========================
     HANDLE CALENDAR
  ========================= */

  function handleCalendarSelect(date) {
    if (!date) return;

    const formatted = formatDateForStorage(date);

    onChange(formatted);

    setInputValue(formatInputDate(date, dateFormat));

    setOpen(false);
  }

  /* =========================
     HANDLE MANUAL INPUT
  ========================= */

  function handleInputChange(event) {
    const value = event.target.value;

    setInputValue(value);
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

  /* =========================
     PARSE TYPED DATE
  ========================= */

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
        className={`flex w-full items-center overflow-hidden rounded-xl border border-white/10 bg-[#1b2922] transition-all duration-200 hover:border-white/20 focus-within:border-[#049552] focus-within:ring-1 focus-within:ring-[#049552]/30 ${className}`}
      >
        {/* Calendar icon */}

        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex shrink-0 items-center justify-center px-4 text-gray-500 transition-colors hover:text-[#049552]"
            aria-label="Open calendar"
          >
            <CalendarDays size={17} />
          </button>
        </PopoverTrigger>

        {/* Date input */}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={dateFormat}
          className="min-w-0 flex-1 bg-transparent py-3 pr-2 text-sm text-white outline-none placeholder:text-gray-500"
        />

        {/* Dropdown arrow */}

        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex shrink-0 items-center justify-center px-4 text-gray-500 transition-colors hover:text-white"
            aria-label="Open calendar"
          >
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                open ? "rotate-180 text-[#049552]" : ""
              }`}
            />
          </button>
        </PopoverTrigger>
      </div>

      {/* Calendar */}

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-auto border-white/10 bg-[#1b2922] p-0 text-white shadow-2xl shadow-black/40"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleCalendarSelect}
          initialFocus
          className="rounded-xl"
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
