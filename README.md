# Initial setup

## Pre-requisites

In order to build and run locally, you will need the following utilities:

* node v14
* bash
* jq
* make
* pip3
* yarn
* docker
* docker-compose

### Extra Windows pre-requisites

This guide is for running the project using WSL2 in Windows.

1. Follow this guide [https://docs.microsoft.com/en-us/windows/wsl/setup/environment#get-started](https://docs.microsoft.com/en-us/windows/wsl/setup/environment#get-started)

   This includes:
      * Docker for desktop - with WSL2 integration
      * WSL2

2. Create your own user
   
   We want to avoid using root, it can create unexpected behavior.
   1. Start by creating your user, adding it to sudo group and change to that user 
      ```
      adduser <user-name>
      usermod -aG sudo <user-name>
      su <user-name>
      ```
   2. Now the user is created, and you are logged into that user. To set this as a default user, you can add/edit the file `/etc/wsl.conf` to:
      ```
      [user]
      default=<use-name>
      ```
 
You're now set to continue with [Running](#running), below there's additional notes to consider:
 
#### Database permission

Ensure that `auth/pg/pgdata/` and `bifrost/bifrost_db/data/` are owned by `<user-name>`.

This can be done by running
```sh
sudo chown -R $(id -u):$(id -g) bifrost/bifrost_db/data/db
```

#### Project placement

You have to store the project, i.e. clone the repo, to the WSL2 filesystem and **NOT** the Windows filesystem. The Windows filesystem is emulated and the user permission file causes unexpected behavior. 

E.g. clone the repo to `/home/<user-name>/git/`. This is placed in the `git` directory within your linux users home directory.

Be sure to get submodules `git submodule update --init --recursive`

#### Host file
Latter in this `README.md` you will have to add something to your host file, this must be added in both the WSL2 hosts file and the Windows hosts file.

* [task](https://taskfile.dev) (Used for running tests)

# Running

On the first run, you'll need to install the dependencies for the web app:

```shell
pushd ./app && yarn install && popd
```

When running locally, you need a correctly figured .env file. (_this includes generating or in another way getting the necessary `.crt` and `.pem` files_)

Start by copying the .env.local.example file and make any adjustments you need.

Of particular importance is the SOFI_HOSTNAME and SOFI_PORT, as well as the
 TLS_CERT_PATH and TLS_KEY_PATH.
 
Regarding the TLS_CERT and TLS_KEY, it is important that the certificate be a
 ‘real’ certificate signed by a trusted CA. You can use Let’s Encrypt for this purpose.

The SOFI_HOSTNAME must match your certificate.

To run locally using `docker-compose`, execute:

```shell
make run
```

This will launch all containers with locally mounted files, enabling automatic code reload, 
as well as hot-module-reload (HMR) in the browser.

By default, services will be available on `https://dev.sofi-platform.dk`.
This can be changed by modifying the generated `.env` file.
The relevant env variables are `SOFI_SCHEME`, `SOFI_HOSTNAME`, and `SOFI_PORT`.

Make sure to edit your `/etc/hosts` file (`c:\windows\system32\drivers\etc\hosts` on Windows) and include the line:

```
127.0.0.1	dev.sofi-platform.dk
127.0.0.1	dev2.sofi-platform.dk
```

Setting `SOFI_HOSTNAME` to `localhost` or `127.0.0.1` is not currently supported.

When running in the dev environment, you can create a default set of demo users that can sign-in to the application. 

Do so by running after the application has been started. 
```
auth/config/keycloak/create-users.sh
``` 

Username: `admin@fvst.dk`
Password: `Delegate21!`

You can access keycloak admin interface through `https://{hostname}/auth/admin`
Username: `admin`
Password: `admin`


## Local dev running
Create virtual env, install dependencies
```shell
$ python -m venv .venv
$ . .venv/bin/activate
$ pip install -r requirements.txt
```
Have a mongodb instance running on localhost:27017

```shell
$ sh start_local.sh
```

On windows, in venv with dependencies installed
```shell
set FLASK_APP=wsgi.py
set FLASK_DEBUG=1
set APP_CONFIG_FILE=config.py
set FLASK_RUN_HOST=127.0.0.1
set FLASK_RUN_PORT=8080
flask run
```

Default user 
username: test
password: test
from seed_data project

# Generating simulated data
When running locally, the bifrost db gets pre-seeded with the contents of the `.jsonl` files inside `initdb.d`.

These `.jsonl` files can be regenerated based on the latest specification running:

```shell
rm bifrost/bifrost_db/initdb.d/generated.jsonl
./generate_dummy_data.sh
```

The seeding only occurs when the database is first created, so to force the change to take effect, run:

```shell
make clean && make run
```

-

## Project Structure

Consult `docs/`.


# Troubleshooting possible development errors

## bifrost_db container ERROR: child process failed, exited with 1
When running make run. If the bifrost conainer keeps failing with an error message saying "ERROR: child process failed, exited with 1". Look for if "Error creating journal directory".
First look at the [Database permission](#database-permission) section. Alternatively, one way to get around this error is by running `make run` with sudo privilidges:
```shell
sudo make run
```