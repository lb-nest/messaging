FROM node:alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn

COPY . .

RUN yarn build

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn --prod

COPY . .

COPY --from=builder /usr/src/app/dist ./dist

CMD ["node", "dist/main"]