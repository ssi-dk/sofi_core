# build environment
FROM node:14.21-alpine3.16 as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . ./
RUN yarn run build

FROM build AS testing
ENV CI true
LABEL test=true

# label to ghcr package
LABEL org.opencontainers.image.source https://github.com/ssi-dk/sofi_core
# RUN yarn run lint
RUN yarn run test-ci; exit 0

# runtime environment
FROM caddy:2.2.0-alpine AS final
COPY --from=build /app/build /var/www/html
COPY ./Caddyfile /etc/Caddyfile
EXPOSE 3000
CMD ["caddy", "run", "-config", "/etc/Caddyfile"]
