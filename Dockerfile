FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g pnpm@10.5.2

# Install system dependencies for Playwright and Prisma
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openssl \
    wget \
    gnupg \
    ca-certificates \
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

# Install all node_modules, including dev dependencies
FROM base as deps

RUN mkdir /app
WORKDIR /app

ADD package.json pnpm-lock.yaml ./
# Install dependencies including Playwright
RUN pnpm install --frozen-lockfile

# Install Playwright browsers here, in the deps stage
RUN pnpm exec playwright install chromium
RUN pnpm exec playwright install-deps chromium

# Setup production node_modules
FROM base as production-deps

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
# Copy the Playwright browsers from deps stage
COPY --from=deps /ms-playwright /ms-playwright 2>/dev/null || true
COPY --from=deps /root/.cache/ms-playwright /root/.cache/ms-playwright 2>/dev/null || true

ADD package.json pnpm-lock.yaml  ./
RUN pnpm prune --production

# Build the app
FROM base as build

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
# Copy Playwright browsers if needed during build
COPY --from=deps /ms-playwright /ms-playwright 2>/dev/null || true
COPY --from=deps /root/.cache/ms-playwright /root/.cache/ms-playwright 2>/dev/null || true

# If we're using Prisma, uncomment to cache the prisma schema
# ADD prisma .
# RUN npx prisma generate

ADD . .
RUN pnpm run build

# Finally, build the production image with minimal footprint
FROM base

ENV NODE_ENV=production

# Don't install Chromium via apt, we'll use the one from Playwright
# ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"

RUN mkdir /app
WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
# Copy Playwright browsers to final stage
COPY --from=deps /ms-playwright /ms-playwright 2>/dev/null || true
COPY --from=deps /root/.cache/ms-playwright /root/.cache/ms-playwright 2>/dev/null || true

# Set permissions for Playwright directories if they exist
RUN if [ -d "/ms-playwright" ]; then \
      chmod -R 777 /ms-playwright; \
    elif [ -d "/root/.cache/ms-playwright" ]; then \
      chmod -R 777 /root/.cache/ms-playwright; \
    else \
      echo "Playwright browser directories not found"; \
    fi

# Uncomment if using Prisma
# COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma

COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
ADD . .

CMD ["pnpm", "start"]
