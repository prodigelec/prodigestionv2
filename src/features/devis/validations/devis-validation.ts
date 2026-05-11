import Joi from "joi";
import { StatutDevis } from "@/generated/prisma";

// Schéma pour une ligne de devis
const ligneDevisSchema = Joi.object({
  id: Joi.string().optional(), // Présent uniquement si on modifie une ligne existante
  typeOperation: Joi.string().valid("SERVICE", "MARCHANDISE").required().messages({
    "any.only": "Le type d'opération n'est pas valide",
    "any.required": "Le type d'opération est requis",
  }),

  description: Joi.string().required().messages({
    "string.empty": "La description de la ligne est requise",
    "any.required": "La description de la ligne est requise",
  }),
  quantite: Joi.number().min(0.01).required().messages({
    "number.base": "La quantité doit être un nombre",
    "number.min": "La quantité doit être supérieure à 0",
    "any.required": "La quantité est requise",
  }),
  prixUnitaireHT: Joi.number().min(0).required().messages({
    "number.base": "Le prix unitaire doit être un nombre",
    "number.min": "Le prix unitaire ne peut pas être négatif",
    "any.required": "Le prix unitaire est requis",
  }),
  tauxTVA: Joi.number().valid(0, 2.1, 5.5, 10, 20).required().messages({
    "number.base": "Le taux de TVA doit être un nombre",
    "any.only": "Le taux de TVA n'est pas valide",
    "any.required": "Le taux de TVA est requis",
  }),
  ordre: Joi.number().integer().min(0).optional(),
});

// Schéma principal pour la création/modification d'un devis
export const devisSchema = Joi.object({
  clientId: Joi.string().required().messages({
    "string.empty": "Veuillez sélectionner un client",
    "any.required": "Le client est requis",
  }),
  dateValidite: Joi.date().iso().required().messages({
    "date.base": "La date de validité doit être une date valide",
    "date.format": "Le format de la date est incorrect",
    "any.required": "La date de validité est requise",
  }),
  statut: Joi.string()
    .valid(...Object.values(StatutDevis))
    .optional()
    .default(StatutDevis.BROUILLON)
    .messages({
      "any.only": "Le statut sélectionné n'est pas valide",
    }),
  notes: Joi.string().allow("").optional(),
  conditions: Joi.string().allow("").optional(),
  
  lignes: Joi.array().items(ligneDevisSchema).min(1).required().messages({
    "array.min": "Le devis doit contenir au moins une ligne",
    "any.required": "Les lignes du devis sont requises",
  }),
});

export type DevisFormValues = {
  clientId: string;
  dateValidite: string;
  statut: StatutDevis;
  notes?: string;
  conditions?: string;
  lignes: {
    id?: string;
    typeOperation: "SERVICE" | "MARCHANDISE";
    description: string;
    quantite: number;
    prixUnitaireHT: number;
    tauxTVA: number;
    ordre?: number;
  }[];
};
