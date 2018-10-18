# Filesync - Google Cloud Storage Syncing

This service will periodically, atomically sync a Google Cloud Storage
directory to this container and server the contents over http.

The service is configured through these environment variables:

* `CONTROL_PORT` port that the control gRPC interface listens on
* `DATA_PORT` port that the files are served on
* `GS_URL` gs:// url to the Google Cloud Storage directory where the
  files are downloaded from
* `SYNC_DIR` absolute path to the directory in the container the files
  should be stored it; this should be a persistent volume and will
  need to have at least 2x the amount of space that the GCS directory
  uses
* `SYNC_PERIOD` how often in seconds syncing should begin; if syncing
  is ongoing then the period just restarts

This service can be signaled to wait before downloading by placing an
empty file called `WAIT` in the top of the SYNC_DIR:

    # Turn waiting on
    gsutil cp /dev/null gs://path/to/sync_dir/WAIT

    # Turn waiting off
    gsutil rm gs://path/to/sync_dir/WAIT


# Dev Notes

Put `gcloud-credentials.json` this directory before you build. It
should be a service account credentials file. See Google Cloud docs.

The script `tryit.py` can be used to test the control interface. You
can use `curl` to view the files. Here's a quick way to test the whole
flow:

```
echo 'GS_URL=gs://your/gcs/directory/ > .env

python tryit.py localhost:9102

curl http://localhost:9103/

```
