"use server";

import { verifySession } from "@/app/lib/session";
import { genererDescriptionLigne, ameliorerDescription } from "@/lib/mistral";

export async function genererDescriptionIA(params: {
  cibleIntervention?: string;
  intitule?: string;
  precision?: string;
  materiaux?: string;
}): Promise<{ data?: string; error?: string }> {
  try {
    const session = await verifySession();
    if (!session?.user) return { error: "Non autorisé" };

    const description = await genererDescriptionLigne(params);
    return { data: description };
  } catch {
    return { error: "Erreur lors de la génération IA" };
  }
}

export async function ameliorerDescriptionIA(
  description: string
): Promise<{ data?: string; error?: string }> {
  try {
    const session = await verifySession();
    if (!session?.user) return { error: "Non autorisé" };

    const resultat = await ameliorerDescription(description);
    return { data: resultat };
  } catch {
    return { error: "Erreur lors de l'amélioration IA" };
  }
}
