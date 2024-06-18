FROM registry.gitlab.com/cgps/microreact/server:v258 AS base

COPY usr/local/share/ca-certificates/ /usr/local/share/ca-certificates/
RUN apk --no-cache add ca-certificates \
    && update-ca-certificates 

FROM base AS final