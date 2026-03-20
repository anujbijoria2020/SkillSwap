FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skillswap_db"

RUN npx prisma generate

RUN npm run build

# Correct path — generated lives in src/, dist/ expects it at same relative location
RUN cp -r /app/src/generated /app/dist/generated

EXPOSE 3000

CMD ["node", "dist/app.js"]