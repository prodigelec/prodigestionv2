import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  options: { value: string; label: string }[];
}

export function CustomSelect({ value, onChange, name, options }: CustomSelectProps) {
  // Trouver le label correspondant à la valeur actuelle
  const currentLabel = options.find((opt) => opt.value === value)?.label || value;

  return (
    <Listbox value={value} onChange={onChange} name={name}>
      <div className="relative">
        <ListboxButton className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none hover:border-primary/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50">
          <span className="block truncate">{currentLabel}</span>
          <span className="pointer-events-none flex items-center pr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </span>
        </ListboxButton>
        <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background py-1 text-base shadow-lg focus:outline-none sm:text-sm">
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className="relative cursor-default select-none py-2 pl-3 pr-9 text-foreground data-[focus]:bg-primary/10 data-[focus]:text-primary data-[selected]:font-medium transition-colors"
            >
              {({ selected }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-medium text-primary' : 'font-normal'}`}>
                    {option.label}
                  </span>
                  {selected ? (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                  ) : null}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
