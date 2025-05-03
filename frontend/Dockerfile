FROM node:lts-slim AS production
WORKDIR /app/frontend
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
CMD [ "npm", "run", "preview"]


FROM node:lts-slim AS development
WORKDIR /app/frontend
COPY package*.json .
RUN npm install
COPY . .
CMD [ "npm", "run", "dev"]

FROM node:lts-slim AS eval
WORKDIR /app/frontend
COPY package*.json .
RUN npm install
COPY . .
CMD [ "npm", "run", "eval"]