# rideshare-server
Backend for a carpooling app built for use at BITS Pilani, Hyderabad Campus

**NOTE:** Before contributing changes, we recommend you read the [Contributing Guide](./CONTRIBUTING.md)

**API Reference:** We have basic API documentation here, [API Docs](./API.md)

Make sure to use the correct env files for dev and prod. Check [.env.example](./.env.example) for an example env file. 

## Instructions for different environments

### Development
Set `NODE_ENV` in the `.env` file to "development" and leave `GOOGLE_APPLICATION_CREDENTIALS` in the `.env` file as undefined or leave it commented out.

### Production
Set `NODE_ENV` to "production". `GOOGLE_APPLICATION_CREDENTIALS` in the `.env` file and `rideshare-creds.json` should not be undefined.

## Information about how to run the project

This project uses docker compose profiles to run. It has two profiles as of now, `dev` and `prod`.

You can run any profile using the following command:
`docker compose --profile PROFILE up --build` 

Replace PROFILE with `prod` or `dev`, according to what you want to run.

If you want to run the container in the background without any logs, use:

`docker compose --profile PROFILE up --build -d`

To stop the containers from running, use:

`docker compose --profile PROFILE down -v` or just `docker compose --profile PROFILE down`

To delete the database volume upon stopping the container, you may need root permissions to do so.






