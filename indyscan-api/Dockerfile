FROM node:12.14.0-alpine3.9

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV ES_URL ${ES_URL:-"http://elasticsearch-indyscan"}
ENV PORT ${PORT:-"3707"}
ENV NETWORKS_CONFIG_PATH ${NETWORKS_CONFIG_PATH:-"./config-networks/localhost-sovrin.json"}
ENV LOG_LEVEL ${LOG_LEVEL:-"debug"}
ENV LOG_HTTP_REQUESTS ${LOG_HTTP_REQUESTS:-"false"}
ENV LOG_HTTP_RESPONSES ${LOG_HTTP_RESPONSES:-"false"}

EXPOSE ${PORT}

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.vendor="Indyscan.io"
LABEL org.label-schema.name="IndyscanAPI"
LABEL org.label-schema.description="Indyscan API"
LABEL org.label-schema.vcs-url="https://github.com/Patrik-Stas/indyscan"

CMD npm run start
