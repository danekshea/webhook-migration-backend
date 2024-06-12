-- CreateTable
CREATE TABLE "AddressMappings" (
    "originWalletAddress" TEXT NOT NULL,
    "destinationWalletAddress" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AddressMappings_originWalletAddress_key" ON "AddressMappings"("originWalletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "AddressMappings_destinationWalletAddress_key" ON "AddressMappings"("destinationWalletAddress");
