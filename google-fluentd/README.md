# Google Cloud Platform Fluentd Logger

This component uses
[fluentd](https://docs.fluentd.org/v1.0/articles/quickstart) to send
logs to GCP Stackdriver. It can be adapted to send logs to other
services and to receive logs from application by a variety of methods.

Requirements for use:

* Fluentd configuration mounted at `/fluentd.conf`
* GCP service account credentails mounted at `/application_default_credentials.json`

[`sample-google-fluentd.conf`](./sample-google-fluentd.conf) shows the recommended Fluentd configuration.

See the
[Google Cloud Plugin docs](https://github.com/GoogleCloudPlatform/fluent-plugin-google-cloud)
for instructions on getting GCP service account credentials for
fluentd.
