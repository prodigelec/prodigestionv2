"use client";

import { Plus } from "lucide-react";
import { LigneDevisForm } from "@/features/devis/types";
import { DevisLigneRow } from "./devis-ligne-row";

const EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

interface Props {
  lignes: LigneDevisForm[];
  errors: Record<string, string>;
  onAddLigne: () => void;
  onRemoveLigne: (index: number) => void;
  onLigneChange: (index: number, field: string, value: string | number) => void;
  onOpenDescriptionModal: (index: number) => void;
  totals: { totalHT: number; totalTVA: number; totalTTC: number };
}

export function DevisLignes({ lignes, errors, onAddLigne, onRemoveLigne, onLigneChange, onOpenDescriptionModal, totals }: Props) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-primary">Lignes du devis</h3>
          <p className="text-sm text-muted-foreground">Ajoutez les produits ou services</p>
        </div>
        <button type="button" onClick={onAddLigne} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-primary-light/25 hover:text-primary">
          <Plus className="w-4 h-4" />
          Ajouter une ligne
        </button>
      </div>

      <div className="space-y-4">
        <div className="hidden md:grid grid-cols-12 gap-4 pb-2 text-sm font-medium text-muted-foreground border-b border-border">
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Type *</div>
          <div className="col-span-2">Quantité</div>
          <div className="col-span-2">Prix Unit. HT</div>
          <div className="col-span-1">TVA (%)</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {lignes.map((ligne, index) => (
          <DevisLigneRow
            key={index}
            ligne={ligne}
            index={index}
            errors={errors}
            canRemove={lignes.length > 1}
            onDescriptionClick={onOpenDescriptionModal}
            onLigneChange={onLigneChange}
            onRemove={onRemoveLigne}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col items-end space-y-2 rounded-lg border border-border bg-muted/20 p-4">
        <div className="flex items-center w-full md:w-64 justify-between text-sm text-muted-foreground">
          <span>Total HT</span>
          <span className="font-medium text-foreground">{EUR.format(totals.totalHT)}</span>
        </div>
        <div className="flex items-center w-full md:w-64 justify-between text-sm text-muted-foreground">
          <span>Total TVA</span>
          <span className="font-medium text-foreground">{EUR.format(totals.totalTVA)}</span>
        </div>
        <div className="flex items-center w-full md:w-64 justify-between text-lg font-bold text-primary pt-2 border-t border-border/50">
          <span>Total TTC</span>
          <span>{EUR.format(totals.totalTTC)}</span>
        </div>
      </div>
    </div>
  );
}
