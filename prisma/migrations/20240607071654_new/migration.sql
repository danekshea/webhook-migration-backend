/*
  Warnings:

  - You are about to drop the `Mints` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Mints";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Token" (
    "burned" BOOLEAN NOT NULL,
    "minted" BOOLEAN NOT NULL,
    "originChain" INTEGER NOT NULL,
    "destinationChain" INTEGER NOT NULL,
    "originBlockNumber" INTEGER NOT NULL,
    "burnTimestamp" DATETIME NOT NULL,
    "burnEVMTransactionHash" TEXT NOT NULL,
    "mintEVMTransactionHash" TEXT,
    "mintUUID" TEXT NOT NULL,
    "originCollectionAddress" TEXT NOT NULL,
    "destinationCollectionAddress" TEXT NOT NULL,
    "originTokenId" INTEGER NOT NULL,
    "destinationTokenId" INTEGER NOT NULL,
    "fromOriginWalletAddress" TEXT NOT NULL,
    "toOriginWalletAddress" TEXT,
    "toDestinationWalletAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_originTokenId_key" ON "Token"("originTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_destinationTokenId_key" ON "Token"("destinationTokenId");
