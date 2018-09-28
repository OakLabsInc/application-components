# Oak Lights Controller

Requires `/dev/ttyACM*` and `/dev/oak/oak-lights` to be mounted and
this udev rule on the host:

```
SUBSYSTEM=="tty", ATTRS{idProduct}=="8d21", ATTRS{idVendor}=="1b4f", ATTRS{manufacturer}=="OAK", ATTRS{product}=="LIGHT", SYMLINK+="oak/oak-lights/$env{ID_SERIAL}"
```

To run the unit tests, make sure at least one oak-lighting controller
is plugged in and the above udev rule has fired. Then use this
command:

```
docker-compose run server python -m pytest
```
