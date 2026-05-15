import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDevis } from "@/features/devis/actions/devis-actions";
import { genererDescriptionIA, ameliorerDescriptionIA } from "@/features/devis/actions/devis-ai-actions";
import { devisSchema, DevisFormValues } from "@/features/devis/validations/devis-validation";
import { computeDateValidite } from "@/components/ui/validite-select";
import { StatutDevis } from "@/generated/prisma";
import { toast } from "sonner";
import { ClientLight, DescriptionQuickForm } from "@/features/devis/types";

const EMPTY_QUICK_FORM: DescriptionQuickForm = {
  cibleIntervention: "",
  intitule: "",
  precision: "",
  materiaux: "",
};

const DEFAULT_LIGNE = {
  typeOperation: "SERVICE" as const,
  description: "",
  quantite: 1,
  prixUnitaireHT: 0,
  tauxTVA: 20,
};

export function useDevisForm(clients: ClientLight[]) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [typeFilter, setTypeFilter] = useState("TOUS");
  const [isChantierAddressDifferent, setIsChantierAddressDifferent] = useState(false);
  const [editingDescriptionIndex, setEditingDescriptionIndex] = useState<number | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [descriptionQuickForm, setDescriptionQuickForm] = useState<DescriptionQuickForm>(EMPTY_QUICK_FORM);
  const [clientAddress, setClientAddress] = useState("");
  const [clientCodePostal, setClientCodePostal] = useState("");
  const [clientVille, setClientVille] = useState("");
  const [chantierAddress, setChantierAddress] = useState("");
  const [chantierCodePostal, setChantierCodePostal] = useState("");
  const [chantierVille, setChantierVille] = useState("");
  const [validiteDuree, setValiditeDuree] = useState(30);
  const [formData, setFormData] = useState<DevisFormValues>({
    clientId: "",
    dateValidite: computeDateValidite(30),
    statut: StatutDevis.BROUILLON,
    notes: "",
    conditions: "Validité du devis : 30 jours.",
    lignes: [DEFAULT_LIGNE],
  });

  const selectedClient = clients.find((c) => c.id === formData.clientId);
  const hasSelectedClientAddress =
    !!selectedClient &&
    !!(selectedClient.adresse || selectedClient.adresseComplement || selectedClient.codePostal || selectedClient.ville);

  useEffect(() => {
    if (!selectedClient) {
      setClientAddress("");
      setClientCodePostal("");
      setClientVille("");
      return;
    }
    setClientAddress(selectedClient.adresse || "");
    setClientCodePostal(selectedClient.codePostal || "");
    setClientVille(selectedClient.ville || "");
  }, [selectedClient]);

  const formatClientName = (c: ClientLight) =>
    c.type === "PARTICULIER" ? `${c.prenom || ""} ${c.nom}`.trim() : c.raisonSociale || c.nom;

  const filteredClients = typeFilter === "TOUS" ? clients : clients.filter((c) => c.type === typeFilter);
  const clientOptions = [
    { value: "", label: "Sélectionnez un client" },
    ...filteredClients.map((c) => ({ value: c.id, label: `${formatClientName(c)} (${c.type.replace(/_/g, " ")})` })),
  ];

  const totals = formData.lignes.reduce(
    (acc, l) => {
      const ht = l.quantite * l.prixUnitaireHT;
      const tva = ht * (l.tauxTVA / 100);
      return { totalHT: acc.totalHT + ht, totalTVA: acc.totalTVA + tva, totalTTC: acc.totalTTC + ht + tva };
    },
    { totalHT: 0, totalTVA: 0, totalTTC: 0 }
  );

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    if (value !== "TOUS" && formData.clientId) {
      const client = clients.find((c) => c.id === formData.clientId);
      if (client && client.type !== value) {
        setFormData((prev) => ({ ...prev, clientId: "" }));
        setIsChantierAddressDifferent(false);
        setChantierAddress("");
        setChantierCodePostal("");
        setChantierVille("");
      }
    }
  };

  const handleClientChange = (val: string) => {
    setFormData((prev) => ({ ...prev, clientId: val }));
    setIsChantierAddressDifferent(false);
    setChantierAddress("");
    setChantierCodePostal("");
    setChantierVille("");
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

  const handleAddLigne = () =>
    setFormData((prev) => ({ ...prev, lignes: [...prev.lignes, DEFAULT_LIGNE] }));

  const handleRemoveLigne = (index: number) => {
    if (formData.lignes.length <= 1) return;
    setFormData((prev) => ({ ...prev, lignes: prev.lignes.filter((_, i) => i !== index) }));
  };

  const handleLigneChange = (index: number, field: string, value: string | number) =>
    setFormData((prev) => {
      const lignes = [...prev.lignes];
      lignes[index] = { ...lignes[index], [field]: value };
      return { ...prev, lignes };
    });

  const openDescriptionModal = (index: number) => {
    setEditingDescriptionIndex(index);
    setDescriptionDraft(formData.lignes[index]?.description || "");
    setDescriptionQuickForm(EMPTY_QUICK_FORM);
  };

  const closeDescriptionModal = () => {
    setEditingDescriptionIndex(null);
    setDescriptionDraft("");
    setDescriptionQuickForm(EMPTY_QUICK_FORM);
  };

  const saveDescriptionModal = () => {
    if (editingDescriptionIndex === null) return;
    handleLigneChange(editingDescriptionIndex, "description", descriptionDraft);
    closeDescriptionModal();
  };

  const applyQuickDescription = () => {
    const lines = [
      descriptionQuickForm.cibleIntervention.trim() ? `Travaux a effectuer sur ${descriptionQuickForm.cibleIntervention.trim()}.` : null,
      descriptionQuickForm.intitule.trim() || null,
      descriptionQuickForm.precision.trim() ? `Details: ${descriptionQuickForm.precision.trim()}` : null,
      descriptionQuickForm.materiaux.trim() ? `Materiaux: ${descriptionQuickForm.materiaux.trim()}` : null,
    ].filter(Boolean) as string[];
    if (lines.length > 0) setDescriptionDraft(lines.join("\n"));
  };

  const handleGenerateWithAI = async () => {
    setIsAiGenerating(true);
    const result = await genererDescriptionIA(descriptionQuickForm);
    if (result.data) setDescriptionDraft(result.data);
    if (result.error) toast.error(result.error);
    setIsAiGenerating(false);
  };

  const handleImproveWithAI = async () => {
    setIsAiGenerating(true);
    const result = await ameliorerDescriptionIA(descriptionDraft);
    if (result.data) setDescriptionDraft(result.data);
    if (result.error) toast.error(result.error);
    setIsAiGenerating(false);
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
    typeFilter, validiteDuree, isChantierAddressDifferent, isAiGenerating, isPending, errors,
    clientAddress, clientCodePostal, clientVille,
    setClientAddress, setClientCodePostal, setClientVille,
    chantierAddress, chantierCodePostal, chantierVille,
    setChantierAddress, setChantierCodePostal, setChantierVille,
    editingDescriptionIndex, descriptionDraft, descriptionQuickForm,
    setDescriptionDraft, setDescriptionQuickForm,
    selectedClient, hasSelectedClientAddress, clientOptions, totals,
    handleSubmit, handleAddLigne, handleRemoveLigne, handleLigneChange,
    handleTypeFilterChange, handleClientChange, handleValiditeChange,
    openDescriptionModal, closeDescriptionModal, saveDescriptionModal,
    applyQuickDescription, handleGenerateWithAI, handleImproveWithAI,
    handleToggleChantier: () => setIsChantierAddressDifferent((prev) => !prev),
    router,
  };
}
