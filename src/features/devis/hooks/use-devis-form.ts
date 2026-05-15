import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDevis } from "@/features/devis/actions/devis-actions";
import { devisSchema, DevisFormValues } from "@/features/devis/validations/devis-validation";
import { computeDateValidite } from "@/components/ui/validite-select";
import { StatutDevis } from "@/generated/prisma";
import { toast } from "sonner";
import { ClientLight } from "@/features/devis/types";
import { useDevisClients } from "./use-devis-clients";
import { useDevisAdresses } from "./use-devis-adresses";
import { useDevisLignes, DEFAULT_LIGNE } from "./use-devis-lignes";
import { useDevisDescription } from "./use-devis-description";

export function useDevisForm(clients: ClientLight[]) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validiteDuree, setValiditeDuree] = useState(30);
  const [formData, setFormData] = useState<DevisFormValues>({
    clientId: "",
    dateValidite: computeDateValidite(30),
    statut: StatutDevis.BROUILLON,
    notes: "",
    conditions: "Validité du devis : 30 jours.",
    lignes: [DEFAULT_LIGNE],
  });

  const { totals, handleAddLigne, handleRemoveLigne, handleLigneChange } =
    useDevisLignes(formData.lignes, setFormData);

  const descriptionHook = useDevisDescription(handleLigneChange);

  const { typeFilter, setTypeFilter, selectedClient, hasSelectedClientAddress, clientOptions } =
    useDevisClients(clients, formData.clientId);

  const adresses = useDevisAdresses(selectedClient);

  const handleClientChange = (val: string) => {
    setFormData((prev) => ({ ...prev, clientId: val }));
    adresses.resetChantier();
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    if (value !== "TOUS" && formData.clientId) {
      const client = clients.find((c) => c.id === formData.clientId);
      if (client && client.type !== value) {
        handleClientChange("");
      }
    }
  };

  const handleValiditeChange = (jours: number, date: string) => {
    setValiditeDuree(jours);
    setFormData((prev) => ({
      ...prev,
      dateValidite: date,
      conditions: (prev.conditions ?? "").replace(
        /Validité du devis : \d+ jours\./,
        `Validité du devis : ${jours} jours.`
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const { error } = devisSchema.validate(formData, { abortEarly: false });
    if (error) {
      const validationErrors: Record<string, string> = {};
      error.details.forEach((d) => { validationErrors[d.path.join(".")] = d.message; });
      setErrors(validationErrors);
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }
    startTransition(async () => {
      const result = await createDevis(formData);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Le devis a été créé avec succès !");
      router.push("/devis");
      router.refresh();
    });
  };

  return {
    formData, setFormData,
    typeFilter, validiteDuree, errors, isPending,
    ...adresses,
    selectedClient, hasSelectedClientAddress, clientOptions, totals,
    ...descriptionHook,
    handleSubmit, handleAddLigne, handleRemoveLigne, handleLigneChange,
    handleTypeFilterChange, handleClientChange, handleValiditeChange,
    router,
  };
}
