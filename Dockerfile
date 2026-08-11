# syntax=docker/dockerfile:1

# --- build stage: compile the Next.js app ---
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# This project has no public/ directory (App Router serves its only
# static asset, favicon.ico, from app/) - the runtime stage's COPY
# --from=build /app/public below needs the directory to exist even
# empty, or the build fails with "not found".
RUN mkdir -p public
RUN npm run build

# --- runtime stage: standalone server output only, no dev deps ---
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
