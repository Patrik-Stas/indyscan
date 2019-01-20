FROM pstas/libindy:v1.6.7

USER root
RUN groupadd -g 1001 indyscan && \
    useradd -r -u 1001 -g indyscan indyscan

COPY daemon /home/indyscan/daemon
COPY indyscan-storage /home/indyscan/indyscan-storage
RUN chown -R indyscan:indyscan /home/indyscan
USER indyscan

WORKDIR /home/indyscan/daemon
RUN npm install

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.name="indyscan-daemon"
LABEL org.label-schema.description="NodeJS app to look foro new transactions and saving them to MongoDB"
LABEL org.label-schema.vcs-url="https://github.com/Patrik-Stas/indyscan"

ENV LD_LIBRARY_PATH "/libindy/debug/"
CMD npm run start
