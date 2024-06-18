// Import necessary libraries and modules
const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");
import { FastifyReply, FastifyRequest } from "fastify";
import serverConfig, { IMX_JWT_KEY_URL, environment } from "./config";
import { mintByMintingAPI } from "./minting";
import { verifyPassportToken, decodePassportToken, verifySNSSignature } from "./utils";
import { addTokenMinted, updateUUIDStatus } from "./database";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import logger from "./logger";
import { ExtendedMintPhase, eoaMintRequest } from "./types";
import { recoverMessageAddress, verifyMessage, isAddress } from "viem";
import { ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";
import { Prisma } from "@prisma/client";
import { error } from "console";
import Moralis from "moralis";

// Initialize Prisma Client for database interactions
const prisma = new PrismaClient();
let jwk: string;

//start Moralis
Moralis.start({
  apiKey: process.env.MORALIS_API_KEY,
});

// Define the metadata for the NFT
const metadata = serverConfig[environment].metadata;

// Enable CORS with specified options for API security and flexibility
fastify.register(cors, {
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE"], // Supported HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed HTTP headers
});

if (serverConfig[environment].enableAddressMapping) {
  fastify.post("/address-mapping", async (request: any, reply: any) => {
    const { body } = request;

    let { originWalletAddress, destinationWalletAddress, signature } = body;

    originWalletAddress = originWalletAddress.toLowerCase();
    let passportWalletAddress: string;

    const authorizationHeader = request.headers["authorization"];

    // Signature is present check
    if (!signature) {
      return reply.status(400).send({ error: "Signature is required" });
    }

    // Check if the authorization header is present
    if (!authorizationHeader) {
      logger.warn("Missing authorization header");
      reply.status(401).send({ error: "Missing authorization header" });
      return;
    }

    // Remove 'Bearer ' prefix and verify the ID token
    const idToken = authorizationHeader.replace("Bearer ", "");
    try {
      await verifyPassportToken(idToken, jwk);
      logger.debug("ID token verified successfully");
      const decodedToken = await decodePassportToken(idToken);
      passportWalletAddress = decodedToken.payload.passport.zkevm_eth_address.toLowerCase();
    } catch (error) {
      logger.error(`Error verifying ID token: ${error}`);
      reply.status(401).send({ error: "Invalid ID token" });
      return;
    }

    const message = `${serverConfig[environment].eoaAddressMappingMessage}${passportWalletAddress}`;

    // Verify the recovered address with the message and signature
    try {
      const verified = await verifyMessage({ address: originWalletAddress, message, signature });
      if (!verified) {
        logger.warn(`Signature verification failed: ${error}`);
        reply.status(401).send({ error: "Invalid signature." });
        return;
      }
    } catch (error) {
      logger.warn(`Signature verification failed: ${error}`);
      reply.status(401).send({ error: "Invalid signature." });
      return;
    }

    try {
      await prisma.addressMappings.create({
        data: {
          originWalletAddress: body.originWalletAddress.toLowerCase(),
          destinationWalletAddress: passportWalletAddress,
        },
      });

      // Send a success response to the client
      reply.status(200).send({ success: true, message: "Address mapping created successfully." });
    } catch (error) {
      // Determine the error type and respond accordingly
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        // Handle unique constraint violation
        logger.error(`Unique constraint failed for address: ${error}`);
        reply.status(401).send({ error: "Unauthorized: Address has already been mapped." });
      } else {
        // Log the error that caused the transaction to fail
        logger.error(`Error during mapping process: ${error}`);

        // Send a general error response to the client
        reply.status(500).send({ error: `Failed to map address: ${error}` });
      }
    }
  });
}

fastify.get("/wallet-nfts/:address/token/:tokenAddress", async (request: FastifyRequest, reply: any) => {
  try {
    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: (request.params as any).address,
      chain: serverConfig[environment].originChainId,
      tokenAddresses: [(request.params as any).tokenAddress],
    });

    reply.send(response.result);
  } catch (err: any) {
    console.error(err);
    reply.status(500).send({ error: err.message });
  }
});

fastify.post("/event-webhook", async (request: any, reply: any) => {
  const { headers, body } = request;

  await Moralis.Streams.verifySignature({
    body,
    signature: headers["x-signature"],
  });

  const transfers = body.nftTransfers;

  for (const transfer of transfers) {
    let { from: walletAddress, to, tokenId, transactionHash, contract } = transfer;

    to = to.toLowerCase();

    logger.info(`Received NFT transfer to ${to} from ${walletAddress} with tokenId ${tokenId} and transactionHash ${transactionHash}`);
    if (to !== serverConfig[environment].burnAddress.toLowerCase()) {
      logger.info("NFT transfer not to burn address. Skipping...");
      continue;
    }

    // Conduct transactional operations related to minting
    const uuid = uuidv4();
    logger.info(`Attempting to mint NFT to wallet address ${walletAddress} with UUID ${uuid}`);
    try {
      let destinationWalletAddress: string = walletAddress;

      if (serverConfig[environment].enableAddressMapping) {
        const mapping = await prisma.addressMappings.findUnique({
          where: {
            originWalletAddress: walletAddress,
          },
        });

        if (mapping && mapping.destinationWalletAddress) {
          destinationWalletAddress = mapping.destinationWalletAddress;
        } else {
          logger.error(`No destination address found for ${walletAddress}`);
          continue;
        }
      }
      // // Record the minting operation in the database
      await addTokenMinted(true, false, transactionHash, null, uuid, parseInt(tokenId), parseInt(tokenId), walletAddress, to, destinationWalletAddress, "pending", prisma);

      mintByMintingAPI(serverConfig[environment].destinationCollectionAddress, destinationWalletAddress, tokenId, uuid, metadata)
        .then(() => {
          logger.info("Minting API call successful.");
        })
        .catch((apiError) => {
          logger.error(`Minting API call failed for ${walletAddress} and ${uuid}: ${apiError}`);
        });
    } catch (error) {
      // Determine the error type and respond accordingly
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        // Handle unique constraint violation
        logger.error(`Unique constraint failed for address: ${error}`);
        reply.status(401).send({ error: "Unauthorized: Duplicate entry for address" });
      } else {
        // Log the error that caused the transaction to fail
        logger.error(`Error during minting process: ${error}`);

        // Send a general error response to the client
        reply.status(500).send({ error: `Failed to process mint request: ${error}` });
      }
    }
  }
  // Log the received webhook
  fastify.log.debug(`Received webhook: ${JSON.stringify(request.body, null, 2)}`);
  reply.status(200).send({});
});

fastify.post("/imx-webhook", async (request: any, reply: any) => {
  console.log(request);
  const { Type, SubscribeURL, TopicArn, Message, MessageId, Timestamp, Signature, SigningCertURL } = request.body;
  logger.debug(`Received webhook: ${JSON.stringify(request.body, null, 2)}`);

  if (Type === "SubscriptionConfirmation") {
    const allowedTopicArnPrefix = serverConfig[environment].allowedTopicArn.replace("*", "");

    if (TopicArn.startsWith(allowedTopicArnPrefix)) {
      try {
        const isValid = await verifySNSSignature(request.body);

        if (isValid) {
          const response = await axios.get(SubscribeURL);
          if (response.status === 200) {
            logger.info("Webhook subscription confirmed successfully");
          } else {
            logger.error("Failed to confirm webhook subscription");
          }
        } else {
          logger.warn("Invalid signature. Subscription confirmation denied.");
        }
      } catch (error) {
        logger.error(`Error confirming webhook subscription: ${JSON.stringify(error, null, 2)}`);
      }
    } else {
      logger.warn("Received subscription confirmation from an unknown TopicArn:", TopicArn);
    }

    reply.send({ status: "ok" });
  }

  if (Type === "Notification") {
    try {
      const isValid = await verifySNSSignature(request.body);
      if (isValid) {
        const message = JSON.parse(Message);
        const { event_name } = message;
        const { reference_id, token_id, status, owner_address } = message.data;
        if (event_name === "imtbl_zkevm_mint_request_updated") {
          logger.info("Received mint request update notification:");
          console.log(message);
          if (status === "succeeded") {
            logger.info(`Mint request ${reference_id} succeeded for owner address ${owner_address}`);
            updateUUIDStatus(reference_id, "succeeded", prisma);
          } else if (status === "pending") {
            logger.debug(`Mint request ${reference_id} is pending`);
          } else if (status === "failed") {
            logger.warn(`Mint request ${reference_id} failed for owner address ${owner_address}`);
            updateUUIDStatus(reference_id, "failed", prisma);
          }
        } else {
          logger.warn("Received notification for an unknown event:");
        }
      } else {
        logger.warn("Invalid signature. Notification denied.");
      }
    } catch (error) {
      logger.error(`Error processing notification: ${JSON.stringify(error, null, 2)}`);
    }
    reply.send({ status: "ok" });
  }
});

// Start the server
const start = async () => {
  try {
    try {
      const response = await axios.get(IMX_JWT_KEY_URL);
      const jwks = response.data;
      jwk = jwks.keys[0];
    } catch (error) {
      logger.error(`Error fetching JWKs: ${error}`);
      throw error;
    }
    // if (!checkConfigValidity(serverConfig[environment])) {
    //   throw new Error("Invalid server configuration. Exiting.");
    // }
    logger.info(`Attempting to start on IP ${serverConfig[environment].HOST_IP} and port ${serverConfig[environment].PORT}...`);

    await fastify.listen({
      port: serverConfig[environment].PORT,
      host: serverConfig[environment].HOST_IP,
    });

    logger.info(`Server started successfully on port ${serverConfig[environment].PORT}.`);
  } catch (err) {
    logger.error(`Error starting server: ${err}`);
    // Optionally, you might want to handle specific errors differently here
    process.exit(1);
  }
};

start();
