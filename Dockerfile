FROM node:24-alpine AS builder

WORKDIR /opt

COPY package.json yarn.lock .yarnrc.yml  ./

RUN corepack enable \
  && yarn install --immutable

COPY tsconfig.json .
COPY src src

RUN yarn build
RUN yarn workspaces focus --production

FROM node:24-alpine

RUN rm -rf /usr/local/lib/node_modules/npm \
  /usr/local/lib/node_modules/corepack \
  /usr/local/bin/npm \
  /usr/local/bin/npx \
  /usr/local/bin/corepack

WORKDIR /app

COPY --from=builder /opt/package.json /opt/yarn.lock ./
COPY --from=builder /opt/node_modules node_modules
COPY --from=builder /opt/dist dist

USER node

CMD ["node", "dist/index.js"]
