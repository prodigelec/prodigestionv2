"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient, updateClient, type ActionState } from "@/features/clients/actions/client-actions";
import { TypeClient, StatutClient } from "@/generated/prisma";
import { CustomSelect } from "@/components/ui/custom-select";
import { CompanySearchButton, type CompanyData } from "@/features/clients/components/company-search-button";

interface ClientFormProps {
  initialData?: any;
}

export function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;
  
  const initialState: ActionState = {};
  
  // Utiliser updateClient si initialData est présent, sinon createClient
  const actionToUse = isEditMode 
    ? (state: ActionState, formData: FormData) => updateClient(initialData.id, state, formData)
    : createClient;
    
  const [state, formAction, isPending] = useActionState(actionToUse, initialState);

  const [selectedType, setSelectedType] = useState<string>(initialData?.type || TypeClient.PARTICULIER);
  const [selectedStatut, setSelectedStatut] = useState<string>(initialData?.statut || StatutClient.PROSPECT);

  useEffect(() => {
    if (state.success) {
      toast.success(isEditMode ? "Client modifié avec succès !" : "Client créé avec succès !");
      router.push("/clients");
    } else if (state.error) {
      toast.error(state.error);
    } else if (state.fieldErrors) {
      toast.error("Veuillez vérifier les champs du formulaire.");
    }
  }, [state, router]);

  const handleCompanySelect = (company: CompanyData) => {
    // Utilisation directe du DOM pour pré-remplir les champs
    // car le formulaire utilise nativement FormData et defaultValue
    const setInputValue = (id: string, value: string) => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (el) el.value = value;
    };

    setInputValue("raisonSociale", company.nom);
    setInputValue("nom", company.nom); // Par défaut, on met la RS comme nom commercial
    setInputValue("siret", company.siret);
    setInputValue("adresse", company.adresse);
    setInputValue("codePostal", company.codePostal);
    setInputValue("ville", company.ville);
    
    // Bonus UX: Calcul du numéro de TVA intracommunautaire français à partir du SIREN
    if (company.siret && company.siret.length >= 9) {
      const siren = company.siret.substring(0, 9);
      const cle = (12 + 3 * (parseInt(siren, 10) % 97)) % 97;
      const cleStr = cle.toString().padStart(2, "0");
      setInputValue("numeroTVA", `FR${cleStr}${siren}`);
    }
  };

  const isParticulier = selectedType === TypeClient.PARTICULIER;
  const isSyndicOrAgence = selectedType === TypeClient.SYNDIC || selectedType === TypeClient.AGENCE_IMMOBILIERE;
  const isAutre = selectedType === TypeClient.AUTRE;

  return (
    <form action={formAction} className="space-y-8">
      {/* Type et Statut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium text-foreground">Type de client <span className="text-red-500">*</span></label>
          <CustomSelect
            value={selectedType}
            onChange={setSelectedType}
            name="type"
            options={Object.values(TypeClient).map((type) => ({
              value: type,
              label: type.replace(/_/g, " ")
            }))}
          />
          {state.fieldErrors?.type && <p className="text-sm text-red-500">{state.fieldErrors.type[0]}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="statut" className="text-sm font-medium text-foreground">Statut <span className="text-red-500">*</span></label>
          <CustomSelect
            value={selectedStatut}
            onChange={setSelectedStatut}
            name="statut"
            options={Object.values(StatutClient).map((statut) => ({
              value: statut,
              label: statut
            }))}
          />
          {state.fieldErrors?.statut && <p className="text-sm text-red-500">{state.fieldErrors.statut[0]}</p>}
        </div>

        {isAutre && (
          <div className="space-y-2 md:col-span-2">
          <label htmlFor="typeAutre" className="text-sm font-medium text-foreground">Précisez le type <span className="text-red-500">*</span></label>
          <input 
            id="typeAutre" name="typeAutre" type="text" 
            defaultValue={initialData?.typeAutre || ""}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none"
            placeholder="Ex: Bailleur, Promoteur..."
          />
          {state.fieldErrors?.typeAutre && <p className="text-sm text-red-500">{state.fieldErrors.typeAutre[0]}</p>}
        </div>
        )}
      </div>

      {/* Informations Générales */}
      <div className="border-t border-border pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-medium text-primary">Informations Générales</h3>
          {!isParticulier && (
            <CompanySearchButton onSelect={handleCompanySelect} />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* NOM / RAISON SOCIALE */}
          {isParticulier ? (
            <>
              <div className="space-y-2">
                <label htmlFor="nom" className="text-sm font-medium text-foreground">Nom de famille <span className="text-red-500">*</span></label>
                <input id="nom" name="nom" type="text" defaultValue={initialData?.nom || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="Ex: Dupont" />
                {state.fieldErrors?.nom && <p className="text-sm text-red-500">{state.fieldErrors.nom[0]}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="prenom" className="text-sm font-medium text-foreground">Prénom</label>
                <input id="prenom" name="prenom" type="text" defaultValue={initialData?.prenom || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="Ex: Jean" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="raisonSociale" className="text-sm font-medium text-foreground">Raison Sociale</label>
                <input id="raisonSociale" name="raisonSociale" type="text" defaultValue={initialData?.raisonSociale || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="Ex: Acme Corp" />
              </div>
              <div className="space-y-2">
                <label htmlFor="nom" className="text-sm font-medium text-foreground">Nom usuel ou commercial <span className="text-red-500">*</span></label>
                <input id="nom" name="nom" type="text" defaultValue={initialData?.nom || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="Ex: Acme" />
                {state.fieldErrors?.nom && <p className="text-sm text-red-500">{state.fieldErrors.nom[0]}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="siret" className="text-sm font-medium text-foreground">SIRET</label>
                <input id="siret" name="siret" type="text" defaultValue={initialData?.siret || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="14 chiffres" />
              </div>
              <div className="space-y-2">
                <label htmlFor="numeroTVA" className="text-sm font-medium text-foreground">Numéro TVA Intracommunautaire</label>
                <input id="numeroTVA" name="numeroTVA" type="text" defaultValue={initialData?.numeroTVA || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="FR..." />
              </div>
            </>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <input id="email" name="email" type="email" defaultValue={initialData?.email || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="contact@exemple.com" />
            {state.fieldErrors?.email && <p className="text-sm text-red-500">{state.fieldErrors.email[0]}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="telephone" className="text-sm font-medium text-foreground">Téléphone fixe</label>
            <input id="telephone" name="telephone" type="tel" defaultValue={initialData?.telephone || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="01 23 45 67 89" />
          </div>
          <div className="space-y-2">
            <label htmlFor="telephonePortable" className="text-sm font-medium text-foreground">Téléphone portable</label>
            <input id="telephonePortable" name="telephonePortable" type="tel" defaultValue={initialData?.telephonePortable || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="06 12 34 56 78" />
          </div>
          {!isParticulier && (
            <div className="space-y-2">
              <label htmlFor="siteWeb" className="text-sm font-medium text-foreground">Site Web</label>
              <input id="siteWeb" name="siteWeb" type="url" defaultValue={initialData?.siteWeb || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="https://www.exemple.com" />
              {state.fieldErrors?.siteWeb && <p className="text-sm text-red-500">{state.fieldErrors.siteWeb[0]}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Adresse */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-medium text-primary mb-4">Adresse</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="adresse" className="text-sm font-medium text-foreground">Adresse postale</label>
            <input id="adresse" name="adresse" type="text" defaultValue={initialData?.adresse || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="123 rue de la Paix" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="adresseComplement" className="text-sm font-medium text-foreground">Complément d'adresse</label>
            <input id="adresseComplement" name="adresseComplement" type="text" defaultValue={initialData?.adresseComplement || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="Bâtiment A, Étage 2, Digicode..." />
          </div>
          <div className="space-y-2">
            <label htmlFor="codePostal" className="text-sm font-medium text-foreground">Code Postal</label>
            <input id="codePostal" name="codePostal" type="text" defaultValue={initialData?.codePostal || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="75000" />
          </div>
          <div className="space-y-2">
            <label htmlFor="ville" className="text-sm font-medium text-foreground">Ville</label>
            <input id="ville" name="ville" type="text" defaultValue={initialData?.ville || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="Paris" />
          </div>
          <div className="space-y-2">
            <label htmlFor="pays" className="text-sm font-medium text-foreground">Pays</label>
            <input id="pays" name="pays" type="text" defaultValue={initialData?.pays || "France"} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" />
          </div>
        </div>
      </div>

      {/* Informations Spécifiques Syndic / Agence */}
      {isSyndicOrAgence && (
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-medium text-primary mb-4">Informations Syndic / Agence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="nomImmeubleOuCopropriete" className="text-sm font-medium text-foreground">Nom de la résidence ou copropriété</label>
              <input id="nomImmeubleOuCopropriete" name="nomImmeubleOuCopropriete" type="text" defaultValue={initialData?.nomImmeubleOuCopropriete || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="Résidence Les Lilas" />
            </div>
            <div className="space-y-2">
              <label htmlFor="contactSurPlace" className="text-sm font-medium text-foreground">Contact sur place (Gardien, locataire...)</label>
              <input id="contactSurPlace" name="contactSurPlace" type="text" defaultValue={initialData?.contactSurPlace || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="M. Durand (Gardien)" />
            </div>
            <div className="space-y-2">
              <label htmlFor="telSurPlace" className="text-sm font-medium text-foreground">Téléphone sur place</label>
              <input id="telSurPlace" name="telSurPlace" type="tel" defaultValue={initialData?.telSurPlace || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="01 02 03 04 05" />
            </div>
          </div>
        </div>
      )}

      {/* Interlocuteur (pour les pros) */}
      {!isParticulier && (
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-medium text-primary mb-4">Interlocuteur Principal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="interlocuteurNomComplet" className="text-sm font-medium text-foreground">Nom complet</label>
              <input id="interlocuteurNomComplet" name="interlocuteurNomComplet" type="text" defaultValue={initialData?.interlocuteurNomComplet || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="Ex: Marie Martin" />
            </div>
            <div className="space-y-2">
              <label htmlFor="interlocuteurPoste" className="text-sm font-medium text-foreground">Poste</label>
              <input id="interlocuteurPoste" name="interlocuteurPoste" type="text" defaultValue={initialData?.interlocuteurPoste || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="Ex: Gestionnaire de copropriété" />
            </div>
            <div className="space-y-2">
              <label htmlFor="interlocuteurEmail" className="text-sm font-medium text-foreground">Email de l'interlocuteur</label>
              <input id="interlocuteurEmail" name="interlocuteurEmail" type="email" defaultValue={initialData?.interlocuteurEmail || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="marie.martin@exemple.com" />
              {state.fieldErrors?.interlocuteurEmail && <p className="text-sm text-red-500">{state.fieldErrors.interlocuteurEmail[0]}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="interlocuteurPortable" className="text-sm font-medium text-foreground">Portable de l'interlocuteur</label>
              <input id="interlocuteurPortable" name="interlocuteurPortable" type="tel" defaultValue={initialData?.interlocuteurPortable || ""} className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none" placeholder="06 98 76 54 32" />
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-medium text-primary mb-4">Informations Complémentaires</h3>
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium text-foreground">Notes / Observations</label>
          <textarea 
            id="notes" name="notes" rows={4}
            defaultValue={initialData?.notes || ""}
            className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none resize-y"
            placeholder="Informations utiles, particularités..."
          />
        </div>
      </div>

      <div className="border-t border-border pt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-border bg-background text-foreground shadow-sm hover:bg-primary-light/25 hover:text-primary h-9 px-4 py-2"
          disabled={isPending}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-light shadow hover:bg-primary/90 h-9 px-4 py-2"
          disabled={isPending}
        >
          {isPending ? (isEditMode ? "Modification..." : "Création...") : (isEditMode ? "Modifier le client" : "Créer le client")}
        </button>
      </div>
    </form>
  );
}
