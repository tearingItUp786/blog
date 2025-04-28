# Taran's Personal Blog

## Overview

It's my blog, yo.

## Tech Stack

- **Frontend**: Remix (React framework)
- **Package Manager**: pnpm
- **Background Jobs**: Inngest
- **Caching**: Redis
- **Deployment**: Fly.io

## Prerequisites

Before getting started, ensure you have the following installed:

### Required Tools

- [Node.js](https://nodejs.org/) (managed by Volta)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Chromium](https://www.chromium.org/)

### Optional but Recommended

- [Volta](https://volta.sh/) (Node version management)
- [Dotenv Vault](https://www.dotenv.org/docs/security/vault.html)

## Local Development Setup

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Set Up Environment Variables**

   ```bash
   npx dotenv-vault pull
   ```

3. **Start Services**

   - Start Redis (via Docker Compose):
     ```bash
     docker-compose up -d
     ```
   - Start Inngest Development Server:
     ```bash
     npx inngest-cli@latest dev
     ```

4. **Run Development Server**

   ```bash
   pnpm dev
   ```

   The development server will be available at `http://localhost:8080`

## Available Scripts

- `pnpm dev`: Start the development server
- `pnpm clean`: Remove build artifacts
- `npx dotenv-vault pull`: Fetch latest environment secrets
- `npx inngest-cli@latest dev`: Start Inngest background job server

## Deployment

The application is deployed on Fly.io. The default port is set to 8080 to align
with Fly.io's preferences.
