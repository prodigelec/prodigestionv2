"use client";

import Link from "next/link";
import { ArrowLeft, Download, Edit2, FileText } from "lucide-react";
import { StatutDevis, TypeClient } from "@/generated/prisma";

const EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const DATE = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

interface Ligne {
  id: string;
  description: string;
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  ordre: number;
}

interface Client {
  type: string;
  nom: string;
  prenom?: string | null;
  raisonSociale?: string | null;
  adresse?: string | null;
  adresseComplement?: string | null;
  codePostal?: string | null;
  ville?: string | null;
  email?: string | null;
  telephone?: string | null;
  telephonePortable?: string | null;
}

interface DevisDetailProps {
  devis: {
    id: string;
    numero: string;
    dateCreation: Date | string;
    dateValidite: Date | string;
    statut: StatutDevis;
    totalHT: number;
    totalTVA: number;
    totalTTC: number;
    notes?: string | null;
    conditions?: string | null;
    client: Client;
    lignes: Ligne[];
  };
}

const STATUT_CONFIG: Record<StatutDevis, { label: string; className: string }> = {
  BROUILLON: { label: "Brouillon", className: "bg-muted text-muted-foreground border-border" },
  ENVOYE:    { label: "Envoyé",    className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  ACCEPTE:   { label: "Accepté",   className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  REFUSE:    { label: "Refusé",    className: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  EXPIRE:    { label: "Expiré",    className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
};

function clientName(c: Client) {
  return c.type === "PARTICULIER"
    ? `${c.prenom || ""} ${c.nom}`.trim()
    : c.raisonSociale || c.nom;
}

export function DevisDetail({ devis }: DevisDetailProps) {
  const statut = STATUT_CONFIG[devis.statut];

  return (
    <div className="container max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/devis"
            className="inline-flex items-center justify-center p-2 rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{devis.numero}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statut.className}`}>
                {statut.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Créé le {DATE(devis.dateCreation)} · Valable jusqu'au {DATE(devis.dateValidite)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/devis/${devis.id}/pdf`}
            download={`${devis.numero}.pdf`}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50"
          >
            <Download className="w-4 h-4" />
            Télécharger PDF
          </a>
          <Link
            href={`/devis/${devis.id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-light shadow transition-colors hover:bg-primary/90"
          >
            <Edit2 className="w-4 h-4" />
            Modifier
          </Link>
        </div>
      </div>

      {/* Client */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Client</h2>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-foreground">{clientName(devis.client)}</p>
            <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
              devis.client.type === TypeClient.PARTICULIER ? "bg-purple-500/10 text-purple-500" :
              devis.client.type === TypeClient.ENTREPRISE ? "bg-blue-500/10 text-blue-500" :
              devis.client.type === TypeClient.SYNDIC ? "bg-teal-500/10 text-teal-500" :
              devis.client.type === TypeClient.AGENCE_IMMOBILIERE ? "bg-rose-500/10 text-rose-500" :
              "bg-muted text-muted-foreground"
            }`}>
              {devis.client.type.replace(/_/g, " ")}
            </span>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            {devis.client.adresse && <p>{devis.client.adresse}</p>}
            {devis.client.adresseComplement && <p>{devis.client.adresseComplement}</p>}
            {(devis.client.codePostal || devis.client.ville) && (
              <p>{[devis.client.codePostal, devis.client.ville].filter(Boolean).join(" ")}</p>
            )}
            {devis.client.email && <p>{devis.client.email}</p>}
            {(devis.client.telephone || devis.client.telephonePortable) && (
              <p>{devis.client.telephone || devis.client.telephonePortable}</p>
            )}
          </div>
        </div>
      </div>

      {/* Lignes */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Prestations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Description</th>
                <th className="px-6 py-3 text-right font-medium">Qté</th>
                <th className="px-6 py-3 text-right font-medium">PU HT</th>
                <th className="px-6 py-3 text-right font-medium">TVA</th>
                <th className="px-6 py-3 text-right font-medium">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {devis.lignes.map((ligne, i) => (
                <tr key={ligne.id} className={i % 2 === 1 ? "bg-muted/20" : ""}>
                  <td className="px-6 py-4 text-foreground whitespace-pre-line">{ligne.description}</td>
                  <td className="px-6 py-4 text-right text-muted-foreground">{ligne.quantite}</td>
                  <td className="px-6 py-4 text-right text-muted-foreground">{EUR.format(ligne.prixUnitaireHT)}</td>
                  <td className="px-6 py-4 text-right text-muted-foreground">{ligne.tauxTVA}%</td>
                  <td className="px-6 py-4 text-right font-medium text-foreground">{EUR.format(ligne.totalHT)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="p-6 border-t border-border flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total HT</span>
              <span className="font-medium">{EUR.format(devis.totalHT)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total TVA</span>
              <span className="font-medium">{EUR.format(devis.totalTVA)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-border">
              <span>Total TTC</span>
              <span>{EUR.format(devis.totalTTC)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conditions & Notes */}
      {(devis.conditions || devis.notes) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {devis.conditions && (
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Conditions commerciales</h2>
              <p className="text-sm text-foreground whitespace-pre-line">{devis.conditions}</p>
            </div>
          )}
          {devis.notes && (
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Notes internes</h2>
              <p className="text-sm text-foreground whitespace-pre-line">{devis.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
