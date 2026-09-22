"use client";

export function SearchField({
  id,
  value,
  onChange,
  className = "",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        Search guests by name
      </label>
      <input
        id={id}
        type="text"
        inputMode="search"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search guests by name"
        className="w-full border-b border-accent/25 bg-transparent pb-2.5 font-sans text-[15px] text-ink placeholder:text-rosewood/50 focus:border-accent focus:outline-none"
      />
    </div>
  );
}
