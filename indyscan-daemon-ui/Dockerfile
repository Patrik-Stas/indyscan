################## build api-client, prepare dirs and basic files
FROM node:8.11.3-alpine as BASE

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh python make g++
RUN mkdir -p /home/node/api-client && chown -R node:node /home/node/api-client
RUN mkdir -p /home/node/ui && chown -R node:node /home/node/ui

USER node

################## build client
WORKDIR /home/node/api-client
COPY --chown=node:node ./api-client ./

################## build the app
WORKDIR /home/node/ui
COPY --chown=node:node ./ui/package.json ./
COPY --chown=node:node ./ui/package-lock.json ./
COPY --chown=node:node ./ui/public ./public
COPY --chown=node:node ./ui/src ./src
RUN npm install
RUN npm run build
RUN npm prune --production

################## serve the app
FROM node:8.11.3-alpine as PROD
USER node
WORKDIR /home/node/ui

COPY --from=BASE --chown=node:node /home/node/ui/build ./build
COPY --from=BASE --chown=node:node /home/node/ui/node_modules ./node_modules
COPY --from=BASE --chown=node:node /home/node/ui/package.json ./

LABEL org.label-schema.schema-version="1.1.0"
LABEL org.label-schema.name="vcxs-ui"
LABEL org.label-schema.description="Verifiable Credential Exchange Service UI"

ENV PORT ${PORT:-"3003"}
ENV PROXY_API_URL ${PROXY_API_URL:-"http://host.docker.internal:3001"}

EXPOSE ${PORT}

CMD npm run serve
