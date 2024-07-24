# docker build --tag tracker-client:prod .

# Check out https://hub.docker.com/_/node to select a new base image
FROM node:10-slim as build

# Install some global dependencies
USER root
RUN npm install -g @ionic/cli @vue/cli

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package*.json ./

# Install packages for production
# i.e. everything except cypress
RUN npm install --no-optional

# Bundle app source code
COPY --chown=node . .

# Uncomment the lines below to test to see if the variable is being passed into the build.
# ARG VUE_APP_API_BASE_URL
# RUN bash -c "echo VUE_APP_API_BASE_URL is \${VUE_APP_API_BASE_URL}"

# Allow API URL to be passed as an environment variable during build.
ARG VUE_APP_API_BASE_URL
# Build for production
RUN npm run build

FROM nginx:alpine

# Copy dist files to nginx container
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /home/node/app/dist/ /usr/share/nginx/html/
RUN ["/bin/sed", "-i", "-e", "/location \\/ {/a\
  try_files $uri /index.html;\
  \
  ", "/etc/nginx/conf.d/default.conf"]

# Use alpine's settings
