interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
}

export function FormField({
  label,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent ${
          error ? "border-priority-urgent" : "border-border"
        }`}
      />
      {error && <span className="mt-1 block text-xs text-priority-urgent">{error}</span>}
    </label>
  );
}
