FROM node:9.11.1-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --progress=false --loglevel="error" && npm cache clean --force

COPY src/ ./src/
COPY test/ ./test/
COPY protos/ /protos/

ENV NODE_ENV=production \
    PORT=8005

CMD node src/index.js
