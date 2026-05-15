import { DevisFormValues } from "../validations/devis-validation";

type SetFormData = React.Dispatch<React.SetStateAction<DevisFormValues>>;

export const DEFAULT_LIGNE = {
  typeOperation: "SERVICE" as const,
  description: "",
  quantite: 1,
  prixUnitaireHT: 0,
  tauxTVA: 20,
};

export function useDevisLignes(lignes: DevisFormValues["lignes"], setFormData: SetFormData) {
  const totals = lignes.reduce(
    (acc, l) => {
      const ht = l.quantite * l.prixUnitaireHT;
      const tva = ht * (l.tauxTVA / 100);
      return { totalHT: acc.totalHT + ht, totalTVA: acc.totalTVA + tva, totalTTC: acc.totalTTC + ht + tva };
    },
    { totalHT: 0, totalTVA: 0, totalTTC: 0 }
  );

  const handleAddLigne = () =>
    setFormData((prev) => ({ ...prev, lignes: [...prev.lignes, DEFAULT_LIGNE] }));

  const handleRemoveLigne = (index: number) => {
    if (lignes.length <= 1) return;
    setFormData((prev) => ({ ...prev, lignes: prev.lignes.filter((_, i) => i !== index) }));
  };

  const handleLigneChange = (index: number, field: string, value: string | number) =>
    setFormData((prev) => {
      const newLignes = [...prev.lignes];
      newLignes[index] = { ...newLignes[index], [field]: value };
      return { ...prev, lignes: newLignes };
    });

  return { totals, handleAddLigne, handleRemoveLigne, handleLigneChange };
}
