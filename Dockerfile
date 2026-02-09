FROM ghcr.io/xtls/xray-core:latest

COPY config.json /etc/xray/config.json

USER nobody
CMD ["xray", "-c", "/etc/xray/config.json"]
