"use client";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none";

interface Props {
  notes: string;
  conditions: string;
  onNotesChange: (val: string) => void;
  onConditionsChange: (val: string) => void;
}

export function DevisNotesConditions({ notes, conditions, onNotesChange, onConditionsChange }: Props) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="text-lg font-medium text-primary">Notes et Conditions</h3>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Notes internes (non visibles sur le PDF)</label>
          <textarea value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={4} className={TEXTAREA_CLASS} placeholder="Ex: Projet urgent..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Conditions commerciales</label>
          <textarea value={conditions} onChange={(e) => onConditionsChange(e.target.value)} rows={4} className={TEXTAREA_CLASS} />
        </div>
      </div>
    </div>
  );
}
