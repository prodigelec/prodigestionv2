import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const DEFAULT_MODEL = "mistral-small-latest";

export async function genererDescriptionLigne(params: {
  cibleIntervention?: string;
  intitule?: string;
  precision?: string;
  materiaux?: string;
}): Promise<string> {
  const { cibleIntervention, intitule, precision, materiaux } = params;

  const lignes = [
    cibleIntervention ? `- Travaux sur : ${cibleIntervention}` : null,
    intitule ? `- Intitulé : ${intitule}` : null,
    precision ? `- Détails : ${precision}` : null,
    materiaux ? `- Matériaux : ${materiaux}` : null,
  ].filter(Boolean);

  const prompt = [
    "Tu es un assistant pour artisans et entreprises du bâtiment.",
    "Génère une description professionnelle et concise pour une ligne de devis.",
    "Style formel, en français, texte fluide sans bullet points. 2 à 4 phrases maximum.",
    "",
    "Informations :",
    ...lignes,
  ].join("\n");

  const response = await mistral.chat.complete({
    model: DEFAULT_MODEL,
    messages: [{ role: "user", content: prompt }],
    maxTokens: 300,
    temperature: 0.4,
  });

  return response.choices?.[0]?.message?.content?.toString() ?? "";
}

export async function ameliorerDescription(description: string): Promise<string> {
  const prompt = [
    "Tu es un assistant pour artisans et entreprises du bâtiment.",
    "Reformule et améliore ce texte pour en faire une description professionnelle de ligne de devis.",
    "Style formel, en français, texte fluide sans bullet points. 2 à 4 phrases maximum.",
    "",
    `Texte original : ${description}`,
  ].join("\n");

  const response = await mistral.chat.complete({
    model: DEFAULT_MODEL,
    messages: [{ role: "user", content: prompt }],
    maxTokens: 300,
    temperature: 0.4,
  });

  return response.choices?.[0]?.message?.content?.toString() ?? "";
}
