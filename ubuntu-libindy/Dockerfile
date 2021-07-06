FROM ubuntu:16.04 as BASE

RUN apt-get update && \
    apt-get install -y \
      pkg-config \
      libssl-dev \
      libgmp3-dev \
      curl \
      build-essential \
      libsqlite3-dev \
      cmake \
      git \
      python3.5 \
      python3-pip \
      python-setuptools \
      apt-transport-https \
      ca-certificates \
      debhelper \
      wget \
      devscripts \
      libncursesw5-dev \
      libzmq3-dev \
      zip \
      unzip \
      jq

RUN pip3 install -U \
	pip \
	setuptools \
	virtualenv \
	twine==1.15.0 \
	plumbum==1.6.7 six==1.12.0 \
	deb-pkg-tools

# Install libsodium
RUN cd /tmp && \
   curl https://download.libsodium.org/libsodium/releases/libsodium-1.0.18.tar.gz | tar -xz && \
    cd /tmp/libsodium-1.0.18 && \
    ./configure && \
    make && \
    make install && \
    rm -rf /tmp/libsodium-1.0.18

RUN groupadd -g 1000 indy && useradd -r -u 1000 -g indy indy

WORKDIR /home/indy
RUN chown -R indy:indy /home/indy
USER indy

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain 1.45.1
ENV PATH /home/indy/.cargo/bin:$PATH

ARG INDYSDK_REPO_OWNER=hyperledger
ARG INDYSDK_REVISION=v1.15.0

RUN git clone "${INDYSDK_REPO}" "./indy-sdk"
RUN cd "/home/indy/indy-sdk" && git checkout "${INDYSDK_REVISION}"

RUN cargo build --release --manifest-path=/home/indy/indy-sdk/libindy/Cargo.toml
USER root
RUN mv /home/indy/indy-sdk/libindy/target/release/*.so /usr/lib

FROM ubuntu:16.04

RUN apt-get update && \
    apt-get install -y \
      libssl-dev \
      apt-transport-https \
      ca-certificates

RUN useradd -ms /bin/bash -u 1000 indy
USER indy

WORKDIR /home/indy
COPY --from=BASE /var/lib/dpkg/info /var/lib/dpkg/info
COPY --from=BASE /usr/lib/x86_64-linux-gnu /usr/lib/x86_64-linux-gnu
COPY --from=BASE /usr/local /usr/local

COPY --from=BASE /usr/lib/libindy.so /usr/lib/libindy.so

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.name="indysdk"
LABEL org.label-schema.version="${INDY_VERSION}"

USER indy



