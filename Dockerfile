FROM node:current-alpine

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .

EXPOSE 3000

CMD sh -c "pnpm build && node dist/main"