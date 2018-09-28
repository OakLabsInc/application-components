FROM fluent/fluentd:v1.2.5

ENTRYPOINT []

RUN apk add --no-cache --virtual .build-deps build-base ruby-dev

RUN gem install fluent-plugin-google-cloud

RUN apk del .build-deps

CMD fluentd -p /fluentd/plugins -c /fluentd.conf $FLUENTD_OPT
