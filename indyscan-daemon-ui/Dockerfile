################## build api-client, prepare dirs and basic files
FROM node:12.14.0-alpine3.9 as BASE

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh python make g++
RUN mkdir -p /home/node/indyscan-daemon-ui && chown -R node:node /home/node/indyscan-daemon-ui
RUN npm install -g yarn

################## build the app

# For some reason, using the commende bellow creates /home/node/indyscan-daemon-api-client directory owned by root ....
#USER node
#COPY --chown=node:node ./indyscan-daemon-api-client ./

# .... hence following awkward workaround instead...
WORKDIR /home/node/indyscan-daemon-api-client
COPY ./indyscan-daemon-api-client ./
RUN chown -R node:node /home/node/indyscan-daemon-api-client

USER node

WORKDIR /home/node/indyscan-daemon-ui
COPY --chown=node:node ./indyscan-daemon-ui/package.json ./
COPY --chown=node:node ./indyscan-daemon-ui/yarn.lock ./
COPY --chown=node:node ./indyscan-daemon-ui/public ./public
COPY --chown=node:node ./indyscan-daemon-ui/src ./src
RUN yarn install
RUN yarn run build
RUN yarn install --production --ignore-scripts --prefer-offline  ## https://github.com/yarnpkg/yarn/issues/696

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

CMD yarn run serve
