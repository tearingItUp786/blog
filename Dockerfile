# --- Base with OS deps Playwright needs ---
FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g pnpm@10.5.2

# System deps required by Playwright/Chromium
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openssl wget gnupg ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    lsb-release \
  && rm -rf /var/lib/apt/lists/*

# --- Install full deps for build ---
FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
# If you use Prisma and need codegen, uncomment:
# COPY prisma ./prisma
# RUN npx prisma generate
COPY . .
RUN pnpm run build

# --- Install only prod deps for runtime ---
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# --- Final runtime image ---
FROM base

ENV NODE_ENV=production
# Where Playwright will look for browsers we install below
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

# Prod node_modules (must include `playwright` in dependencies)
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/package.json /app/package.json

# Build artifacts / static
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
# If you need other runtime files (e.g., server entry), copy them:
COPY . .

# Install Chromium browsers in the final layer so paths match at runtime
# (Slimmer than installing all browsers; rehype-mermaid only needs Chromium)
RUN pnpm exec playwright install chromium

# If you need extra fonts or locales, add them here.

CMD ["pnpm", "start"]
