"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMintStatus = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../logger"));
const axios_1 = __importDefault(require("axios"));
const config_1 = __importStar(require("../config"));
function updateMintStatus(prisma) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const pendingMints = yield prisma.tokens.findMany({
        where: {
          status: {
            not: "succeeded",
          },
        },
      });
      for (const mint of pendingMints) {
        try {
          const uuid = mint.uuid;
          const response = yield axios_1.default.get(config_1.default[config_1.environment].mintRequestURL(config_1.default[config_1.environment].chainName, config_1.default[config_1.environment].collectionAddress, uuid), {
            headers: {
              "x-immutable-api-key": config_1.default[config_1.environment].HUB_API_KEY,
              "x-api-key": config_1.default[config_1.environment].RPS_API_KEY,
            },
          });
          logger_1.default.debug(`Checking status of mint with UUID ${uuid}: ${JSON.stringify(response.data, null, 2)}`);
          if (response.data.result.length > 0) {
            if (response.data.result[0].status === "succeeded") {
              yield prisma.$transaction((prisma) =>
                __awaiter(this, void 0, void 0, function* () {
                  // Update the status of minted tokens
                  yield prisma.tokens.updateMany({
                    where: { uuid },
                    data: { status: "succeeded" },
                  });
                  // Log the successful mint
                  logger_1.default.info(`Mint with UUID ${uuid} succeeded. Updating status.`);
                })
              );
            } else if (response.data.result[0].status === "failed") {
              yield prisma.tokens.updateMany({
                where: { uuid },
                data: { status: "failed" },
              });
              logger_1.default.info(`Mint with UUID ${uuid} failed. Updating status.`);
            }
          } else {
            yield prisma.tokens.updateMany({
              where: { uuid },
              data: { status: "500" },
            });
            logger_1.default.error(`No mint found with UUID ${uuid}.`);
          }
        } catch (error) {
          logger_1.default.error(`Error processing mint with UUID ${mint.uuid}.`);
          console.log(error);
        }
      }
    } catch (error) {
      logger_1.default.error(`Error fetching pending mints: ${JSON.stringify(error, null, 2)}`);
    }
  });
}
exports.updateMintStatus = updateMintStatus;
(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    const prisma = new client_1.PrismaClient();
    yield updateMintStatus(prisma);
  }))();
