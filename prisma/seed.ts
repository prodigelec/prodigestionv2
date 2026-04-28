import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import bcrypt from 'bcryptjs';
import { TypeClient, StatutClient } from '../src/generated/prisma';
import { encryptSensitiveData } from '../src/app/lib/encryption';

async function main() {
  // Dynamically import prisma so that env variables are loaded first
  const { prisma } = await import('../src/app/lib/db');
  
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans le fichier .env');
  }
  
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
    },
    create: {
      email,
      passwordHash,
    },
  });

  console.log(`Utilisateur admin vérifié : ${user.email}`);

  // --- Création de clients de test ---
  console.log("Création de clients de démonstration...");

  const clientsToCreate: any[] = [];

  const prenoms = ["Jean", "Marie", "Pierre", "Sophie", "Luc", "Julie", "Marc", "Claire", "Paul", "Emma", "Thomas", "Laura", "Nicolas", "Céline", "Antoine"];
  const noms = ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefevre", "Leroy", "Roux"];
  const villes = ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Montpellier", "Strasbourg", "Bordeaux", "Lille"];

  // Fonction pour générer un numéro de téléphone aléatoire
  const genTel = () => `0${Math.floor(Math.random() * 5) + 1}${Math.floor(Math.random() * 90 + 10)}${Math.floor(Math.random() * 90 + 10)}${Math.floor(Math.random() * 90 + 10)}${Math.floor(Math.random() * 90 + 10)}`;
  const genPortable = () => `0${Math.random() > 0.5 ? '6' : '7'}${Math.floor(Math.random() * 90 + 10)}${Math.floor(Math.random() * 90 + 10)}${Math.floor(Math.random() * 90 + 10)}${Math.floor(Math.random() * 90 + 10)}`;

  // Générer 20 clients
  for (let i = 1; i <= 20; i++) {
    const typeRandom = Math.random();
    let type: TypeClient = TypeClient.PARTICULIER;
    
    // Répartition : 40% Particulier, 30% Entreprise, 15% Syndic, 10% Agence, 5% Autre
    if (typeRandom > 0.95) type = TypeClient.AUTRE;
    else if (typeRandom > 0.85) type = TypeClient.AGENCE_IMMOBILIERE;
    else if (typeRandom > 0.7) type = TypeClient.SYNDIC;
    else if (typeRandom > 0.4) type = TypeClient.ENTREPRISE;

    const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
    const nom = noms[Math.floor(Math.random() * noms.length)];
    const ville = villes[Math.floor(Math.random() * villes.length)];
    const codePostal = `${Math.floor(Math.random() * 89 + 10)}000`;

    const baseData = {
      userId: user.id,
      type,
      ville,
      codePostal,
      adresse: `${Math.floor(Math.random() * 100 + 1)} rue de la Paix`,
      telephone: Math.random() > 0.3 ? genTel() : null,
      telephonePortable: Math.random() > 0.2 ? genPortable() : null,
      statut: Math.random() > 0.7 ? StatutClient.PROSPECT : (Math.random() > 0.8 ? StatutClient.INACTIF : StatutClient.CLIENT),
    };

    if (type === TypeClient.PARTICULIER) {
      clientsToCreate.push({
        ...baseData,
        nom,
        prenom,
        email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@example.com`,
      });
    } else {
      // Pour les professionnels
      const prefix = type === TypeClient.ENTREPRISE ? "Entreprise" : (type === TypeClient.SYNDIC ? "Syndic" : "Agence");
      const raisonSociale = `${prefix} ${nom} & Co`;
      
      clientsToCreate.push({
        ...baseData,
        nom: raisonSociale,
        raisonSociale,
        email: `contact@${nom.toLowerCase()}-${prefix.toLowerCase()}.fr`,
        siret: `123456789000${Math.floor(Math.random() * 90 + 10)}`,
        interlocuteurNomComplet: `${prenom} ${nom}`,
        interlocuteurEmail: `${prenom.toLowerCase()}@${nom.toLowerCase()}-${prefix.toLowerCase()}.fr`,
        interlocuteurPortable: genPortable(),
        typeAutre: type === TypeClient.AUTRE ? "Association" : null
      });
    }
  }

  // Nettoyer la table existante (Optionnel, à décommenter si besoin)
  // await prisma.client.deleteMany({ where: { userId: user.id } });

  for (const clientData of clientsToCreate) {
    // Chiffrer les données sensibles avant l'insertion
    const encryptedData = encryptSensitiveData(clientData);

    await prisma.client.create({
      data: encryptedData as any,
    });
  }

  console.log(`✅ ${clientsToCreate.length} clients ont été créés avec succès !`);

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });