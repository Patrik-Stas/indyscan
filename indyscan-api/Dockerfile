FROM node:12.14.0-alpine3.9 as BUILD

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN apk add make
RUN apk add g++
RUN apk add python

WORKDIR /usr/src/app/indyscan-storage
COPY indyscan-storage ./

WORKDIR /usr/src/app/indyscan-api
COPY indyscan-api/package*.json ./
RUN npm install --only=prod
COPY indyscan-api ./

FROM node:12.14.0-alpine3.9 as PRODUCTION

RUN apk update && apk upgrade
COPY --from=BUILD /usr/src/app/indyscan-storage /usr/src/app/indyscan-storage
COPY --from=BUILD /usr/src/app/indyscan-api /usr/src/app/indyscan-api
WORKDIR /usr/src/app/indyscan-api

ENV ES_URL ${ES_URL}
ENV PORT ${PORT:-"3708"}
ENV NETWORKS_CONFIG_PATH ${NETWORKS_CONFIG_PATH:-"./config-networks/localhost.json"}
ENV LOG_LEVEL ${LOG_LEVEL:-"info"}
ENV LOG_HTTP_REQUESTS ${LOG_HTTP_REQUESTS:-"false"}
ENV LOG_HTTP_RESPONSES ${LOG_HTTP_RESPONSES:-"false"}

EXPOSE ${PORT}

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.vendor="Indyscan.io"
LABEL org.label-schema.name="IndyscanAPI"
LABEL org.label-schema.description="Indyscan API"
LABEL org.label-schema.vcs-url="https://github.com/Patrik-Stas/indyscan"

CMD npm run start
