import { cookies } from "next/headers";
import { prisma } from "./db";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "session_token";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 jours

export async function createSession(userId: string) {
  // 1. Générer un token unique
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // 2. Sauvegarder la session dans la base de données
  const session = await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  // 3. Stocker le token dans un cookie HTTP-only sécurisé
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return session;
}

export async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  // Chercher la session dans la base de données
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  // Vérifier si la session est expirée
  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  // (Optionnel) Rafraîchir la session si elle est proche de l'expiration
  // ...

  return {
    session,
    user: session.user,
  };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { token },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
