"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, X, Calculator } from "lucide-react";
import { createDevis } from "@/features/devis/actions/devis-actions";
import { devisSchema, DevisFormValues } from "@/features/devis/validations/devis-validation";
import { AddressSearchAutocomplete } from "@/components/ui/address-search-autocomplete";
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
  adresse: string | null;
  adresseComplement: string | null;
  codePostal: string | null;
  ville: string | null;
}

interface DevisFormProps {
  clients: ClientLight[];
}

export function DevisForm({ clients }: DevisFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [typeFilter, setTypeFilter] = useState("TOUS");
  const [isChantierAddressDifferent, setIsChantierAddressDifferent] = useState(false);
  const [chantierAddress, setChantierAddress] = useState("");
  const [chantierCodePostal, setChantierCodePostal] = useState("");
  const [chantierVille, setChantierVille] = useState("");

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
  const selectedClient = clients.find((client) => client.id === formData.clientId);
  const hasSelectedClientAddress =
    !!selectedClient &&
    !!(selectedClient.adresse || selectedClient.adresseComplement || selectedClient.codePostal || selectedClient.ville);

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    if (value === "TOUS" || !formData.clientId) return;
    const selectedClient = clients.find((client) => client.id === formData.clientId);
    if (selectedClient && selectedClient.type !== value) {
      setFormData((prev) => ({ ...prev, clientId: "" }));
      setIsChantierAddressDifferent(false);
      setChantierAddress("");
      setChantierCodePostal("");
      setChantierVille("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Section Client et Validité */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="text-lg font-medium text-primary">Informations Générales</h3>
        <p className="mt-1 text-sm text-muted-foreground">Sélectionnez le client, la date de validité et l'adresse de chantier.</p>

        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Type de client</label>
            <TypeClientSelect value={typeFilter} onChange={handleTypeFilterChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Client *</label>
            <CustomSelect
              name="clientId"
              value={formData.clientId}
              onChange={(val) => {
                setFormData({ ...formData, clientId: val });
                setIsChantierAddressDifferent(false);
                setChantierAddress("");
                setChantierCodePostal("");
                setChantierVille("");
              }}
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

        {selectedClient && (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Adresse du client
                </p>
                <button
                  type="button"
                  disabled={!hasSelectedClientAddress}
                  onClick={() => setIsChantierAddressDifferent((prev) => !prev)}
                  className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                    isChantierAddressDifferent
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {isChantierAddressDifferent
                    ? "Adresse chantier différente: oui"
                    : "Adresse chantier différente: non"}
                </button>
              </div>
              {hasSelectedClientAddress ? (
                <div className="mt-2 space-y-0.5 text-sm text-foreground">
                  {selectedClient.adresse && <p>{selectedClient.adresse}</p>}
                  {selectedClient.adresseComplement && <p>{selectedClient.adresseComplement}</p>}
                  {(selectedClient.codePostal || selectedClient.ville) && (
                    <p>{[selectedClient.codePostal, selectedClient.ville].filter(Boolean).join(" ")}</p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-sm italic text-muted-foreground">
                  Aucune adresse renseignée pour ce client.
                </p>
              )}
            </div>

            {isChantierAddressDifferent && (
              <div className="rounded-lg border border-border bg-background p-4">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Adresse du chantier
                </label>
                <AddressSearchAutocomplete
                  defaultValue={chantierAddress}
                  placeholder="Rechercher l'adresse du chantier..."
                  onSelect={(address) => {
                    setChantierAddress(address.adresse);
                    setChantierCodePostal(address.codePostal);
                    setChantierVille(address.ville);
                  }}
                />

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Code postal</label>
                    <input
                      type="text"
                      value={chantierCodePostal}
                      onChange={(e) => setChantierCodePostal(e.target.value)}
                      placeholder="75000"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Ville</label>
                    <input
                      type="text"
                      value={chantierVille}
                      onChange={(e) => setChantierVille(e.target.value)}
                      placeholder="Paris"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section Lignes du devis */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-primary">Lignes du devis</h3>
            <p className="text-sm text-muted-foreground">Ajoutez les produits ou services</p>
          </div>
          <button
            type="button"
            onClick={handleAddLigne}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-primary-light/25 hover:text-primary"
          >
            <Plus className="w-4 h-4" />
            Ajouter une ligne
          </button>
        </div>

        <div className="space-y-4">
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
        <div className="mt-4 flex flex-col items-end space-y-2 rounded-lg border border-border bg-muted/20 p-4">
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
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="text-lg font-medium text-primary">Notes et Conditions</h3>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
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
          className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-primary-light/25 hover:text-primary"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-light shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
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
