/*
  Warnings:

  - You are about to drop the column `minted` on the `Tokens` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tokens" (
    "burned" BOOLEAN NOT NULL,
    "burnEVMTransactionHash" TEXT NOT NULL,
    "mintEVMTransactionHash" TEXT,
    "mintUUID" TEXT NOT NULL,
    "originTokenId" INTEGER NOT NULL,
    "destinationTokenId" INTEGER NOT NULL,
    "fromOriginWalletAddress" TEXT NOT NULL,
    "toOriginWalletAddress" TEXT,
    "toDestinationWalletAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL
);
INSERT INTO "new_Tokens" ("burnEVMTransactionHash", "burned", "destinationTokenId", "fromOriginWalletAddress", "mintEVMTransactionHash", "mintUUID", "originTokenId", "status", "toDestinationWalletAddress", "toOriginWalletAddress") SELECT "burnEVMTransactionHash", "burned", "destinationTokenId", "fromOriginWalletAddress", "mintEVMTransactionHash", "mintUUID", "originTokenId", "status", "toDestinationWalletAddress", "toOriginWalletAddress" FROM "Tokens";
DROP TABLE "Tokens";
ALTER TABLE "new_Tokens" RENAME TO "Tokens";
CREATE UNIQUE INDEX "Tokens_originTokenId_key" ON "Tokens"("originTokenId");
CREATE UNIQUE INDEX "Tokens_destinationTokenId_key" ON "Tokens"("destinationTokenId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
