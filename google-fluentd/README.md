# Google Cloud Platform Fluentd Logger

This component uses
[fluentd](https://docs.fluentd.org/v1.0/articles/quickstart) to send
logs to GCP Stackdriver. It can be adapted to send logs to other
services and to receive logs from application by a variety of methods.

`sample-google-fluentd.conf` shows the recommended configuration.

See the
[Google Cloud Plugin docs](https://github.com/GoogleCloudPlatform/fluent-plugin-google-cloud)
for instructions on getting GCP service account credentials for
fluentd.
