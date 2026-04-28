import Link from "next/link";
import { TypeClient } from "@/generated/prisma/enums";

const TYPE_LABELS: Record<string, string> = {
  PARTICULIER:        "Particulier",
  ENTREPRISE:         "Entreprise",
  SYNDIC:             "Syndic",
  AGENCE_IMMOBILIERE: "Agence immobilière",
  AUTRE:              "Autre",
};

const STATUT_LABELS: Record<string, string> = {
  PROSPECT: "Prospect",
  CLIENT:   "Client",
  INACTIF:  "Inactif",
  ARCHIVE:  "Archivé",
};

const STATUT_COLORS: Record<string, string> = {
  PROSPECT: "#B45309",
  CLIENT:   "#16A34A",
  INACTIF:  "#6B7280",
  ARCHIVE:  "#9CA3AF",
};

interface ClientDetailsProps {
  client: any;
}

export function ClientDetails({ client }: ClientDetailsProps) {
  // Gestion du nom (différent entre Particulier et Entreprise)
  const nom = client.type === TypeClient.PARTICULIER 
    ? (client.prenom ? `${client.prenom} ${client.nom}` : client.nom)
    : (client.raisonSociale || client.nom);

  const typeLabel = client.type === TypeClient.AUTRE && client.typeAutre 
    ? client.typeAutre 
    : TYPE_LABELS[client.type];
    
  const showPro = ([TypeClient.ENTREPRISE, TypeClient.SYNDIC, TypeClient.AGENCE_IMMOBILIERE] as TypeClient[]).includes(client.type as TypeClient);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/clients" className="text-sm hover:underline text-muted-foreground">
              Clients
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-foreground">{nom}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">{nom}</h1>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: `${STATUT_COLORS[client.statut]}15`,
                color: STATUT_COLORS[client.statut],
                border: `1px solid ${STATUT_COLORS[client.statut]}30`
              }}
            >
              {STATUT_LABELS[client.statut]}
            </span>
          </div>
          <p className="text-sm mt-0.5 text-muted-foreground">{typeLabel}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link
            href={`/clients/${client.id}/edit`}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium border text-center transition hover:opacity-80 bg-surface border-border text-foreground flex items-center justify-center gap-2"
          >
            ✏️ Modifier
          </Link>
          {/* Composant ClientActions manquant - Espace réservé */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-surface text-muted-foreground cursor-not-allowed">
            ⚙️ Actions...
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infos principales */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-xl border p-5 bg-surface border-border">
            <h2 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">ℹ️ Informations</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                {[
                  ["Email", client.email],
                  ["Téléphone", client.telephone],
                  ["Portable", client.telephonePortable],
                  ["Adresse", client.adresse],
                  ["Code postal", client.codePostal],
                  ["Ville", client.ville],
                  ["SIRET", client.siret],
                  ["N° TVA", client.numeroTVA],
                ].map(([label, value]) => value ? (
                  <div key={label as string}>
                    <dt className="text-muted-foreground">{label as string}</dt>
                    <dd className="font-medium mt-0.5 text-foreground">{value as string}</dd>
                  </div>
                ) : null)}
              </dl>
          </div>

          {/* Interlocuteur */}
          {showPro && (client.interlocuteurNomComplet || client.interlocuteurPortable || client.interlocuteurEmail) && (
            <div className="rounded-xl border p-5 bg-surface border-border">
              <h2 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">👤 Interlocuteur principal</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                {[
                  ["Nom", client.interlocuteurNomComplet],
                  ["Poste", client.interlocuteurPoste],
                  ["Portable", client.interlocuteurPortable],
                  ["Email", client.interlocuteurEmail],
                ].map(([label, value]) => value ? (
                  <div key={label as string}>
                    <dt className="text-muted-foreground">{label as string}</dt>
                    <dd className="font-medium mt-0.5 text-foreground">{value as string}</dd>
                  </div>
                ) : null)}
              </dl>
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <div className="rounded-xl border p-5 bg-surface border-border">
              <h2 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-2">📝 Notes</h2>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">{client.notes}</p>
            </div>
          )}

          {/* Devis récents - Espace réservé (Relations non existantes) */}
          <div className="rounded-xl border p-5 bg-surface border-border opacity-50">
            <h2 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">📄 Devis récents</h2>
            <p className="text-sm text-muted-foreground">Module Devis non installé</p>
          </div>

          {/* Historique Emails - Espace réservé */}
          <div className="rounded-xl border p-5 bg-surface border-border opacity-50">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
              📧 Historique des échanges
            </h2>
            <p className="text-sm text-muted-foreground">Module Emails non installé</p>
          </div>
        </div>

        {/* Badges + stats */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border p-5 bg-surface border-border opacity-50">
            <h2 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">🏅 Badges</h2>
            <p className="text-sm text-muted-foreground">Aucun badge (Module non installé)</p>
          </div>

          <div className="rounded-xl border p-5 bg-surface border-border opacity-50">
            <h2 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">📊 Activité</h2>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Devis</dt>
                <dd className="font-semibold text-foreground">0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Factures</dt>
                <dd className="font-semibold text-foreground">0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Client depuis</dt>
                <dd className="font-semibold text-foreground">
                  {new Date(client.createdAt).toLocaleDateString("fr-FR")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}