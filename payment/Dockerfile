FROM node:9.11.1-alpine

ENV NODE_ENV=production

WORKDIR /src
COPY package.json ./
RUN npm install --progress=false --loglevel="error" && npm cache clean --force

COPY src ./

COPY protos/ /protos

CMD node index.js
