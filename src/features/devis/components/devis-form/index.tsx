"use client";

import { Save, X } from "lucide-react";
import { useDevisForm } from "@/features/devis/hooks/use-devis-form";
import { DevisInfoGenerales } from "./components/devis-info-generales";
import { DevisAdresseClient } from "./components/devis-adresse-client";
import { DevisAdresseChantier } from "./components/devis-adresse-chantier";
import { DevisLignes } from "./components/devis-lignes";
import { DevisNotesConditions } from "./components/devis-notes-conditions";
import { DevisDescriptionModal } from "./components/devis-description-modal";
import { ClientLight } from "@/features/devis/types";

export function DevisForm({ clients }: { clients: ClientLight[] }) {
  const form = useDevisForm(clients);

  return (
    <form onSubmit={form.handleSubmit} className="space-y-10">

      {/* Informations Générales */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="text-lg font-medium text-primary">Informations Générales</h3>
        <p className="mt-1 text-sm text-muted-foreground">Sélectionnez le client, la date de validité et l'adresse de chantier.</p>

        <DevisInfoGenerales
          typeFilter={form.typeFilter}
          onTypeFilterChange={form.handleTypeFilterChange}
          clientId={form.formData.clientId}
          clientOptions={form.clientOptions}
          onClientChange={form.handleClientChange}
          validiteDuree={form.validiteDuree}
          onValiditeChange={form.handleValiditeChange}
          errors={form.errors}
        />

        {form.selectedClient && (
          <div className="mt-4 space-y-4">
            <DevisAdresseClient
              hasAddress={form.hasSelectedClientAddress}
              isChantierDifferent={form.isChantierAddressDifferent}
              onToggleChantier={form.handleToggleChantier}
              adresse={form.clientAddress}
              codePostal={form.clientCodePostal}
              ville={form.clientVille}
              onAdresseChange={form.setClientAddress}
              onCodePostalChange={form.setClientCodePostal}
              onVilleChange={form.setClientVille}
            />
            {form.isChantierAddressDifferent && (
              <DevisAdresseChantier
                defaultValue={form.chantierAddress}
                codePostal={form.chantierCodePostal}
                ville={form.chantierVille}
                onSelect={(a) => {
                  form.setChantierAddress(a.adresse);
                  form.setChantierCodePostal(a.codePostal);
                  form.setChantierVille(a.ville);
                }}
                onCodePostalChange={form.setChantierCodePostal}
                onVilleChange={form.setChantierVille}
              />
            )}
          </div>
        )}
      </div>

      <DevisLignes
        lignes={form.formData.lignes}
        errors={form.errors}
        onAddLigne={form.handleAddLigne}
        onRemoveLigne={form.handleRemoveLigne}
        onLigneChange={form.handleLigneChange}
        onOpenDescriptionModal={form.openDescriptionModal}
        totals={form.totals}
      />

      <DevisNotesConditions
        notes={form.formData.notes ?? ""}
        conditions={form.formData.conditions ?? ""}
        onNotesChange={(val) => form.setFormData((prev) => ({ ...prev, notes: val }))}
        onConditionsChange={(val) => form.setFormData((prev) => ({ ...prev, conditions: val }))}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => form.router.back()}
          className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-primary-light/25 hover:text-primary"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
        <button
          type="submit"
          disabled={form.isPending}
          className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-light shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {form.isPending ? (
            <><div className="w-4 h-4 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />Création...</>
          ) : (
            <><Save className="w-4 h-4" />Créer le devis</>
          )}
        </button>
      </div>

      <DevisDescriptionModal
        isOpen={form.editingDescriptionIndex !== null}
        isAiGenerating={form.isAiGenerating}
        descriptionDraft={form.descriptionDraft}
        quickForm={form.descriptionQuickForm}
        onDescriptionDraftChange={form.setDescriptionDraft}
        onQuickFormChange={(field, val) => form.setDescriptionQuickForm((prev) => ({ ...prev, [field]: val }))}
        onApplyManual={form.applyQuickDescription}
        onGenerateWithAI={form.handleGenerateWithAI}
        onImproveWithAI={form.handleImproveWithAI}
        onSave={form.saveDescriptionModal}
        onClose={form.closeDescriptionModal}
      />
    </form>
  );
}
