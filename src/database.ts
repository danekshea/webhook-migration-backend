import { PrismaClient, Prisma } from "@prisma/client";
import logger from "./logger";

export async function addTokenMinted(
  burned: boolean,
  minted: boolean,
  burnEVMTransactionHash: string,
  mintEVMTransactionHash: string | null,
  mintUUID: string,
  originTokenId: number,
  destinationTokenId: number,
  fromOriginWalletAddress: string,
  toOriginWalletAddress: string | null,
  toDestinationWalletAddress: string,
  status: string,
  prisma: PrismaClient
): Promise<void> {
  try {
    await prisma.tokens.create({
      data: {
        burned,
        minted,
        burnEVMTransactionHash,
        mintEVMTransactionHash,
        mintUUID,
        originTokenId,
        destinationTokenId,
        fromOriginWalletAddress,
        toOriginWalletAddress,
        toDestinationWalletAddress,
        status,
      },
    });
    logger.info(`Added minted token with UUID ${mintUUID} for destination address ${toDestinationWalletAddress}.`);
  } catch (error) {
    logger.error(`Error adding minted token with UUID ${mintUUID} for destination address ${toDestinationWalletAddress}: ${error}`);
    throw error;
  }
}

export async function updateUUIDStatus(uuid: string, status: string, prisma: PrismaClient): Promise<void> {
  try {
    await prisma.tokens.updateMany({
      where: {
        mintUUID: uuid,
      },
      data: {
        status: status,
      },
    });
    logger.info(`Updated status for UUID ${uuid} to ${status}.`);
  } catch (error) {
    logger.error(`Error updating status for UUID ${uuid}: ${error}`);
    throw error;
  }
}
