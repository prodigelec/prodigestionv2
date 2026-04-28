-- CreateEnum
CREATE TYPE "TypeClient" AS ENUM ('PARTICULIER', 'ENTREPRISE', 'SYNDIC', 'AGENCE_IMMOBILIERE', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutClient" AS ENUM ('PROSPECT', 'CLIENT', 'INACTIF', 'ARCHIVE');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "type" "TypeClient" NOT NULL DEFAULT 'PARTICULIER',
    "typeAutre" TEXT,
    "statut" "StatutClient" NOT NULL DEFAULT 'PROSPECT',
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "telephonePortable" TEXT,
    "siteWeb" TEXT,
    "adresse" TEXT,
    "adresseComplement" TEXT,
    "ville" TEXT,
    "codePostal" TEXT,
    "pays" TEXT DEFAULT 'France',
    "siret" TEXT,
    "numeroTVA" TEXT,
    "nomImmeubleOuCopropriete" TEXT,
    "contactSurPlace" TEXT,
    "telSurPlace" TEXT,
    "interlocuteurNomComplet" TEXT,
    "interlocuteurPoste" TEXT,
    "interlocuteurPortable" TEXT,
    "interlocuteurEmail" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clients_userId_idx" ON "clients"("userId");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
