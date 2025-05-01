import { prisma } from "@/lib/prisma";

/**
 * Verifies if a user is the admin (creator) of a group
 * @param groupId The ID of the group to check
 * @param userId The ID of the user to verify
 * @returns Promise<boolean> True if the user is the admin, false otherwise
 */
export async function verifyGroupAdmin(
  groupId: string,
  userId: string
): Promise<boolean> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { creatorId: true },
  });

  return group?.creatorId === userId;
}

/**
 * Verifies if a user is a member of a group
 * @param groupId The ID of the group to check
 * @param userId The ID of the user to verify
 * @returns Promise<boolean> True if the user is a member, false otherwise
 */
export async function verifyGroupMember(
  groupId: string,
  userId: string
): Promise<boolean> {
  // First check if user is the creator
  const isAdmin = await verifyGroupAdmin(groupId, userId);
  if (isAdmin) return true;

  // If not creator, check if user is a member
  const member = await prisma.member.findFirst({
    where: {
      groupId,
      userId,
    },
  });

  return !!member;
}
