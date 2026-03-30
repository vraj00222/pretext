FROM oven/bun:1.2 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run site:build

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY --from=build /app/site /usr/share/nginx/html
EXPOSE 8080
