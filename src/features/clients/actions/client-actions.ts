"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";  
import { verifySession } from "@/app/lib/session";
import { clientSchema } from "../validations/client-validation";
import { encryptSensitiveData, decryptSensitiveData } from "@/app/lib/encryption";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function createClient(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const sessionData = await verifySession();
    if (!sessionData || !sessionData.user) {
      return { error: "Vous devez être connecté pour effectuer cette action." };
    }
    const user = sessionData.user;

    const rawData = Object.fromEntries(formData.entries());

    // Validation Joi
    const { error, value } = clientSchema.validate(rawData, { abortEarly: false });

    if (error) {
      const fieldErrors: Record<string, string[]> = {};
      error.details.forEach((detail) => {
        const key = detail.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(detail.message);
      });
      return { fieldErrors };
    }

    // Nettoyer les données (supprimer les chaînes vides pour Prisma)
    const cleanedData = Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key, 
        val === "" ? null : val
      ])
    );

    // Chiffrement des données sensibles
    const encryptedData = encryptSensitiveData(cleanedData);

    // Création dans la base de données
    await prisma.client.create({
      data: {
        ...(encryptedData as any),
        userId: user.id,
      },
    });

    revalidatePath("/clients");
    return { success: true };
    
  } catch (error) {
    console.error("[CREATE_CLIENT_ERROR]", error);
    return { error: "Une erreur est survenue lors de la création du client." };
  }
}

export async function getClientById(clientId: string) {
  try {
    const sessionData = await verifySession();
    if (!sessionData || !sessionData.user) {
      return { error: "Non autorisé" };
    }

    const rawClient = await prisma.client.findUnique({
      where: {
        id: clientId,
        userId: sessionData.user.id
      }
    });

    if (!rawClient) {
      return { error: "Client introuvable" };
    }

    // Déchiffrement des données pour l'affichage
    const client = decryptSensitiveData(rawClient);
    
    return { data: client };
  } catch (error) {
    console.error("[GET_CLIENT_ERROR]", error);
    return { error: "Une erreur est survenue lors de la récupération du client" };
  }
}
