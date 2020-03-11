################## build api-client, prepare dirs and basic files
FROM node:8.11.3-alpine as BASE

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh python make g++
RUN mkdir -p /home/node/indyscan-daemon-ui && chown -R node:node /home/node/indyscan-daemon-ui

USER node

################## build the app
WORKDIR /home/node/indyscan-daemon-ui
COPY --chown=node:node ./indyscan-daemon-ui/package.json ./
COPY --chown=node:node ./indyscan-daemon-ui/package-lock.json ./
COPY --chown=node:node ./indyscan-daemon-ui/public ./public
COPY --chown=node:node ./indyscan-daemon-ui/src ./src
RUN npm install
RUN npm run build
RUN npm prune --production

################## serve the app
FROM node:8.11.3-alpine as PROD
USER node
WORKDIR /home/node/indyscan-daemon-ui

COPY --from=BASE --chown=node:node /home/node/indyscan-daemon-ui/build ./build
COPY --from=BASE --chown=node:node /home/node/indyscan-daemon-ui/node_modules ./node_modules
COPY --from=BASE --chown=node:node /home/node/indyscan-daemon-ui/package.json ./

ENV PORT ${PORT:-"3710"}
ENV PROXY_API_URL ${PROXY_API_URL:-"http://host.docker.internal:3001"}

EXPOSE ${PORT}

CMD npm run serve
