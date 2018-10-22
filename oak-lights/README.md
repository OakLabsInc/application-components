# Oak Lights Controller

Requirements for use:
* `PORT` env var set to port that gRPC server should listen on
* `/dev/ttyACM*` devices mounted
* `/dev/oak/oak-lights/` bind-mounted
* This udev rule on the host:

```
SUBSYSTEM=="tty", ATTRS{idProduct}=="8d21", ATTRS{idVendor}=="1b4f", ATTRS{manufacturer}=="OAK", ATTRS{product}=="LIGHT", SYMLINK+="oak/oak-lights/$env{ID_SERIAL}"
```

## Dev Notes

To run the unit tests, make sure at least one oak-lighting controller
is plugged in and the above udev rule has fired. Then use this
command:

```
docker-compose run server python -m pytest
```
