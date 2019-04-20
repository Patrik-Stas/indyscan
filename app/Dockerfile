FROM node:8.12.0

COPY app/package.json /app/
COPY indyscan-storage /indyscan-storage
COPY indyscan-api /indyscan-api

WORKDIR /app/
RUN npm install

COPY app /app/

RUN npm run build

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.name="indyscan-webapp"
LABEL org.label-schema.description="NEXT.js webapp for viewing transactions from HL Indy stored in MongoDB"
LABEL org.label-schema.vcs-url="https://github.com/Patrik-Stas/indyscan"

CMD npm run start
