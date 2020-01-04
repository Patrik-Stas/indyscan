FROM node:12.14.0-alpine3.9 as BUILD

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN apk add -y make
RUN apk add -y g++
RUN apk add -y python


WORKDIR /usr/src/app/indyscan-api-client
COPY indyscan-api-client ./

WORKDIR /usr/src/app/indyscan-txtype
COPY indyscan-txtype ./

WORKDIR /usr/src/app/indyscan-webapp
COPY indyscan-webapp ./
RUN npm install
RUN npm run build
RUN npm prune --production

FROM node:12.14.0-alpine3.9 as PRODUCTION

RUN apk update && apk upgrade
COPY --from=BUILD /usr/src/app/indyscan-webapp /usr/src/app/indyscan-webapp
COPY --from=BUILD /usr/src/app/indyscan-api-client /usr/src/app/indyscan-api-client
COPY --from=BUILD /usr/src/app/indyscan-txtype /usr/src/app/indyscan-txtype
WORKDIR /usr/src/app/indyscan-webapp

ENV PORT ${PORT:-"3707"}
ENV INDYSCAN_API_URL ${INDYSCAN_API_URL:-"3708"}
ENV LOG_LEVEL ${LOG_LEVEL:-"info"}
ENV LOG_HTTP_REQUESTS ${LOG_HTTP_REQUESTS:-"false"}
ENV LOG_HTTP_RESPONSES ${LOG_HTTP_RESPONSES:-"false"}

EXPOSE ${PORT}

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.name="indyscan-webapp"
LABEL org.label-schema.descriptsion="Serverside rendered UI for viewing Hyperledger Indy transactions via Indyscan API"
LABEL org.label-schema.vcs-url="https://github.com/Patrik-Stas/indyscan"

CMD npm run serve
