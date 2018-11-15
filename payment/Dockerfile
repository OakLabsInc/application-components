FROM node:9.11.1-alpine

ENV NODE_ENV=production

WORKDIR /payment/src
COPY package.json /payment/
RUN npm install && npm cache clean --force

COPY src .
COPY lib /payment/lib

COPY protos/ /payment/protos
EXPOSE 9142
EXPOSE 9143

CMD node index.js
