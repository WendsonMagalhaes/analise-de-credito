import { Search } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar…",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-line rounded-xl pl-9 pr-3 py-2 text-sm bg-panel text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/30 focus:border-frost transition-colors"
      />
    </div>
  );
}
