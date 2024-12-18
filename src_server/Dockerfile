FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
RUN npm install sequelize@6.30.0 sequelize-typescript@2.1.0
RUN npm install @nestjs/core@9.0.0 @nestjs/common@9.0.0 nestjs-sequelize@1.0.0
RUN npm install pg pg-hstore
COPY . .
RUN npm run build
# COPY . data

#prod stage
# FROM node:18-alpine
# WORKDIR /usr/src/app

# # ARG NODE_ENV=production
# # ENV NODE_ENV=${NODE_ENV}

# COPY --from=build . .
# # COPY --from=build /usr/src/app/dist ./dist
# COPY package*.json ./

# RUN npm install
# --only=production
# RUN rm package.json

EXPOSE 3000
# EXPOSE 5001
EXPOSE 4000
# EXPOSE 5432
# CMD ["node", "dist/main.js"]
CMD ["npm", "run", "start"]
# CMD ["npm", "run", "start:backend"]