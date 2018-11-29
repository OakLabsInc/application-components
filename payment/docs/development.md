# Setup

[Install docker](https://docs.docker.com/install/).
[Install docker-compose](https://docs.docker.com/compose/).
[Install nvm](https://github.com/creationix/nvm).

```bash
nvm install 9.11.2
npm i
```

# Run the tests

```
node test/test_provider.js
```

# Build and run the container

```
docker-compose up --build
```

# Update the protobuf definitions

```
cd protos
git checkout [some branch or commit]
cd .. // to root of project
git status
git commit -a // or whatever you like... submodule version will look like a file change
```

# Sample .env file

You will need this file in the payment project directory in order to perform local testing.

```
HOST=0.0.0.0:9142
REST_PROXY_PORT=9143
FREEDOMPAY_HOST=http://192.168.1.10:1011
WORLDPAY_HOST=http://192.168.0.64:8080
LOCATION_ID=1460175013
TERMINAL_ID=2463834019
```
