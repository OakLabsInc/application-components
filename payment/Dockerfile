FROM node:9.11.1-alpine

WORKDIR /src
COPY package.json ./
RUN npm install --progress=false --loglevel="error" && npm cache clean --force

COPY src ./

COPY ./protos/ /protos/

ENV NODE_ENV=production \
    PORT=8005

CMD node index.js
