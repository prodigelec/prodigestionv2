"use server";

import { prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";

export async function getDevisList() {
  try {
    const sessionData = await verifySession();
    if (!sessionData || !sessionData.user) {
      return { error: "Non autorisé" };
    }

    const devisList = await prisma.devis.findMany({
      where: {
        userId: sessionData.user.id,
      },
      include: {
        client: {
          select: {
            nom: true,
            prenom: true,
            raisonSociale: true,
            type: true,
          }
        },
      },
      orderBy: {
        dateCreation: "desc",
      }
    });

    return { data: devisList };
  } catch (error) {
    console.error("[GET_DEVIS_LIST_ERROR]", error);
    return { error: "Impossible de récupérer les devis" };
  }
}
