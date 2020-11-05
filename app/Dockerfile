# build environment
FROM node:13.12.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./
COPY ./sap-client ./sap-client
RUN yarn install --frozen-lockfile
RUN yarn global add react-scripts@3.4.3
COPY . ./
RUN yarn run build

# runtime environment
FROM caddy:2.2.0-alpine
COPY --from=build /app/build /var/www/html
COPY ./Caddyfile /etc/Caddyfile
EXPOSE 3000
CMD ["caddy", "run", "-config", "/etc/Caddyfile"]
