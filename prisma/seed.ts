import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import bcrypt from 'bcryptjs';

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

  console.log(`Utilisateur créé ou mis à jour avec succès : ${user.email}`);
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
