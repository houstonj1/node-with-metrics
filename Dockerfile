FROM node:lts-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --silent --ignore-optional

COPY index.js .

USER node

CMD ["node", "index.js"]
