# Backend for migrating assets from Moralis based chains to Immutable zkEVM

This project is a backend for catching webhook events from Moralis based chains and minting assets on Immutable's zkEVM. It uses the Immutable Minting API to ensure that minting is sponsored & transaction life cycle monitoring, nonce management etc. is abstracted. Frontend available here: <https://github.com/ZacharyCouchman/imx-examples-react>.

## Disclaimer

The sample code provided is for reference purposes only and is not officially supported by Immutable. It has undergone best effort testing by Immutable to ensure basic functionality. However, it is essential that you thoroughly test this sample code within your own environment to confirm its functionality and reliability before deploying it in a production setting. Immutable disclaims any liability for any issues that arise due to the use of this sample code. By using this sample code, you agree to perform due diligence in testing and verifying its suitability for your applications.

## Features

- Uses the Immutable Minting API to ensure that minting is sponsored & transaction life cycle monitoring, nonce management etc. is abstracted.
- Catches webhook burn events from Moralis, this means that all [Moralis chains](https://moralis.io/chains/) are supported as source chains.
- Supports address mapping where the address on the source chain is different from the address on the destination chain.
- Updates the database with success/failure events from the Immutable APIs to keep track of the minting status.
- Provides an endpoint for the frontend so the same Moralis API key can be used both on the frontend and the backend.

## Setup Instructions with Docker(recommended)

1. Clone the repository:
   ```
   git clone <repository_url>
   cd <repository_directory>
   ```
2. Install the dependencies:
   ```
   npm i
   ```
3. Copy the example environment file and fill it with your configuration details, and DB path(should be `file:./tokens.db`):
   ```
   cp .env.example .env
   ```
4. Start the docker container in detached mode, this will start the Fastify server, the docker compose is structure such that the `.env` file and the `tokens.db` file are mounted into the container:
   ```
   docker compose up -d
   ```

## Setup Instructions without Docker

1. Clone the repository:
   ```
   git clone <repository_url>
   cd <repository_directory>
   ```
2. Install the dependencies:
   ```
   npm i
   ```
3. Copy the example environment file and fill it with your configuration details, and DB path(should be `file:./tokens.db`):
   ```
   cp .env.example .env
   ```
4. Run the DB migrations, you can check your database with https://sqlitebrowser.org or by running `npx prisma studio`:
   ```
   npx prisma migrate dev
   ```
5. Run the development server:
   ```
   npm start
   ```
6. Create your webhook at https://hub.immutable.com/, use localtunnel for testing webhooks locally:

   ```
   npx localtunnel --port 3000
   ```

   Use the above URL for the webhook endpoint with the path `/webhook`. For example: `https://ten-rooms-vanish.loca.lt/webhook`.

## To-Do List

- [ ] Add ERC1155 support once the minting API is ready

## Tech Stack

- Fastify
- Prisma ORM
- sqlite3
