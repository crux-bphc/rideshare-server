
# Endpoints

## User endpoints

### Create User

`POST` - `/user/create`

### Login User

`POST` - `/user/login`

### Update User Details

`PUT` - `/user/update/:email`

### Get User Details

`GET` - `/user/find/:email`

## Ride Endpoints

### Create a Ride

`POST` - `/ride/create`

### Update a Ride's details

`PUT` - `/ride/update/:id`

### Get a Ride's details

`GET` - `/ride/find/:id`

### Search for Rides using filters

`GET` - `/ride/search`

### Delete a Ride

`DELETE` - `/ride/delete/:id`

### Make a Request to Join a Ride

`GET` - `/ride/join/:id`

### Revoke a Request you already made

`DELETE` - `/ride/revoke/:id`

### Accept another User's Request to Join Your Ride

`POST` - `/ride/accept/:id`

### Decline another User's Request to Join Your Ride

`DELETE` - `/ride/reject/:id`