"use client";

import { Trash2 } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { LigneDevisForm } from "@/features/devis/types";

const TYPE_OPTIONS = [
  { value: "SERVICE", label: "Prestation de service" },
  { value: "MARCHANDISE", label: "Vente de marchandise" },
];

const TVA_OPTIONS = [20, 10, 5.5, 2.1, 0];

const INPUT_CLASS =
  "w-full h-10 rounded-md border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface Props {
  ligne: LigneDevisForm;
  index: number;
  errors: Record<string, string>;
  canRemove: boolean;
  onDescriptionClick: (index: number) => void;
  onLigneChange: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
}

export function DevisLigneRow({ ligne, index, errors, canRemove, onDescriptionClick, onLigneChange, onRemove }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-muted/10 p-4 md:p-0 md:bg-transparent rounded-lg border border-border md:border-none">
      <div className="md:col-span-4 space-y-1">
        <label className="md:hidden text-xs font-medium text-muted-foreground">Description</label>
        <button
          type="button"
          onClick={() => onDescriptionClick(index)}
          className={`w-full rounded-md border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors[`lignes.${index}.description`] ? "border-destructive" : "border-border"}`}
        >
          {ligne.description
            ? <span className="block max-h-12 overflow-hidden whitespace-pre-line">{ligne.description}</span>
            : <span className="text-muted-foreground">Cliquer pour saisir la description...</span>}
        </button>
        {errors[`lignes.${index}.description`] && <p className="text-xs text-destructive">{errors[`lignes.${index}.description`]}</p>}
      </div>

      <div className="md:col-span-2 space-y-1">
        <label className="md:hidden text-xs font-medium text-muted-foreground">Type *</label>
        <CustomSelect name={`lignes.${index}.typeOperation`} value={ligne.typeOperation} onChange={(val) => onLigneChange(index, "typeOperation", val)} options={TYPE_OPTIONS} className={errors[`lignes.${index}.typeOperation`] ? "border-destructive" : ""} />
        {errors[`lignes.${index}.typeOperation`] && <p className="text-xs text-destructive">{errors[`lignes.${index}.typeOperation`]}</p>}
      </div>

      <div className="md:col-span-2 space-y-1">
        <label className="md:hidden text-xs font-medium text-muted-foreground">Quantité</label>
        <input type="number" min="0.01" step="0.01" value={ligne.quantite} onChange={(e) => onLigneChange(index, "quantite", parseFloat(e.target.value) || 0)} className={`${INPUT_CLASS} ${errors[`lignes.${index}.quantite`] ? "border-destructive" : "border-border"}`} />
      </div>

      <div className="md:col-span-2 space-y-1">
        <label className="md:hidden text-xs font-medium text-muted-foreground">Prix Unit. HT (€)</label>
        <input type="number" min="0" step="0.01" value={ligne.prixUnitaireHT} onChange={(e) => onLigneChange(index, "prixUnitaireHT", parseFloat(e.target.value) || 0)} className={`${INPUT_CLASS} ${errors[`lignes.${index}.prixUnitaireHT`] ? "border-destructive" : "border-border"}`} />
      </div>

      <div className="md:col-span-1 space-y-1">
        <label className="md:hidden text-xs font-medium text-muted-foreground">TVA (%)</label>
        <select value={ligne.tauxTVA} onChange={(e) => onLigneChange(index, "tauxTVA", parseFloat(e.target.value))} className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {TVA_OPTIONS.map((tva) => <option key={tva} value={tva}>{tva}%</option>)}
        </select>
      </div>

      <div className="md:col-span-1 flex justify-end md:pt-2">
        <button type="button" onClick={() => onRemove(index)} disabled={!canRemove} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent" title="Supprimer la ligne">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
