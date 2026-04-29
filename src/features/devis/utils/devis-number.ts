import { prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";

/**
 * Génère un numéro de devis séquentiel sous la forme DEV-YYYY-MM-XXXX
 * Ex: DEV-2026-04-0001
 * Le compteur repart à 0001 chaque mois.
 */
export async function generateDevisNumber(): Promise<string> {
  const sessionData = await verifySession();
  if (!sessionData || !sessionData.user) {
    throw new Error("Non autorisé");
  }

  const userId = sessionData.user.id;
  const now = new Date();
  
  const year = now.getFullYear();
  // padStart(2, "0") permet d'avoir "04" au lieu de "4"
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); 
  
  // Préfixe de base: DEV-2026-04-
  const prefix = `DEV-${year}-${month}-`;

  // Trouver le dernier devis de ce mois-ci pour cet utilisateur
  const lastDevis = await prisma.devis.findFirst({
    where: {
      userId,
      numero: {
        startsWith: prefix,
      },
    },
    orderBy: {
      numero: "desc",
    },
  });

  if (!lastDevis) {
    // Premier devis du mois
    return `${prefix}0001`;
  }

  // Extraire le numéro de fin du dernier devis
  // Ex: "DEV-2026-04-0012" -> "0012" -> 12
  const lastNumberStr = lastDevis.numero.replace(prefix, "");
  const lastNumber = parseInt(lastNumberStr, 10);
  
  if (isNaN(lastNumber)) {
    // Fallback de sécurité si le format était corrompu
    return `${prefix}0001`;
  }

  // Incrémenter et formater avec des zéros (ex: 13 -> "0013")
  const nextNumber = lastNumber + 1;
  const nextNumberStr = nextNumber.toString().padStart(4, "0");

  return `${prefix}${nextNumberStr}`;
}
