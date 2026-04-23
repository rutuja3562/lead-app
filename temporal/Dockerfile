FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npx", "ts-node", "src/workers/lead.worker.ts"]
