FROM node:24-alpine AS builder

WORKDIR /opt

ARG YARN_VERSION="4.4.1"

COPY package.json yarn.lock .yarnrc.yml  ./

RUN corepack enable \
  && corepack use yarn@${YARN_VERSION} \
  && yarn install --immutable --immutable-cache --check-cache

COPY tsconfig.json .
COPY src src

RUN yarn build
RUN yarn workspaces focus --production

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /opt/package.json /opt/yarn.lock ./
COPY --from=builder /opt/node_modules node_modules
COPY --from=builder /opt/dist dist

USER node

CMD ["node", "dist/index.js"]
