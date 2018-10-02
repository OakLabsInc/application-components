FROM python:2.7.15-alpine3.8
# Using google/cloud-sdk:218.0.0-alpine will lead to a BIGGER image

# See https://hub.docker.com/r/camil/gsutil/~/dockerfile/
RUN apk add --no-cache \
    python \
    py-pip \
    py-cffi \
    py-cryptography \
  && pip install --upgrade pip \
  && apk add --no-cache --virtual build-deps \
    gcc \
    libffi-dev \
    python-dev \
    linux-headers \
    musl-dev \
    openssl-dev \
  && pip install gsutil \
  && apk del build-deps \
  && rm -rf /var/cache/apk/*

RUN apk add --no-cache \
    bash=4.4.19-r1 \
    coreutils=8.29-r2 \
    nginx=1.14.0-r1 \
    supervisor=3.3.4-r1 \
    gettext=0.19.8.1-r2
RUN rm -f /etc/nginx/conf.d/*

WORKDIR /src

COPY filesync/requirements.txt ./filesync/

RUN pip install -r ./filesync/requirements.txt

COPY filesync ./filesync
COPY bin ./bin
COPY conf /conf

EXPOSE 9898

ENV BOTO_CONFIG=/conf/boto-config.conf \
    PYTHONUNBUFFERED=1

CMD /usr/bin/supervisord -c /conf/supervisor.conf
