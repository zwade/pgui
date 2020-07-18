FROM node:14

RUN yarn global add typescript

WORKDIR /app
ADD package.json ./
ADD yarn.lock ./
RUN yarn install

