/*
  Warnings:

  - You are about to drop the column `code` on the `roles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "roles_tenantId_code_idx";

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "code";

-- CreateIndex
CREATE INDEX "roles_tenantId_name_idx" ON "roles"("tenantId", "name");
