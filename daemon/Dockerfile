FROM ubuntu-libindy:v1.7.0

USER root
RUN groupadd -g 1001 indyscan && \
    useradd -r -u 1001 -g indyscan indyscan

COPY daemon /home/indyscan/daemon
COPY indyscan-storage /home/indyscan/indyscan-storage
RUN chown -R indyscan:indyscan /home/indyscan
USER indyscan

WORKDIR /home/indyscan/indyscan-storage
RUN npm install

WORKDIR /home/indyscan/daemon
RUN npm install


LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.name="indyscan-daemon"
LABEL org.label-schema.description="NodeJS app to look foro new transactions and saving them to MongoDB"
LABEL org.label-schema.vcs-url="https://github.com/Patrik-Stas/indyscan"

ENV LD_LIBRARY_PATH "/libindy/debug/"
RUN mkdir -p /home/indyscan/.indy_client/wallet
CMD npm run start
