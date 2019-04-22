FROM node:8.12.0

COPY indyscan-webapp/package.json /indyscan-webapp/
COPY indyscan-storage /indyscan-storage
COPY indyscan-api /indyscan-api
COPY indyscan-txtype /indyscan-txtype

WORKDIR /indyscan-webapp/
RUN npm install

COPY indyscan-webapp /indyscan-webapp/

RUN npm run build

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.name="indyscan-webapp"
LABEL org.label-schema.descriptsion="NEXT.js webapp for viewing transactions from HL Indy stored in MongoDB"
LABEL org.label-schema.vcs-url="https://github.com/Patrik-Stas/indyscan"

CMD npm run start
