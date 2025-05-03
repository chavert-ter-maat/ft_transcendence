FROM node:lts-slim AS production
WORKDIR /app/backend
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
CMD [ "npm", "run", "start:prod"]

FROM node:lts-slim AS development
WORKDIR /app/backend
COPY package*.json .
RUN npm install
COPY . .
CMD ["npm", "run", "start:dev", "--debug"]

FROM node:lts-slim AS eval
WORKDIR /app/backend
COPY package*.json .
RUN npm install
COPY . .
CMD ["npm", "run", "start:eval"]
