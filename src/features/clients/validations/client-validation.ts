import Joi from "joi";
import { TypeClient, StatutClient } from "@/generated/prisma/enums";

export const clientSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(TypeClient))
    .required()
    .messages({
      "any.required": "Le type de client est requis",
      "any.only": "Type de client invalide",
    }),
  
  typeAutre: Joi.string().allow("").optional().when("type", {
    is: TypeClient.AUTRE,
    then: Joi.string().required().messages({
      "string.empty": "Veuillez préciser le type",
      "any.required": "Veuillez préciser le type",
    }),
  }),

  statut: Joi.string()
    .valid(...Object.values(StatutClient))
    .required()
    .messages({
      "any.required": "Le statut est requis",
      "any.only": "Statut invalide",
    }),

  nom: Joi.string().required().messages({
    "string.base": "Le nom est obligatoire",
    "string.empty": "Le nom (ou raison sociale) est requis",
    "any.required": "Le nom (ou raison sociale) est requis",
  }),

  prenom: Joi.string().allow("").optional(),
  raisonSociale: Joi.string().allow("").optional(),
  
  email: Joi.string().email({ tlds: { allow: false } }).allow("").optional().messages({
    "string.base": "L'adresse email n'est pas valide",
    "string.email": "L'adresse email n'est pas valide",
  }),
  
  telephone: Joi.string().allow("").optional(),
  telephonePortable: Joi.string().allow("").optional(),
  siteWeb: Joi.string().uri().allow("").optional().messages({
    "string.uri": "L'URL du site web n'est pas valide",
  }),

  adresse: Joi.string().allow("").optional(),
  adresseComplement: Joi.string().allow("").optional(),
  ville: Joi.string().allow("").optional(),
  codePostal: Joi.string().allow("").optional(),
  pays: Joi.string().default("France").allow("").optional(),

  siret: Joi.string().allow("").optional(),
  numeroTVA: Joi.string().allow("").optional(),

  nomImmeubleOuCopropriete: Joi.string().allow("").optional(),
  contactSurPlace: Joi.string().allow("").optional(),
  telSurPlace: Joi.string().allow("").optional(),

  interlocuteurNomComplet: Joi.string().allow("").optional(),
  interlocuteurPoste: Joi.string().allow("").optional(),
  interlocuteurPortable: Joi.string().allow("").optional(),
  interlocuteurEmail: Joi.string().email({ tlds: { allow: false } }).allow("").optional().messages({
    "string.email": "L'adresse email de l'interlocuteur n'est pas valide",
  }),

  notes: Joi.string().allow("").optional(),
});

export type ClientFormData = {
  type: TypeClient;
  typeAutre?: string | null;
  statut: StatutClient;
  nom: string;
  prenom?: string | null;
  raisonSociale?: string | null;
  email?: string | null;
  telephone?: string | null;
  telephonePortable?: string | null;
  siteWeb?: string | null;
  adresse?: string | null;
  adresseComplement?: string | null;
  ville?: string | null;
  codePostal?: string | null;
  pays?: string | null;
  siret?: string | null;
  numeroTVA?: string | null;
  nomImmeubleOuCopropriete?: string | null;
  contactSurPlace?: string | null;
  telSurPlace?: string | null;
  interlocuteurNomComplet?: string | null;
  interlocuteurPoste?: string | null;
  interlocuteurPortable?: string | null;
  interlocuteurEmail?: string | null;
  notes?: string | null;
};