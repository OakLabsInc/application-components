# OakOS Application Components

This is a collection of Docker Images that are intended to be used in
an application that runs on OakOS. An OakOS application is an ensemble
of Docker containers which are usually implemented by the app
developer for that specific case, but these components are generic and
can be used in lots of different applications. They are open-source
and can be copied and modified as an app developer sees fit.

There are examples of how to interact with each component in the
[examples/](examples/) directory.

The Docker image of each component is served publicly on
DockerHub. Below are the Docker tags of the latest released version of
each component, which are the recommended versions to use.

* filesync - `index.docker.io/oaklabs/component-filesync:0.0.1`
* google-fluentd - `index.docker.io/oaklabs/component-google-fluentd:0.0.1`
* oak-lights - `index.docker.io/oaklabs/component-oak-lights:0.0.1`
* webcam - `index.docker.io/oaklabs/component-webcam:0.0.1`
