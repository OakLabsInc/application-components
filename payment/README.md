# Payments

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
docker-compose run --rm server node test/test_provider.js
```

# Build and run the container

```
docker-compose up --build
```
