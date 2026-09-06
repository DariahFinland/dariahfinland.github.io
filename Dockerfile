# Dockerfile
#
# Adapted from the original Payload project's Dockerfile (proven to work on
# Rahti) -- same multi-stage structure and OpenShift arbitrary-UID handling,
# swapped for pnpm + Astro's Node adapter instead of npm + Next.js standalone.

FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build
# pagefind indexes the prerendered HTML output. Under the Node adapter,
# that's dist/client/ (not plain dist/ like the old static-output build) --
# this is set in the build script itself (see package.json), noted here
# since it's an easy thing to get wrong when adapting from the old config.

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# OpenShift runs as an arbitrary UID -- group write access needed
RUN chown -R node:node /app && chmod -R g+w /app

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json

EXPOSE 3000
ENV PORT=3000
ENV HOST="0.0.0.0"

USER node
CMD ["node", "./dist/server/entry.mjs"]