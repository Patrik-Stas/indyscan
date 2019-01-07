FROM pstas/libindy:v1.6.7

# Install node 8 LTS version; source: https://github.com/nodesource/distributions/blob/master/README.md
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs

COPY daemon/package.json /daemon/
COPY indyscan-storage /indyscan-storage
WORKDIR /daemon/
RUN npm install

COPY daemon /daemon/

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.name="indyscan-daemon"
LABEL org.label-schema.description="NodeJS app to look foro new transactions and saving them to MongoDB"
LABEL org.label-schema.vcs-url="https://github.com/Patrik-Stas/indyscan"

#ENV LD_LIBRARY_PATH "/usr/local/lib"
ENV LD_LIBRARY_PATH "/libindy/debug/"
CMD npm run start
