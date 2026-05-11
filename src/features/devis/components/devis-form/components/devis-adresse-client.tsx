"use client";

const INPUT_CLASS =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface Props {
  hasAddress: boolean;
  isChantierDifferent: boolean;
  onToggleChantier: () => void;
  adresse: string;
  codePostal: string;
  ville: string;
  onAdresseChange: (val: string) => void;
  onCodePostalChange: (val: string) => void;
  onVilleChange: (val: string) => void;
}

export function DevisAdresseClient({
  hasAddress,
  isChantierDifferent,
  onToggleChantier,
  adresse,
  codePostal,
  ville,
  onAdresseChange,
  onCodePostalChange,
  onVilleChange,
}: Props) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Adresse du client
        </p>
        <button
          type="button"
          disabled={!hasAddress}
          onClick={onToggleChantier}
          className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
            isChantierDifferent
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground hover:text-foreground"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {isChantierDifferent ? "Adresse chantier différente: oui" : "Adresse chantier différente: non"}
        </button>
      </div>

      {hasAddress ? (
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Voie</label>
            <input type="text" value={adresse} onChange={(e) => onAdresseChange(e.target.value)} placeholder="Ex: 12 rue de Paris" className={INPUT_CLASS} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Code postal</label>
            <input type="text" value={codePostal} onChange={(e) => onCodePostalChange(e.target.value)} placeholder="75000" className={INPUT_CLASS} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Ville</label>
            <input type="text" value={ville} onChange={(e) => onVilleChange(e.target.value)} placeholder="Paris" className={INPUT_CLASS} />
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm italic text-muted-foreground">
          Aucune adresse renseignée pour ce client.
        </p>
      )}
    </div>
  );
}
