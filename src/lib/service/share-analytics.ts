"use server";

import { prisma } from "@/database/prisma";
import { ComponentType, ShareRecord } from "../types/neon";
import { createShareReferenceId } from "./share";
import { createId } from "@paralleldrive/cuid2";

export async function createShare(
  userId: string,
  componentId: string,
  componentType: ComponentType
): Promise<string> {
  const referenceId = createShareReferenceId();

  await prisma.share.create({
    data: {
      id: createId(),
      userId,
      referenceId,
      componentId,
      componentType,
    },
  });

  return referenceId;
}

export async function getShareByReferenceId(
  referenceId: string
): Promise<ShareRecord | null> {
  const share = await prisma.share.findUnique({ where: { referenceId } });
  return share as ShareRecord | null;
}

export async function incrementShareAccess(referenceId: string): Promise<void> {
  await prisma.share.update({
    where: { referenceId },
    data: {
      accessCount: { increment: 1 },
      lastAccessedAt: new Date(),
    },
  });
}
