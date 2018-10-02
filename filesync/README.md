# Filesync

The syncer periodically makes sure the directory has the same files as
the GS directory and makes the update appear instant and atomic to
anyone else looking at that directory.

Since we want Filesync servers to stay mostly in sync with each
other, the syncer will try to run every 10 minutes on the 10
minute. It will also sync at start-up. There's a risk from the
stampede of devices trying to update at the same time but we're
punting on that issue for now.

Filefiesta has an `oak.yaml` file which describes its service through
the [oakos-api](github.com/OakLabsInc/oakos-api) container. Whatever
is in the `/live` folder will advertise itself as `assets` as it's
root directory. You can find this on your local network like so:

    avahi-browse -lr _assets._sub._http._tcp

For apps that are putting files in the GS dir, you'll want clients to
wait until you're done before downloading so they don't miss files. An
empty file called `WAIT` in the top of the dir tells clients to wait.

    # Turn waiting on
    gsutil cp /dev/null gs://filefiesta/.../WAIT

    # Turn waiting off
    gsutil rm gs://filefiesta/.../WAIT


# Dev Notes

Put `gcloud-credentials.json` this directory before you build. It
should be a service account credentials file. See Google Cloud docs.
