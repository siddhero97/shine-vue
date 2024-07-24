# Tracker2

[![GitHub license](https://img.shields.io/github/license/Youth-Unlimited/tracker.svg)](LICENSE.md)

See each directory's README.md for more information.

# Development environment

Node.js and Visual Studio Code are recommended for development. Linux is the recommended development environment, however the different apps should run in Windows (or WSL2) as well.

## General

- Install Visual Studio Code

*For Linux:*

- Docker CE (or Docker Desktop on Windows)

*For Windows:*

- WSL2 (Windows Subsystem for Linux)
- Docker Desktop

## Developing from containers in VS Code

VS Code has a remote containers feature but using this is deprecated because it does not work well in for a mono repo with multiple apps (which is what this project is.)

# Starting a database locally

The following line will bring up a database container for local development. You may still need to bootstrap the database.

```
docker-compose up -d db
```

You can also bring up an instance of pgadmin to manage the database. See **Accessing the database** below.

# Running apps individually

The apps can be run individually and if configured properly they will work together on the local machine. See each directory's README.md for more information.

# Running with `docker-compose`

`docker-compose` can be used for a container-based build. This can be useful for bringing up the entire application stack for integration tests, for example. It was used for deployment before the project started using CapRover.

## Build

```sh
docker-compose build
```

This builds the docker images. The application will be built for development. See DEPLOYING.md to build for production.

## Run

```sh
docker-compose up -d
```

This will bring up the Postgres server, the backend at port 3000 and the frontend at port 8080.

If this is the first time the Postgres server has been launched, the database will need to be created. See the section below on _Migrating data and seeds on docker-compose._

**NOTE**: Currently the database is not persistent, so it must be recreated after the container is instantiated with `docker-compose up`.

## Shutdown

```sh
docker-compose down
```

## Accessing the database

Use pgadmin to access the database. For convenience, a docker-compose configuration has been created.

You can create a .env file in the project root that contains the default credentials to access pgadmin.

```env
# Example .env file
PGADMIN_DEFAULT_EMAIL="default@example.com"
PGADMIN_DEFAULT_PASSWORD=changeme
PGADMIN_LISTEN_PORT=80
PGADMIN_DISABLE_POSTFIX=1
```

Starting up pgadmin

```sh
# First time startup
docker-compose up -d pgadmin
```

or

```sh
# Subsequent startups
docker-compose start pgadmin
```

After pgadmin is started, you can access it at http://localhost.

To stop pgadmin:

```sh
# Stop and remember settings
docker-compose stop pgadmin
```

## Docker Compose and Secrets

We use Docker secrets for managing our configuration. When fully configured, this provides a few advantages:

- images do not contain credentials
  - images don't need to be rebuilt to change credentials.
  - it is safer to store images in a repository.
- secrets can be shared between containers
  - e.g. database container and api container can be set up to use the same db credentials.

**NOTE**: we are using Docker Compose secrets, not Docker Swarm secrets. Secrets are configured differently in Docker Swarm.

**NOTE**: tracker-client should not have any secrets because all front-end
code is visible on the browser.

```bash
# Put application secrets where our configuration expects them.
mkdir -p secrets

# These are just examples, change them for your configuration.
echo 'myusername' > secrets/pg_username
echo 'mypassword' > secrets/pg_password
echo 'mydata_db' > secrets/pg_db

cp tracker-sequelize/src/pre-start/env/production.example.env secrets/tracker-sequelize.env
# Fill out the .env files with your production configuration
```

**TODO**: if we start using configuration templates, then instantiate the configuration file from a template at runtime on container start.

## Migrating data and seeds on docker-compose

Run a bash console on the api service.

```bash
docker-compose run api bash
```

Then run the appropriate commands.

```
cp /home/node/app/dist/pre-start/env/production.env /home/node/app/src/pre-start/env/production
.env
NODE_ENV=production npx sequelize-cli db:migrate
NODE_ENV=production npx sequelize-cli db:seed:all
```
