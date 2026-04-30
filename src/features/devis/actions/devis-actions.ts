"use server";

import { prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { StatutDevis } from "@/generated/prisma";
import { generateDevisNumber } from "../utils/devis-number";
import { revalidatePath } from "next/cache";

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

export async function getClientsForSelect() {
  try {
    const sessionData = await verifySession();
    if (!sessionData || !sessionData.user) {
      return { error: "Non autorisé" };
    }

    // On récupère juste l'ID, le type et les noms pour le select
    const clients = await prisma.client.findMany({
      where: {
        userId: sessionData.user.id,
      },
      select: {
        id: true,
        type: true,
        nom: true,
        prenom: true,
        raisonSociale: true,
      },
      orderBy: {
        createdAt: "desc",
      }
    });

    return { data: clients };
  } catch (error) {
    console.error("[GET_CLIENTS_SELECT_ERROR]", error);
    return { error: "Impossible de récupérer les clients" };
  }
}

export async function createDevis(data: any) {
  try {
    const sessionData = await verifySession();
    if (!sessionData || !sessionData.user) {
      return { error: "Non autorisé" };
    }

    const userId = sessionData.user.id;

    // 1. Calculer les totaux
    let totalHT = 0;
    let totalTVA = 0;

    const lignesAvecTotaux = data.lignes.map((ligne: any, index: number) => {
      const ligneTotalHT = ligne.quantite * ligne.prixUnitaireHT;
      const ligneTotalTVA = ligneTotalHT * (ligne.tauxTVA / 100);
      const ligneTotalTTC = ligneTotalHT + ligneTotalTVA;

      totalHT += ligneTotalHT;
      totalTVA += ligneTotalTVA;

      return {
        description: ligne.description,
        quantite: ligne.quantite,
        prixUnitaireHT: ligne.prixUnitaireHT,
        tauxTVA: ligne.tauxTVA,
        totalHT: ligneTotalHT,
        totalTVA: ligneTotalTVA,
        totalTTC: ligneTotalTTC,
        ordre: index,
      };
    });

    const totalTTC = totalHT + totalTVA;

    // 2. Générer le numéro de devis
    const numero = await generateDevisNumber();

    // 3. Créer le devis et ses lignes en transaction
    const devis = await prisma.devis.create({
      data: {
        numero,
        dateValidite: new Date(data.dateValidite),
        statut: data.statut || StatutDevis.BROUILLON,
        totalHT,
        totalTVA,
        totalTTC,
        notes: data.notes || null,
        conditions: data.conditions || null,
        userId,
        clientId: data.clientId,
        lignes: {
          create: lignesAvecTotaux,
        },
      },
    });

    revalidatePath("/devis");
    return { success: true, data: devis };
  } catch (error) {
    console.error("[CREATE_DEVIS_ERROR]", error);
    return { error: "Erreur lors de la création du devis" };
  }
}
