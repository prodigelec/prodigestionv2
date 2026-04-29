"use server";

import { prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { StatutDevis } from "@/generated/prisma";

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

    const totalCount = await prisma.devis.count({
      where: { userId: sessionData.user.id }
    });

    const statusCounts = await prisma.devis.groupBy({
      by: ['statut'],
      where: { userId: sessionData.user.id },
      _count: { _all: true }
    });

    const counts = {
      brouillon: statusCounts.find(s => s.statut === StatutDevis.BROUILLON)?._count._all || 0,
      envoye: statusCounts.find(s => s.statut === StatutDevis.ENVOYE)?._count._all || 0,
      accepte: statusCounts.find(s => s.statut === StatutDevis.ACCEPTE)?._count._all || 0,
      refuse: statusCounts.find(s => s.statut === StatutDevis.REFUSE)?._count._all || 0,
    };

    return { 
      data: devisList,
      totalCount,
      counts
    };
  } catch (error) {
    console.error("[GET_DEVIS_LIST_ERROR]", error);
    return { error: "Impossible de récupérer les devis" };
  }
}
