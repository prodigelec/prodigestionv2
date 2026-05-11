"use client";

import { AddressSearchAutocomplete } from "@/components/ui/address-search-autocomplete";

const INPUT_CLASS =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface Props {
  defaultValue: string;
  codePostal: string;
  ville: string;
  onSelect: (address: { adresse: string; codePostal: string; ville: string }) => void;
  onCodePostalChange: (val: string) => void;
  onVilleChange: (val: string) => void;
}

export function DevisAdresseChantier({
  defaultValue,
  codePostal,
  ville,
  onSelect,
  onCodePostalChange,
  onVilleChange,
}: Props) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Adresse du chantier (modifiable)
      </label>
      <AddressSearchAutocomplete
        defaultValue={defaultValue}
        placeholder="Rechercher l'adresse du chantier..."
        onSelect={onSelect}
      />
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Code postal</label>
          <input type="text" value={codePostal} onChange={(e) => onCodePostalChange(e.target.value)} placeholder="75000" className={INPUT_CLASS} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Ville</label>
          <input type="text" value={ville} onChange={(e) => onVilleChange(e.target.value)} placeholder="Paris" className={INPUT_CLASS} />
        </div>
      </div>
    </div>
  );
}
