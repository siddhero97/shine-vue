# client

## Notes

### Icons

The favicon is from https://aiconica.net/ (the graphic is CC0, original downloaded filename was "Checklist sent_000000.png").

## Pre-requisites

### Ionic CLI

This is highly recommended (not sure if it's actually required).

```
npm install -g @ionic/cli
```

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

#### Set up development ENV file

If you don't already have a .env.development file, make a copy of .env-template.development and rename that copy to .env.development.

<!-- prettier-ignore -->
Update the values of the environment variables (especially the VUE_APP_* ones) as needed.

#### Start the server in development mode

**Open a new command prompt window** to run the commands needed to start the
tracker-sequelize server in development mode.

See the [README.md](../README.md) at the root of the repo and the [README.md](../tracker-sequelize/README.md) of the tracker-sequelize project for details.

#### Run the Vue App in development mode

This is to start the tracker-client Vue app in localhost.

**Open a new command prompt window** and start the tracker-client app.

```
npm run serve
```

### Compiles and minifies for production

First make sure you have a .env file (or a .env.production file). It should be based on the .env-template file.

```
npm run build
```

### Run your unit tests

```
npm run test:unit
```

### Run your end-to-end tests

```
npm run test:e2e
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See the [Ionic CLI Configuration Reference](https://ionicframework.com/docs/cli/configuration).
Also see the [Vue CLI Configuration Reference](https://cli.vuejs.org/config/).
