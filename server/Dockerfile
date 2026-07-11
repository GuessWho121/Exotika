# Stage 1: Build compilation
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl libc6-compat

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime dependencies
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 8080

CMD ["node", "dist/server.js"]
