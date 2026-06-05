import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export default function SearchableSelect({
  value,
  options,
  onChange,
  onOpen,
  placeholder = 'Select option',
  searchPlaceholder = 'Search options',
  className = '',
  empty = 'No options found.',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const selected = options.find((option) => String(option.value) === String(value));
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  const showOptions = () => {
    setOpen(true);
    onOpen?.();
  };

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  return (
    <div className={`relative ${className}`} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button type="button" className="input flex items-center justify-between gap-2 text-left" onClick={showOptions}>
        <span className={selected ? 'truncate' : 'truncate text-slate-400'}>{selected?.label || placeholder}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="relative border-b border-slate-100 p-2">
            <Search className="pointer-events-none absolute left-5 top-4 h-4 w-4 text-slate-400" />
            <input
              ref={inputRef}
              className="input py-1.5 pl-9"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.map((option) => {
              const active = String(option.value) === String(value);
              return (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50 ${active ? 'font-semibold text-primary' : 'text-slate-700'}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              );
            })}
            {!filteredOptions.length ? <p className="px-3 py-3 text-sm text-slate-500">{empty}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
