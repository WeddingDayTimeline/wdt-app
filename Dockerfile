FROM node:12.14.1-alpine

WORKDIR /usr/src/app

ENV PORT 8080
ENV HOST 0.0.0.0
ENV YARN_VERSION 1.21.1

COPY package*.json yarn.lock ./

RUN apk add --update \
    bash \
    lcms2-dev \
    libpng-dev \
    gcc \
    g++ \
    make \
    autoconf \
    automake \
    && rm -rf /var/cache/apk/*

RUN apk add --no-cache --virtual .build-deps-yarn curl \
    && curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
    && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
    && rm yarn-v$YARN_VERSION.tar.gz \
    && apk del .build-deps-yarn

RUN yarn install --frozen-lockfile --production=true

COPY . .

RUN yarn build

CMD yarn start