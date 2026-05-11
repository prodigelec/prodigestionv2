"use client";

import { DescriptionQuickForm } from "@/features/devis/types";

const INPUT_CLASS =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface Props {
  isOpen: boolean;
  isAiGenerating: boolean;
  descriptionDraft: string;
  quickForm: DescriptionQuickForm;
  onDescriptionDraftChange: (val: string) => void;
  onQuickFormChange: (field: keyof DescriptionQuickForm, val: string) => void;
  onApplyManual: () => void;
  onGenerateWithAI: () => void;
  onImproveWithAI: () => void;
  onSave: () => void;
  onClose: () => void;
}

export function DevisDescriptionModal({
  isOpen, isAiGenerating, descriptionDraft, quickForm,
  onDescriptionDraftChange, onQuickFormChange,
  onApplyManual, onGenerateWithAI, onImproveWithAI,
  onSave, onClose,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-xl">
        <h4 className="text-lg font-semibold text-foreground">Description de la ligne</h4>
        <p className="mt-1 text-sm text-muted-foreground">Utilisez le formulaire rapide pour gagner du temps, puis ajustez si besoin.</p>

        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Travaux a effectuer sur / ou</label>
              <input type="text" value={quickForm.cibleIntervention} onChange={(e) => onQuickFormChange("cibleIntervention", e.target.value)} placeholder="Ex: le volet roulant de la chambre" className={INPUT_CLASS} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Intitule</label>
              <input type="text" value={quickForm.intitule} onChange={(e) => onQuickFormChange("intitule", e.target.value)} placeholder="Ex: Fourniture et pose" className={INPUT_CLASS} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Materiaux</label>
              <input type="text" value={quickForm.materiaux} onChange={(e) => onQuickFormChange("materiaux", e.target.value)} placeholder="Ex: PVC blanc, quincaillerie" className={INPUT_CLASS} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Details</label>
              <input type="text" value={quickForm.precision} onChange={(e) => onQuickFormChange("precision", e.target.value)} placeholder="Ex: depose, evacuation, pose et reglages" className={INPUT_CLASS} />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={onApplyManual} className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-primary-light/25 hover:text-primary">
              Générer (manuel)
            </button>
            <button type="button" disabled={isAiGenerating} onClick={onGenerateWithAI} className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-light transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none">
              {isAiGenerating
                ? <><div className="w-3.5 h-3.5 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />Génération...</>
                : "✨ Générer avec l'IA"}
            </button>
          </div>
        </div>

        <div className="mt-4 relative">
          <textarea value={descriptionDraft} onChange={(e) => onDescriptionDraftChange(e.target.value)} rows={6} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none" placeholder="Ex: Fourniture et pose de..." />
          {descriptionDraft.trim().length > 10 && (
            <button type="button" disabled={isAiGenerating} onClick={onImproveWithAI} className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:pointer-events-none">
              {isAiGenerating ? "..." : "✨ Améliorer"}
            </button>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-primary-light/25 hover:text-primary">Annuler</button>
          <button type="button" onClick={onSave} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-light transition-colors hover:bg-primary/90">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
