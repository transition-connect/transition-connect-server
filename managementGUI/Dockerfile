FROM node:8.9.1

ARG node_env='production'

ENV NODE_ENV $node_env

RUN mkdir -p /usr/src/app/server
COPY node_modules /usr/src/app/server/node_modules

WORKDIR /usr/src/app/server

RUN mkdir -p /usr/src/app/server/config
RUN mkdir -p /usr/src/app/server/static
RUN mkdir -p /usr/src/app/server/src

#Copy files
COPY server/package.json /usr/src/app/server
COPY server/server.js /usr/src/app/server
COPY server/src /usr/src/app/server/src
COPY server/static /usr/src/app/server/static
COPY server/config/production.json /usr/src/app/server/config/production.json

EXPOSE 8080
CMD [ "npm", "start" ]