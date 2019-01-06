FROM rust:1.29

COPY . .

RUN chmod +x *.sh

RUN apt-get update && \
    apt-get install -y \
       build-essential \
       pkg-config \
       cmake \
       libssl-dev \
       libsqlite3-dev \
       libzmq3-dev \
       libncursesw5-dev

RUN ./libsodium-install.sh

ARG INDY_VERSION

RUN git clone "https://github.com/hyperledger/indy-sdk.git" "./indy-sdk"

RUN (cd "./indy-sdk" && git checkout "tags/$INDY_VERSION")

RUN (cd "./indy-sdk/libindy" && cargo build --release)
RUN (cd "./indy-sdk/libindy" && cargo build)

RUN mkdir -p "/libindy/release"
RUN mkdir -p "/libindy/debug"
RUN cp "./indy-sdk/libindy/target/release/libindy.so" "/libindy/release/libindy.so"
RUN cp "./indy-sdk/libindy/target/debug/libindy.so" "/libindy/debug/libindy.so"

RUN cp "/libindy/release/libindy.so" "/usr/local/lib/libindy.so"

RUN rm -r "/indy-sdk"

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.name="libindy"

LABEL org.label-schema.version="${INDY_VERSION}"

CMD /bin/bash