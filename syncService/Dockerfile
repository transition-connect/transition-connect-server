FROM node:8.9.1

ARG node_env='production'

ENV NODE_ENV $node_env

RUN mkdir -p /usr/src/app/server
COPY deployment/node_modules /usr/src/app/server/node_modules

WORKDIR /usr/src/app/server

RUN mkdir -p /usr/src/app/server/config
RUN mkdir -p /usr/src/app/server/src

#Copy files
COPY package.json /usr/src/app/server
COPY server.js /usr/src/app/server
COPY src /usr/src/app/server/src
COPY config/production.json /usr/src/app/server/config/production.json

RUN chown -R node:node /usr/src/app

USER node

CMD [ "npm", "start" ]