# Tracker Deployment Notes

## Deployment options for deploy keys

Ideally, we should be able to deploy the application directly from github. This is not currently implemented, however options are discussed here.

https://docs.github.com/en/developers/overview/managing-deploy-keys

This round of deployment will be manual, but with an eye toward increasing automation.

## Deployment outline

The current deployment steps are:

- Launch a DigitalOcean droplet
- Point wildcard DNS domain to droplet
- Install Caprover on dev machine
- Initialize and configure apps
- Deploy apps with caprover

## Launch a DigitalOcean Droplet

If there are no existing droplets to deploy to, then create a new one.

From the DigitalOcean dashboard, click Droplets, then click Create.

- Choose image: Marketplace > CapRover 1.9.0 on Ubuntu 18.04
- Plan: Basic, CPU: Regular Intel > 2GB/1CPU
- Datacenter Region: CA Toronto
- Additional Options: User data (Paste user data as below.


```yaml
#cloud-config
users:
  - name: deploy
    ssh-authorized-keys:
      - # Add contents of your OpenSSH public key here.
    groups: docker
    shell: /bin/bash

  - name: yuadmin
    ssh-authorized-keys:
      - # Add contents of your OpenSSH public key here.
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    groups: sudo
    shell: /bin/bash

write_files:
  - path: /home/deploy/README
    content: |
      Current deployment procedure can be found in the source DEPLOYING.md.
      A copy with additional notes is at: https://docs.google.com/document/d/1ILHx0ZYRgfuFHbs5RQsWphzeecqjRBHP7DJN30J4HHE/edit?usp=sharing
runcmd:
  # Show initial key fingerprints.
  - ["echo", "Host SSH key fingerprints: `ssh-keyscan localhost | ssh-keygen -lf -`"]
  # Don't permit root login. Uncomment this for better security.
  # - sed -i -e '/^PermitRootLogin/s/^.*$/PermitRootLogin no/' /etc/ssh/sshd_config
```

Under ***Authentication***, Check SSH keys related to Youth Unlimited. (brianwong, YU, Sean-macbook).

Now create the droplet. It will take a minute to launch.

### IP Addresses

Take note of the public IP address of the droplet. This document assumes you have set an environment variable `MACHINE` to be the droplet IP address.

```bash
# Assign a variable for the IP address so the instructions are easier to follow:
export MACHINE=134.122.34.140
```

- ssh into the machine to obtain the caprover root password. (?)

## Point wildcard DNS domain to droplet

The owner of the root domain will have to point to your CapRover droplet IP address. Example:

> `A  *.app.youthunlimited.com  134.122.34.140`

If you tear down the droplet frequently and want to avoid changing the DNS frequently, launch the droplet with a floating IP so you can use the same IP address on the next launch. (https://docs.digitalocean.com/products/networking/floating-ips/) Be aware of charges if the floating IP is not assigned to a running droplet.

## Install CapRover on dev machine

https://caprover.com/docs/get-started.html#step-3-install-caprover-cli

```
npm install -g caprover

caprover server setup
```

You will be prompted for additional information.

## Initialize and configure apps

Visit `https://captain.app.youthunlimited.com` and login with the management password.

Create the following apps:

### postgres-db

- Create this from `One-Click Apps/Databases` -> PostgreSQL

- App name: `postgres-db`
- Postgres Version: *leave the default*
- Postgres Username: *See the environment variables document*
- Postgres Password: *See the environment variables document*
- Postgres Default Database: *See the environment variables document*
- Optional Arguments: *leave blank*

The app automatically deploys with a persistent volume.

### pgadmin

- Create this from `One-Click Apps/Databases` -> Pgadmin4

- App name: `pgadmin`
- Version Tag: *Leave default*
- Email: `Use an email address with a real domain to avoid issues`
- Password: `Use an alphanumeric password to avoid issues`

Record the Email and password for future use.
`brian.wong@brighterbits.com 78d2f2ad07`

After the application is created, go back and edit settings:

- Click Enable HTTPS.
- Force HTTPS by redirecting all HTTP traffic to HTTPS.

### tracker-api

NOTE: The environment variables contain secrets, treat them as sensitive.

- Create New App: `test-tracker-api`
  - HTTP Settings
    - Enable HTTPS: Yes!
    - Container HTTP Port: `3000`
    - Force HTTPS
	- App Config:
		- Environment: *See environment variables document*
	- Deployment:
		- captain-definition Relative Path: `./captain-definition-tracker-sequelize`

### tracker

- Create New App: `tracker`
  - HTTP Settings
    - Enable HTTPS: Yes!
    - Container HTTP Port: `8080`
    - Force HTTPS
	- App Config:
		- Environment: **See Below**
	- Deployment:
		- captain-definition Relative Path: `./captain-definition-tracker-client`

Environment:
```bash
VUE_APP_API_BASE_URL=https://tracker-api.demo.brighter-bits.ca/api
VUE_APP_LOGGER_ENABLED=true
VUE_APP_LOGGER_MIN_LEVEL=error
```


### tracker-admin

- Create New App: `tracker-admin`
  - HTTP Settings
    - Enable HTTPS: Yes!
    - Container HTTP Port: `8080`
    - Force HTTPS
	- App Config:
		- Environment: **See Below**
	- Deployment:
		- captain-definition Relative Path: `./captain-definition-tracker-adminclient`

Environment:
```bash
VUE_APP_API_BASE_URL=https://tracker-api.demo.brighter-bits.ca/api
VUE_APP_LOGGER_ENABLED=true
VUE_APP_LOGGER_MIN_LEVEL=error
```


## Deploy apps with CapRover

You need a copy of the tracker project onto your local machine, so be sure you have cloned/pulled from GitHub.

Caprover will only deploy files that are committed into your repository, so be sure your changes are committed. Also be aware of which branch you are deploying. The examples below deploy the "main" branch.

```bash
npx caprover deploy -n captain-01 -a tracker-api -b main
npx caprover deploy -n captain-01 -a tracker -b main
npx caprover deploy -n captain-01 -a tracker-admin -b main
```

**TODO**: paste app environment into a separate file for upload.

## Initialize Database

For the initial deployment, or whenever the database changes, you will have to migrate and possibly seed the database:

- ssh into the CapRover server
- shell into the api container
- execute database migration and seeds

```bash

# Whatever works
ssh root@$MACHINE

# Once insite, run a shell in the api container:
docker exec -it $(docker ps -q -f name=tracker_api) bash

# Migrate the database and seed the data
NODE_ENV=production npx sequelize-cli db:migrate
NODE_ENV=production npx sequelize-cli db:seed:all

exit # bash
exit # ssh
```

## Subsequent deployments

Once the Caprover server and applications are running, apps can be redeployed individually. Again, ensure you have committed the version of the app you wish to deploy, and deploy a specific branch with caprover. See ***Deploy apps with CapRover*** section above.

## Database migrations

If the database has changed for a deployment, you should perform the `db:migrate` as above in the ***Initialize Database*** section. You might not want to re-seed the data though.
