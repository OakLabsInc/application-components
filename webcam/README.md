# Webcams

Requires `/dev/video*` and `/dev/oak/webcam/` to be mounted and this
udev rule on the host:

```
SUBSYSTEM=="video4linux", SYMLINK+="oak/webcam/$env{ID_SERIAL}"
```

To run the unit tests, make sure at least one webcam is plugged in and
the above udev rule has fired. Then use this command:

```
docker-compose run server python -m pytest
```
