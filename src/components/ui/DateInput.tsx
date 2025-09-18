"use client";
import { useEffect, useMemo, useState } from "react";

interface DateInputProps {
  value?: string; // ISO: YYYY-MM-DD or full ISO
  onChange: (isoDate: string) => void;
  min?: string; // ISO constraint
  max?: string; // ISO constraint
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  name?: string;
  id?: string;
}

function isoToYMD(iso?: string): string | undefined {
  if (!iso) return undefined;
  try {
    // Accept both YYYY-MM-DD and full ISO
    const d = iso.length > 10 ? new Date(iso) : new Date(`${iso}T00:00:00`);
    if (isNaN(d.getTime())) return undefined;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return undefined;
  }
}

function isoToDisplay(iso?: string): string {
  const ymd = isoToYMD(iso);
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

function displayToISO(display: string): string | undefined {
  // Expect dd/MM/yyyy
  const m = display.match(/^\s*(\d{2})\/(\d{2})\/(\d{4})\s*$/);
  if (!m) return undefined;
  const d = Number(m[1]);
  const mo = Number(m[2]);
  const y = Number(m[3]);
  const jsDate = new Date(Date.UTC(y, mo - 1, d));
  if (jsDate.getUTCFullYear() !== y || jsDate.getUTCMonth() !== mo - 1 || jsDate.getUTCDate() !== d) {
    return undefined; // invalid day (e.g., 31/02)
  }
  const mm = String(mo).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

export default function DateInput({
  value,
  onChange,
  min,
  max,
  placeholder = "dd/mm/yyyy",
  required,
  disabled,
  className,
  inputClassName,
  name,
  id,
}: DateInputProps) {
  const [text, setText] = useState<string>(isoToDisplay(value));
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setText(isoToDisplay(value));
  }, [value]);

  const minYMD = useMemo(() => isoToYMD(min), [min]);
  const maxYMD = useMemo(() => isoToYMD(max), [max]);

  const validateAndEmit = (nextText: string) => {
    const iso = displayToISO(nextText);
    if (!iso) {
      setError(nextText.trim() ? "Ngày không hợp lệ (định dạng dd/mm/yyyy)" : "");
      return false;
    }
    if (minYMD && iso < minYMD) {
      setError("Không thể chọn trước Effective From");
      return false;
    }
    if (maxYMD && iso > maxYMD) {
      setError("Không thể chọn sau Effective To");
      return false;
    }
    setError("");
    onChange(iso);
    return true;
  };

  return (
    <div className={className}>
      <input
        type="text"
        name={name}
        id={id}
        value={text}
        disabled={disabled}
        required={required}
        inputMode="numeric"
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          // accept partial dd/MM/yyyy
          if (/^\d{0,2}(\/\d{0,2}(\/\d{0,4})?)?$/.test(v)) {
            setText(v);
            if (touched) validateAndEmit(v);
          }
        }}
        onBlur={() => {
          setTouched(true);
          // auto format if user typed like d/m/yyyy
          const parts = text.split("/");
          if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
            const dd = parts[0].padStart(2, "0");
            const mm = parts[1].padStart(2, "0");
            const yyyy = parts[2];
            const formatted = `${dd}/${mm}/${yyyy}`;
            setText(formatted);
            validateAndEmit(formatted);
          } else {
            validateAndEmit(text);
          }
        }}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
          error ? "border-red-300 bg-red-50" : "border-gray-200"
        } ${inputClassName || ""}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Removed duplicate component definition
