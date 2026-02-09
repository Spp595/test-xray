FROM ghcr.io/xtls/xray-core:latest

COPY config.json /etc/xray/config.json

USER nobody

CMD ["run", "-c", "/etc/xray/config.json"]


