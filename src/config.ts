import { config } from "@imtbl/sdk";
import { ServerConfig } from "./types";
require("dotenv").config();

// Ternary operator to set environment based on .env value
export const environment = process.env.ENVIRONMENT === "PRODUCTION" ? config.Environment.PRODUCTION : config.Environment.SANDBOX;

// Used for verification of the Passport JWTs
export const IMX_JWT_KEY_URL = "https://auth.immutable.com/.well-known/jwks.json?_gl=1*1g7a0qs*_ga*NDg1NTg3MDI3LjE2ODU1OTY1Mzg.*_ga_4JBHZ7F06X*MTY4ODUyNjkyNy4xNC4wLjE2ODg1MjY5MjcuMC4wLjA.*_ga_7XM4Y7T8YC*MTY4ODUyNjkyNy4yNy4wLjE2ODg1MjY5MjcuMC4wLjA.";

const serverConfig: ServerConfig = {
  [config.Environment.SANDBOX]: {
    API_URL: "https://api.sandbox.immutable.com",
    HUB_API_KEY: process.env.SANDBOX_HUB_IMMUTABLE_API_KEY!,
    RPS_API_KEY: process.env.SANDBOX_RPS_IMMUTABLE_API_KEY!,
    WEBHOOK_SECRET: process.env.SANDBOX_WEBHOOK_SECRET!,
    HOST_IP: process.env.SANDBOX_HOST_IP!,
    PORT: parseInt(process.env.SANDBOX_PORT!, 10),
    originChainId: process.env.SANDBOX_ORIGIN_CHAIN!,
    originCollectionAddress: process.env.SANDBOX_ORIGIN_COLLECTION_ADDRESS!,
    destinationChainId: process.env.SANDBOX_DESTINATION_CHAIN!,
    destinationCollectionAddress: process.env.SANDBOX_DESTINATION_COLLECTION_ADDRESS!,
    burnAddress: "0x000000000000000000000000000000000000dEaD",
    destinationChain: "imtbl-zkevm-testnet",
    mintRequestURL: (chainName: string, collectionAddress: string, referenceId: string) => `https://api.sandbox.immutable.com/v1/chains/${chainName}/collections/${collectionAddress}/nfts/mint-requests/${referenceId}`,
    enableWebhookVerification: true, // Should the server verify the webhook SNS messages?
    allowedTopicArn: "arn:aws:sns:us-east-2:783421985614:*", // Used for webhook SNS verification
    enableFileLogging: true, // Should logs be output to files or just console?
    enableAddressMapping: true,
    eoaAddressMappingMessage: "I want to map my EOA address to my Passport address. Here is my Passport adddress: ",
    logLevel: "debug",
    metadata: {
      name: "Copy Pasta - Can the devs do something?",
      description:
        "ok I need PRICE TO GO UP. like VERY SOON. I cant take this anymore. every day I am checking price and it is staying the same. every day, check price, same price. I cant take this anymore, I have over invested, by a lot. it is what it is. but I need the price to GO UP ALREADY. can devs DO SOMETHING??",
      image: "https://emerald-variable-swallow-254.mypinata.cloud/ipfs/QmNYn1DS9djwCLCcu7Pyrb6uUtGzf29AH6cBcXAncELeik/1.png",
      attributes: [],
    },
  },
  [config.Environment.PRODUCTION]: {
    API_URL: "https://api.immutable.com",
    HUB_API_KEY: process.env.MAINNET_HUB_IMMUTABLE_API_KEY!,
    RPS_API_KEY: process.env.MAINNET_RPS_IMMUTABLE_API_KEY!,
    WEBHOOK_SECRET: process.env.MAINNET_WEBHOOK_SECRET!,
    HOST_IP: process.env.MAINNET_HOST_IP!,
    PORT: parseInt(process.env.MAINNET_PORT!, 10),
    originChainId: process.env.MAINNET_ORIGIN_CHAIN!,
    originCollectionAddress: process.env.MAINNET_ORIGIN_COLLECTION_ADDRESS!,
    destinationChainId: process.env.MAINNET_DESTINATION_CHAIN!,
    destinationCollectionAddress: process.env.MAINNET_DESTINATION_COLLECTION_ADDRESS!,
    burnAddress: "0x000000000000000000000000000000000000dEaD",
    destinationChain: "imtbl-zkevm-mainnet",
    mintRequestURL: (chainName: string, collectionAddress: string, referenceId: string) => `https://api.immutable.com/v1/chains/${chainName}/collections/${collectionAddress}/nfts/mint-requests/${referenceId}`,
    enableWebhookVerification: true, // Should the server verify the webhook SNS messages?
    allowedTopicArn: "arn:aws:sns:us-east-2:362750628221:*", // Used for webhook SNS verification
    enableFileLogging: true, // Should logs be output to files or just console?
    enableAddressMapping: true,
    eoaAddressMappingMessage: "I want to map my EOA address to my Passport address. Here is my Passport adddress: ",
    logLevel: "debug",
    metadata: {
      name: "Copy Pasta - Can the devs do something?",
      description:
        "ok I need PRICE TO GO UP. like VERY SOON. I cant take this anymore. every day I am checking price and it is staying the same. every day, check price, same price. I cant take this anymore, I have over invested, by a lot. it is what it is. but I need the price to GO UP ALREADY. can devs DO SOMETHING??",
      image: "https://emerald-variable-swallow-254.mypinata.cloud/ipfs/QmNYn1DS9djwCLCcu7Pyrb6uUtGzf29AH6cBcXAncELeik/1.png",
      attributes: [],
    },
  },
};

export default serverConfig;
