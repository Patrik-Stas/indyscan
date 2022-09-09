FROM ghcr.io/absaoss/vcxagencynode/vcxagency-base:2.3.0-master-839 as nodejs

RUN apk add --no-cache \
        npm \
        bash \
        g++ \
        gcc \
        make \
        cmake \
        python2 \
        curl

RUN npm install -g npm@8.7.0

USER node

USER root
ARG UID=1002
ARG GID=1002
RUN addgroup -g $GID indyscan && adduser -u $UID -D -G indyscan indyscan

WORKDIR /home/indyscan/indyscan-txtype
WORKDIR /home/indyscan/indyscan-storage
WORKDIR /home/indyscan/indyscan-daemon
RUN chown -R indyscan:indyscan /home/indyscan

USER indyscan

WORKDIR /home/indyscan/indyscan-txtype
COPY --chown=indyscan:indyscan indyscan-txtype ./
RUN npm ci --only=prod

WORKDIR /home/indyscan/indyscan-storage
COPY --chown=indyscan:indyscan indyscan-storage ./
RUN npm ci --only=prod

WORKDIR /home/indyscan/indyscan-daemon
COPY --chown=indyscan:indyscan indyscan-daemon/package*.json ./
RUN npm ci --only=prod
COPY --chown=indyscan:indyscan indyscan-daemon ./

USER root
RUN chown -R indyscan:indyscan /home/indyscan
USER indyscan
RUN mkdir -p /home/indyscan/indyscan-daemon/logs
RUN mkdir -p /home/indyscan/.indy_client/wallet
RUN mkdir -p /home/indyscan/.indy_client/pool

LABEL org.label-schema.schema-version="1.1.0"
LABEL org.label-schema.name="indyscan-daemon"
LABEL org.label-schema.description="Application scanning Hyperledger Indy blockchain for new transactions and further processing."
LABEL org.label-schema.vcs-url="https://github.com/Patrik-Stas/indyscan"

WORKDIR /home/indyscan/indyscan-daemon

CMD npm run start
