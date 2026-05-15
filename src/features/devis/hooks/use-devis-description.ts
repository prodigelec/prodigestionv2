import { useState } from "react";
import { genererDescriptionIA, ameliorerDescriptionIA } from "../actions/devis-ai-actions";
import { DescriptionQuickForm } from "../types";
import { toast } from "sonner";

const EMPTY_QUICK_FORM: DescriptionQuickForm = {
  cibleIntervention: "",
  intitule: "",
  precision: "",
  materiaux: "",
};

export function useDevisDescription(
  handleLigneChange: (index: number, field: string, value: string | number) => void
) {
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [editingDescriptionIndex, setEditingDescriptionIndex] = useState<number | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [descriptionQuickForm, setDescriptionQuickForm] = useState<DescriptionQuickForm>(EMPTY_QUICK_FORM);

  const openDescriptionModal = (index: number, currentDescription: string) => {
    setEditingDescriptionIndex(index);
    setDescriptionDraft(currentDescription);
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
      descriptionQuickForm.cibleIntervention.trim()
        ? `Travaux a effectuer sur ${descriptionQuickForm.cibleIntervention.trim()}.`
        : null,
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

  return {
    isAiGenerating,
    editingDescriptionIndex,
    descriptionDraft, setDescriptionDraft,
    descriptionQuickForm, setDescriptionQuickForm,
    openDescriptionModal,
    closeDescriptionModal,
    saveDescriptionModal,
    applyQuickDescription,
    handleGenerateWithAI,
    handleImproveWithAI,
  };
}
