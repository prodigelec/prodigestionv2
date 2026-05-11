export interface ClientLight {
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

export type LigneDevisForm = {
  id?: string;
  typeOperation: "SERVICE" | "MARCHANDISE";
  description: string;
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
  ordre?: number;
};

export type DescriptionQuickForm = {
  cibleIntervention: string;
  intitule: string;
  precision: string;
  materiaux: string;
};
