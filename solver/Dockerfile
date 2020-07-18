FROM node:14

WORKDIR /solver
ADD index.ts package.json tsconfig.json yarn.lock ./
RUN yarn install

ARG TARGET
ENV TARGET $TARGET

CMD ["bash", "-c", "yarn start $TARGET"]