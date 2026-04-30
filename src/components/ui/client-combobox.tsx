import { useState } from "react";
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, ComboboxButton } from "@headlessui/react";
import { Search, ChevronDown, Check } from "lucide-react";

interface ClientLight {
  id: string;
  type: string;
  nom: string;
  prenom: string | null;
  raisonSociale: string | null;
}

interface ClientComboboxProps {
  clients: ClientLight[];
  value: string;
  onChange: (value: string | null) => void;
  error?: boolean;
}

export function ClientCombobox({ clients, value, onChange, error }: ClientComboboxProps) {
  const [query, setQuery] = useState("");

  const formatClientName = (client: ClientLight) => {
    if (client.type === "PARTICULIER") {
      return `${client.prenom || ""} ${client.nom}`.trim();
    }
    return client.raisonSociale || client.nom;
  };

  const filteredClients =
    query === ""
      ? clients
      : clients.filter((client) => {
          const name = formatClientName(client).toLowerCase();
          return name.includes(query.toLowerCase());
        });

  const selectedClient = clients.find((c) => c.id === value);
  const selectedLabel = selectedClient ? formatClientName(selectedClient) : "";

  return (
    <Combobox value={value} onChange={onChange}>
      <div className="relative">
        <div className={`relative w-full cursor-default overflow-hidden rounded-md border bg-background text-left transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${error ? 'border-destructive' : 'border-border hover:border-primary/50'}`}>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <ComboboxInput
            className="w-full border-none bg-background py-2 pl-10 pr-10 text-sm leading-5 text-foreground focus:ring-0"
            displayValue={() => selectedLabel}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un client..."
            autoComplete="off"
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" aria-hidden="true" />
          </ComboboxButton>
        </div>
        
        <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background py-1 text-base shadow-lg focus:outline-none sm:text-sm">
          {filteredClients.length === 0 && query !== "" ? (
            <div className="relative cursor-default select-none px-4 py-2 text-muted-foreground">
              Aucun client trouvé.
            </div>
          ) : (
            filteredClients.map((client) => (
              <ComboboxOption
                key={client.id}
                className={({ focus }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 transition-colors ${
                    focus ? "bg-primary/10 text-primary" : "text-foreground"
                  }`
                }
                value={client.id}
              >
                {({ selected, focus }) => (
                  <>
                    <span className={`block truncate ${selected ? "font-medium text-primary" : "font-normal"}`}>
                      {formatClientName(client)} <span className="text-xs text-muted-foreground ml-1">({client.type.replace(/_/g, " ")})</span>
                    </span>
                    {selected ? (
                      <span
                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                          focus ? "text-primary" : "text-primary"
                        }`}
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
