"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, X, Calculator } from "lucide-react";
import { createDevis } from "@/features/devis/actions/devis-actions";
import { devisSchema, DevisFormValues } from "@/features/devis/validations/devis-validation";
import { CustomSelect } from "@/components/ui/custom-select";
import { TypeClientSelect } from "@/features/clients/components/type-client-select";
import { StatutDevis } from "@/generated/prisma";
import { toast } from "sonner";

interface ClientLight {
  id: string;
  type: string;
  nom: string;
  prenom: string | null;
  raisonSociale: string | null;
}

interface DevisFormProps {
  clients: ClientLight[];
}

export function DevisForm({ clients }: DevisFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [typeFilter, setTypeFilter] = useState("TOUS");

  // Valeurs par défaut avec une date de validité à +30 jours
  const defaultDateValidite = new Date();
  defaultDateValidite.setDate(defaultDateValidite.getDate() + 30);

  const [formData, setFormData] = useState<DevisFormValues>({
    clientId: "",
    dateValidite: defaultDateValidite.toISOString().split("T")[0],
    statut: StatutDevis.BROUILLON,
    notes: "",
    conditions: "Conditions de paiement : 30 jours à réception de facture.\nValidité du devis : 30 jours.",
    lignes: [
      {
        description: "",
        quantite: 1,
        prixUnitaireHT: 0,
        tauxTVA: 20,
      }
    ]
  });

  // Calcul des totaux en temps réel
  const calculateTotals = () => {
    let totalHT = 0;
    let totalTVA = 0;

    formData.lignes.forEach((ligne) => {
      const ligneHT = ligne.quantite * ligne.prixUnitaireHT;
      const ligneTVA = ligneHT * (ligne.tauxTVA / 100);
      totalHT += ligneHT;
      totalTVA += ligneTVA;
    });

    return {
      totalHT,
      totalTVA,
      totalTTC: totalHT + totalTVA
    };
  };

  const totals = calculateTotals();

  const handleAddLigne = () => {
    setFormData((prev) => ({
      ...prev,
      lignes: [
        ...prev.lignes,
        { description: "", quantite: 1, prixUnitaireHT: 0, tauxTVA: 20 }
      ]
    }));
  };

  const handleRemoveLigne = (index: number) => {
    if (formData.lignes.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      lignes: prev.lignes.filter((_, i) => i !== index)
    }));
  };

  const handleLigneChange = (index: number, field: string, value: string | number) => {
    setFormData((prev) => {
      const newLignes = [...prev.lignes];
      newLignes[index] = { ...newLignes[index], [field]: value };
      return { ...prev, lignes: newLignes };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation Joi
    const { error } = devisSchema.validate(formData, { abortEarly: false });
    
    if (error) {
      const validationErrors: Record<string, string> = {};
      error.details.forEach((detail) => {
        validationErrors[detail.path.join('.')] = detail.message;
      });
      setErrors(validationErrors);
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    startTransition(async () => {
      const result = await createDevis(formData);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Le devis a été créé avec succès !");
      router.push("/devis");
      router.refresh();
    });
  };

  const formatClientName = (client: ClientLight) => {
    if (client.type === "PARTICULIER") {
      return `${client.prenom || ""} ${client.nom}`.trim();
    }
    return client.raisonSociale || client.nom;
  };

  const filteredClients =
    typeFilter === "TOUS" ? clients : clients.filter((client) => client.type === typeFilter);

  const clientOptions = [
    { value: "", label: "Sélectionnez un client" },
    ...filteredClients.map((client) => ({
      value: client.id,
      label: `${formatClientName(client)} (${client.type.replace(/_/g, " ")})`,
    })),
  ];

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    if (value === "TOUS" || !formData.clientId) return;
    const selectedClient = clients.find((client) => client.id === formData.clientId);
    if (selectedClient && selectedClient.type !== value) {
      setFormData((prev) => ({ ...prev, clientId: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section Client et Validité */}
      <div className="bg-surface border border-border rounded-xl shadow-sm">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-lg font-semibold text-foreground">Informations Générales</h2>
          <p className="text-sm text-muted-foreground">Sélectionnez le client et les dates du devis</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Type de client</label>
            <TypeClientSelect value={typeFilter} onChange={handleTypeFilterChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Client *</label>
            <CustomSelect
              name="clientId"
              value={formData.clientId}
              onChange={(val) => setFormData({ ...formData, clientId: val })}
              options={clientOptions}
              className={errors.clientId ? "border-destructive" : ""}
            />
            {errors.clientId && <p className="text-xs text-destructive">{errors.clientId}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Date de validité *</label>
            <input
              type="date"
              value={formData.dateValidite}
              onChange={(e) => setFormData({ ...formData, dateValidite: e.target.value })}
              className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.dateValidite ? 'border-destructive' : 'border-border'}`}
            />
            {errors.dateValidite && <p className="text-xs text-destructive">{errors.dateValidite}</p>}
          </div>
        </div>
      </div>

      {/* Section Lignes du devis */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Lignes du devis</h2>
            <p className="text-sm text-muted-foreground">Ajoutez les produits ou services</p>
          </div>
          <button
            type="button"
            onClick={handleAddLigne}
            className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter une ligne
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* En-têtes du tableau (visible uniquement sur desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-2 text-sm font-medium text-muted-foreground border-b border-border">
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Quantité</div>
            <div className="col-span-2">Prix Unit. HT</div>
            <div className="col-span-2">TVA (%)</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {formData.lignes.map((ligne, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-muted/10 p-4 md:p-0 md:bg-transparent rounded-lg border border-border md:border-none">
              
              {/* Description */}
              <div className="md:col-span-5 space-y-1">
                <label className="md:hidden text-xs font-medium text-muted-foreground">Description</label>
                <textarea
                  value={ligne.description}
                  onChange={(e) => handleLigneChange(index, "description", e.target.value)}
                  placeholder="Description de la prestation..."
                  rows={2}
                  className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none ${errors[`lignes.${index}.description`] ? 'border-destructive' : 'border-border'}`}
                />
                {errors[`lignes.${index}.description`] && <p className="text-xs text-destructive">{errors[`lignes.${index}.description`]}</p>}
              </div>

              {/* Quantité */}
              <div className="md:col-span-2 space-y-1">
                <label className="md:hidden text-xs font-medium text-muted-foreground">Quantité</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={ligne.quantite}
                  onChange={(e) => handleLigneChange(index, "quantite", parseFloat(e.target.value) || 0)}
                  className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors[`lignes.${index}.quantite`] ? 'border-destructive' : 'border-border'}`}
                />
              </div>

              {/* Prix HT */}
              <div className="md:col-span-2 space-y-1">
                <label className="md:hidden text-xs font-medium text-muted-foreground">Prix Unit. HT (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ligne.prixUnitaireHT}
                  onChange={(e) => handleLigneChange(index, "prixUnitaireHT", parseFloat(e.target.value) || 0)}
                  className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors[`lignes.${index}.prixUnitaireHT`] ? 'border-destructive' : 'border-border'}`}
                />
              </div>

              {/* TVA */}
              <div className="md:col-span-2 space-y-1">
                <label className="md:hidden text-xs font-medium text-muted-foreground">TVA (%)</label>
                <select
                  value={ligne.tauxTVA}
                  onChange={(e) => handleLigneChange(index, "tauxTVA", parseFloat(e.target.value))}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value={20}>20%</option>
                  <option value={10}>10%</option>
                  <option value={5.5}>5.5%</option>
                  <option value={2.1}>2.1%</option>
                  <option value={0}>0%</option>
                </select>
              </div>

              {/* Action */}
              <div className="md:col-span-1 flex justify-end md:justify-end md:pt-2">
                <button
                  type="button"
                  onClick={() => handleRemoveLigne(index)}
                  disabled={formData.lignes.length <= 1}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Supprimer la ligne"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Résumé des totaux */}
        <div className="p-6 bg-muted/30 border-t border-border flex flex-col items-end space-y-2">
          <div className="flex items-center gap-8 text-sm text-muted-foreground w-full md:w-64 justify-between">
            <span>Total HT</span>
            <span className="font-medium text-foreground">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totals.totalHT)}</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground w-full md:w-64 justify-between">
            <span>Total TVA</span>
            <span className="font-medium text-foreground">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totals.totalTVA)}</span>
          </div>
          <div className="flex items-center gap-8 text-lg font-bold text-primary w-full md:w-64 justify-between pt-2 border-t border-border/50">
            <span>Total TTC</span>
            <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totals.totalTTC)}</span>
          </div>
        </div>
      </div>

      {/* Section Notes et Conditions */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-lg font-semibold text-foreground">Notes et Conditions</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Notes internes (non visibles sur le PDF)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
              placeholder="Ex: Projet urgent..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Conditions commerciales</label>
            <textarea
              value={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-light shadow hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-light border-t-transparent rounded-full animate-spin"></div>
              Création...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Créer le devis
            </>
          )}
        </button>
      </div>
    </form>
  );
}
