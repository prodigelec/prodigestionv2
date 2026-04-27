import crypto from "crypto";
import { setSessionCookie, getSessionCookie, deleteSessionCookie } from "./cookies";
import { insertSession, findSessionWithUserByToken, deleteSessionById, deleteSessionByToken } from "./database";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 jours

export async function createSession(userId: string) {
  // 1. Générer un token unique
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // 2. Sauvegarder la session dans la base de données
  const session = await insertSession(userId, token, expiresAt);

  // 3. Stocker le token dans un cookie HTTP-only sécurisé
  await setSessionCookie(token, expiresAt);

  return session;
}

export async function verifySession() {
  // 1. Récupérer le token depuis les cookies
  const token = await getSessionCookie();

  if (!token) {
    return null;
  }

  // 2. Chercher la session dans la base de données
  const session = await findSessionWithUserByToken(token);

  if (!session) {
    return null;
  }

  // 3. Vérifier si la session est expirée
  if (Date.now() >= session.expiresAt.getTime()) {
    await deleteSessionById(session.id);
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
  // 1. Récupérer le token actuel
  const token = await getSessionCookie();

  // 2. Supprimer la session de la base de données
  if (token) {
    await deleteSessionByToken(token);
  }

  // 3. Supprimer le cookie
  await deleteSessionCookie();
}
