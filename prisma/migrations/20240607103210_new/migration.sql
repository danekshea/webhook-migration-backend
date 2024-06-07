/*
  Warnings:

  - You are about to drop the column `burnTimestamp` on the `Token` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Token" (
    "burned" BOOLEAN NOT NULL,
    "minted" BOOLEAN NOT NULL,
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
INSERT INTO "new_Token" ("burnEVMTransactionHash", "burned", "destinationTokenId", "fromOriginWalletAddress", "mintEVMTransactionHash", "mintUUID", "minted", "originTokenId", "status", "toDestinationWalletAddress", "toOriginWalletAddress") SELECT "burnEVMTransactionHash", "burned", "destinationTokenId", "fromOriginWalletAddress", "mintEVMTransactionHash", "mintUUID", "minted", "originTokenId", "status", "toDestinationWalletAddress", "toOriginWalletAddress" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
CREATE UNIQUE INDEX "Token_originTokenId_key" ON "Token"("originTokenId");
CREATE UNIQUE INDEX "Token_destinationTokenId_key" ON "Token"("destinationTokenId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
