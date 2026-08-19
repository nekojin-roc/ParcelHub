FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npx tsc

ENV NODE_ENV=production
EXPOSE 3001
CMD ["sh", "-c", "npm run db:migrate:deploy && exec npm start"]
