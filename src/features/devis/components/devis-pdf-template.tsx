import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const EUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const DATE = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

const s = StyleSheet.create({
  page: { padding: 48, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a" },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  title: { fontSize: 28, fontFamily: "Helvetica-Bold", color: "#1a1a1a", letterSpacing: 2 },
  devisInfo: { alignItems: "flex-end" },
  numero: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1a1a1a" },
  infoRow: { flexDirection: "row", gap: 4, marginTop: 4 },
  label: { color: "#6b7280" },
  value: { fontFamily: "Helvetica-Bold" },

  // Client block
  clientBlock: {
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    padding: 16,
    marginBottom: 28,
    borderLeft: "3 solid #1a1a1a",
  },
  clientTitle: { fontSize: 8, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  clientName: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  clientDetail: { color: "#4b5563", lineHeight: 1.5 },

  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottom: "1 solid #e5e7eb",
  },
  tableRowAlt: { backgroundColor: "#f9fafb" },

  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "right" },
  colPU: { flex: 2, textAlign: "right" },
  colTVA: { flex: 1, textAlign: "right" },
  colTotal: { flex: 2, textAlign: "right" },

  // Totals
  totalsSection: { marginTop: 16, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 220, paddingVertical: 4 },
  totalLabel: { color: "#6b7280" },
  totalValue: { fontFamily: "Helvetica-Bold", textAlign: "right", width: 90 },
  totalTTCRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    borderRadius: 4,
    marginTop: 6,
    fontSize: 11,
  },
  totalTTCLabel: { fontFamily: "Helvetica-Bold" },
  totalTTCValue: { fontFamily: "Helvetica-Bold", textAlign: "right" },

  // Footer
  footer: { marginTop: 32, paddingTop: 16, borderTop: "1 solid #e5e7eb" },
  footerTitle: { fontSize: 8, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  footerText: { color: "#4b5563", lineHeight: 1.6 },
});

interface Ligne {
  description: string;
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
  totalHT: number;
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
}

interface DevisPdfData {
  numero: string;
  dateCreation: Date | string;
  dateValidite: Date | string;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  notes?: string | null;
  conditions?: string | null;
  client: Client;
  lignes: Ligne[];
}

function clientName(c: Client) {
  return c.type === "PARTICULIER"
    ? `${c.prenom || ""} ${c.nom}`.trim()
    : c.raisonSociale || c.nom;
}

function clientAddress(c: Client) {
  const parts = [
    c.adresse,
    c.adresseComplement,
    [c.codePostal, c.ville].filter(Boolean).join(" "),
  ].filter(Boolean);
  return parts.join("\n");
}

export function DevisPdfTemplate({ devis }: { devis: DevisPdfData }) {
  const lignes = [...devis.lignes].sort((a, b) => a.ordre - b.ordre);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>DEVIS</Text>
          <View style={s.devisInfo}>
            <Text style={s.numero}>{devis.numero}</Text>
            <View style={s.infoRow}>
              <Text style={s.label}>Date :</Text>
              <Text style={s.value}>{DATE(devis.dateCreation)}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.label}>Valable jusqu'au :</Text>
              <Text style={s.value}>{DATE(devis.dateValidite)}</Text>
            </View>
          </View>
        </View>

        {/* Client */}
        <View style={s.clientBlock}>
          <Text style={s.clientTitle}>Adressé à</Text>
          <Text style={s.clientName}>{clientName(devis.client)}</Text>
          {clientAddress(devis.client) ? (
            <Text style={s.clientDetail}>{clientAddress(devis.client)}</Text>
          ) : null}
          {devis.client.email ? (
            <Text style={s.clientDetail}>{devis.client.email}</Text>
          ) : null}
          {devis.client.telephone ? (
            <Text style={s.clientDetail}>{devis.client.telephone}</Text>
          ) : null}
        </View>

        {/* Table header */}
        <View style={s.tableHeader}>
          <Text style={s.colDesc}>Description</Text>
          <Text style={s.colQty}>Qté</Text>
          <Text style={s.colPU}>PU HT</Text>
          <Text style={s.colTVA}>TVA</Text>
          <Text style={s.colTotal}>Total HT</Text>
        </View>

        {/* Table rows */}
        {lignes.map((ligne, i) => (
          <View key={i} style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}>
            <Text style={s.colDesc}>{ligne.description}</Text>
            <Text style={s.colQty}>{ligne.quantite}</Text>
            <Text style={s.colPU}>{EUR.format(ligne.prixUnitaireHT)}</Text>
            <Text style={s.colTVA}>{ligne.tauxTVA}%</Text>
            <Text style={s.colTotal}>{EUR.format(ligne.totalHT)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totalsSection}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total HT</Text>
            <Text style={s.totalValue}>{EUR.format(devis.totalHT)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total TVA</Text>
            <Text style={s.totalValue}>{EUR.format(devis.totalTVA)}</Text>
          </View>
          <View style={s.totalTTCRow}>
            <Text style={s.totalTTCLabel}>Total TTC</Text>
            <Text style={s.totalTTCValue}>{EUR.format(devis.totalTTC)}</Text>
          </View>
        </View>

        {/* Conditions */}
        {devis.conditions ? (
          <View style={s.footer}>
            <Text style={s.footerTitle}>Conditions commerciales</Text>
            <Text style={s.footerText}>{devis.conditions}</Text>
          </View>
        ) : null}

        {/* Notes */}
        {devis.notes ? (
          <View style={[s.footer, { marginTop: devis.conditions ? 12 : 32 }]}>
            <Text style={s.footerTitle}>Notes</Text>
            <Text style={s.footerText}>{devis.notes}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
