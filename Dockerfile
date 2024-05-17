FROM node:20-alpine

WORKDIR /app

ARG YARN_VERSION="4.2.2"

COPY package.json yarn.lock .yarnrc.yml  ./

RUN corepack enable \
  && corepack use yarn@${YARN_VERSION} \
  && yarn install --immutable --immutable-cache --check-cache

COPY index.js .
COPY src src

USER node

CMD ["node", "index.js"]
