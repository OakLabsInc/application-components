FROM fluent/fluentd:v1.2.5

ENTRYPOINT []

RUN apk add --no-cache --virtual .build-deps build-base ruby-dev \
    && gem install fluent-plugin-google-cloud \
    && apk del .build-deps

RUN mkdir -p /etc/google/auth/ /etc/google-fluentd/ \
    && ln -s /etc/google/auth/application_default_credentials.json /etc/google-fluentd/fluentd.conf /

CMD fluentd -p /fluentd/plugins -c /fluentd.conf $FLUENTD_OPT
