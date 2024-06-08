/*
  Warnings:

  - You are about to drop the `Token` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Token";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Tokens" (
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

-- CreateIndex
CREATE UNIQUE INDEX "Tokens_originTokenId_key" ON "Tokens"("originTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Tokens_destinationTokenId_key" ON "Tokens"("destinationTokenId");
