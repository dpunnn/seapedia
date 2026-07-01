# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

ENV NEXT_PUBLIC_API_URL=http://localhost:5000/api

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
