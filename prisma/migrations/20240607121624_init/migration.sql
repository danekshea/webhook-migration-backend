-- CreateTable
CREATE TABLE "Token" (
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
CREATE UNIQUE INDEX "Token_originTokenId_key" ON "Token"("originTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_destinationTokenId_key" ON "Token"("destinationTokenId");
