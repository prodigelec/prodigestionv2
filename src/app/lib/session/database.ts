import { prisma } from "@/app/lib/db";

export async function insertSession(userId: string, token: string, expiresAt: Date) {
  return await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
}

export async function findSessionWithUserByToken(token: string) {
  return await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
}

export async function deleteSessionById(id: string) {
  return await prisma.session.delete({
    where: { id },
  });
}

export async function deleteSessionByToken(token: string) {
  return await prisma.session.deleteMany({
    where: { token },
  });
}
