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

ENV HOST 0.0.0.0:9142
ENV REST_PROXY_PORT 9143
ENV DEBUG=rest

CMD node index.js
