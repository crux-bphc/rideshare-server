# rideshare-server
Backend for a carpooling app built for use at BITS Pilani, Hyderabad Campus

**NOTE:** Before contributing changes, we recommend you read the [Contributing Guide](./CONTRIBUTING.md)

**API Reference:** We have basic API documentation here, [API Docs](./API.md)

## Instructions for different environments

Firstly, populate your `.env` file with the variables left as blank in in the `.env.example` file.

### Development
Set `NODE_ENV` in the `.env.dev` file to "development". Refer to `.env.dev.example` for an example of how the `env.dev` file should be structured.

### Production
Set `NODE_ENV` to "production". Refer to `.env.prod.example` for an example of how the `env.prod` file should be structured.

## Information about how to run the project

This project uses docker compose profiles to run. It has two profiles as of now, `dev` and `prod`.

You can run any profile using the following command:
`docker compose --profile PROFILE up --build` 

Replace PROFILE with `prod` or `dev`, according to what you want to run.

If you want to run the container in the background without any logs, use:

`docker compose --profile PROFILE up --build -d`

To stop the containers from running, use:

`docker compose --profile PROFILE down -v` or just `docker compose --profile PROFILE down`

To delete the database volume upon stopping the container, you may need root permissions.






