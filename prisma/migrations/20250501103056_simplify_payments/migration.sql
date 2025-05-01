/*
  Warnings:

  - You are about to drop the column `amount` on the `Payment` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "scheduledDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "memberId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    CONSTRAINT "Payment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("createdAt", "groupId", "id", "isPaid", "memberId", "scheduledDate", "updatedAt") SELECT "createdAt", "groupId", "id", "isPaid", "memberId", "scheduledDate", "updatedAt" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE INDEX "Payment_groupId_idx" ON "Payment"("groupId");
CREATE INDEX "Payment_scheduledDate_idx" ON "Payment"("scheduledDate");
CREATE UNIQUE INDEX "Payment_memberId_scheduledDate_key" ON "Payment"("memberId", "scheduledDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
