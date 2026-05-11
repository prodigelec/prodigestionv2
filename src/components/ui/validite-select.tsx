"use client";

import { CustomSelect } from "@/components/ui/custom-select";

const DUREES = [
  { value: "15", label: "15 jours" },
  { value: "30", label: "30 jours" },
  { value: "45", label: "45 jours" },
  { value: "60", label: "60 jours" },
  { value: "90", label: "90 jours" },
];

export function computeDateValidite(jours: number): string {
  const d = new Date();
  d.setDate(d.getDate() + jours);
  return d.toISOString().split("T")[0];
}

interface ValiditeSelectProps {
  value: number;
  onChange: (jours: number, dateValidite: string) => void;
  error?: string;
  className?: string;
}

export function ValiditeSelect({ value, onChange, error, className }: ValiditeSelectProps) {
  const dateExpiration = new Date(computeDateValidite(value)).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Validité du devis *</label>
      <CustomSelect
        name="validiteDuree"
        value={String(value)}
        onChange={(val) => {
          const jours = parseInt(val);
          onChange(jours, computeDateValidite(jours));
        }}
        options={DUREES}
        className={error ? "border-destructive" : className}
      />
      <p className="text-xs text-muted-foreground">Expire le {dateExpiration}</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
