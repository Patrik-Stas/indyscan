FROM ubuntu-libindy:v1.13.0

USER root
RUN groupadd -g 1001 indyscan && \
    useradd -r -u 1001 -g indyscan indyscan

COPY indyscan-daemon /home/indyscan/indyscan-daemon
COPY indyscan-storage /home/indyscan/indyscan-storage
COPY indyscan-txtype /home/indyscan/indyscan-txtype

RUN chown -R indyscan:indyscan /home/indyscan
USER indyscan


WORKDIR /home/indyscan/indyscan-storage
RUN npm install

WORKDIR /home/indyscan/indyscan-daemon
RUN npm install


LABEL org.label-schema.schema-version="1.1.0"
LABEL org.label-schema.name="indyscan-daemon"
LABEL org.label-schema.description="Application scanning Hyperledger Indy blockchain for new transactions and further processing."
LABEL org.label-schema.vcs-url="https://github.com/Patrik-Stas/indyscan"

ENV LD_LIBRARY_PATH "/libindy/debug/"
RUN mkdir -p /home/indyscan/.indy_client/wallet
CMD npm run start
