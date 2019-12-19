FROM indyscan-indysdk:v1.13.0 as NODEJS

USER root
RUN groupadd -g 1001 indyscan && \
    useradd -r -u 1001 -g indyscan indyscan

RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs
RUN apt-get -y remove curl && apt-get -y autoremove

FROM NODEJS as BUILD

WORKDIR /home/indyscan/indyscan-txtype
WORKDIR /home/indyscan/indyscan-storage
WORKDIR /home/indyscan/indyscan-daemon
RUN chown -R indyscan:indyscan /home/indyscan

USER root
RUN apt-get install -y make
RUN apt-get install -y g++
RUN apt-get install -y python

USER indyscan

WORKDIR /home/indyscan/indyscan-txtype
COPY --chown=indyscan:indyscan indyscan-txtype/package*.json ./
RUN npm install --only=prod
COPY --chown=indyscan:indyscan indyscan-txtype ./

WORKDIR /home/indyscan/indyscan-storage
COPY --chown=indyscan:indyscan indyscan-storage/package*.json ./
RUN npm install --only=prod
COPY --chown=indyscan:indyscan indyscan-storage ./

WORKDIR /home/indyscan/indyscan-daemon
COPY --chown=indyscan:indyscan indyscan-daemon/package*.json ./
RUN npm install --only=prod
COPY --chown=indyscan:indyscan indyscan-daemon ./

FROM NODEJS as PRODUCTION
USER indyscan
COPY --from=BUILD --chown=indyscan:indyscan /home/indyscan/indyscan-txtype /home/indyscan/indyscan-txtype
COPY --from=BUILD --chown=indyscan:indyscan /home/indyscan/indyscan-storage /home/indyscan/indyscan-storage
COPY --from=BUILD --chown=indyscan:indyscan /home/indyscan/indyscan-daemon /home/indyscan/indyscan-daemon

USER root
RUN chown -R indyscan:indyscan /home/indyscan
USER indyscan
RUN mkdir -p /home/indyscan/.indy_client/wallet
RUN mkdir -p /home/indyscan/.indy_client/pool

LABEL org.label-schema.schema-version="1.1.0"
LABEL org.label-schema.name="indyscan-daemon"
LABEL org.label-schema.description="Application scanning Hyperledger Indy blockchain for new transactions and further processing."
LABEL org.label-schema.vcs-url="https://github.com/Patrik-Stas/indyscan"

WORKDIR /home/indyscan/indyscan-daemon
CMD npm run start
