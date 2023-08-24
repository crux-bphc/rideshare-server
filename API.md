## Rideshare Endpoints


### User Handling

<details>
  <summary><code>POST</code> <code><b>/user/create</b></code> <code>(Create a new user's entry in the DB)</code></summary>

##### Body

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | name | yes | string | Name of the user |
> | phNo | yes | number | Phone number of the user |
> | email | yes | string | Email of the user |
> | batch | yes | number | Year of admission of the user |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `201` | `{"message": "Created user."}` |
> | `400` | `{"message": "Email or Phone Number already exists."}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

<details>
  <summary><code>POST</code> <code><b>/user/login</b></code> <code>(Login a user)</code></summary>

##### Body

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | email | yes | string | Email of the user |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `200` | `{"message": "Logged in user.", "token": "xyz"}` |
> | `404` | `{"message": "User not found in the DB."}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

<details>
  <summary><code>PUT</code> <code><b>/user/update</b></code> <code>(Update the user's details)</code></summary>

##### Auth

Bearer JWT Token

##### Body

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | name | no | string | Name of the user |
> | phNo | no | number | Phone number of the user |
> | batch | no | number | Year of admission of the user |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `200` | `{"message": "Updated user."}` |
> | `400` | `{"message": "Email or Phone Number already exists."}` |
> | `404` | `{"message": "User not found in the DB."}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

<details>
  <summary><code>GET</code> <code><b>/user/find/{email}</b></code> <code>(Get the user details of self)</code></summary>

##### Auth

Bearer JWT Token

##### Parameters

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | email | yes | string | Email of self |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `200` | `{"message": "Found user.", "name": "John Doe", "email": "doe@gmail.com", phNo: 9999999999, batch: 2021, rides: [...], rideRequests: [...]}` |
> | `404` | `{"message": "User not found in the DB."}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

<details>
  <summary><code>GET</code> <code><b>/user/find/{email}</b></code> <code>(Get the details of a different user)</code></summary>

##### Auth

Bearer JWT Token

##### Parameters

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | email | yes | string | Email of another user |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `200` | `{"message": "Found user.", "name": "John Doe", "email": "doe@gmail.com", phNo: 9999999999, batch: 2021, rides: [...]}` |
> | `404` | `{"message": "User not found in the DB."}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

------------------------------------------------------------------------------------------

### Ride Handling

<details>
 <summary><code>POST</code> <code><b>/ride/create</b></code> <code>(Post a ride)</code></summary>

##### Auth

Bearer JWT Token

##### Body

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | fromPlace | yes | number | Enum of the place leaving from |
> | toPlace | yes | number | Enum of the place arriving at |
> | seats | yes | number | Number of seats available for other users to join |
> | timeRangeStart | yes | string | `"YYYY-MM-DD hh:mm:ss"`-formatted timestamp of the start of the time range for departure |
> | timeRangeStop | yes | string | `"YYYY-MM-DD hh:mm:ss"`-formatted timestamp of the end of the time range for departure |
> | description | no | string | Optional caption to the post |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `201` | `{"message": "Posted ride.", "id": "xyz"}` |
> | `403` | `{"message": "User not found in the DB."}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

<details>
 <summary><code>PUT</code> <code><b>/ride/update/{id}</b></code> <code>(Update the ride's details)</code></summary>

##### Auth

Bearer JWT Token

##### Parameters

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | id | yes | string | ID of the ride |

##### Body

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | fromPlace | no | number | Enum of the place leaving from |
> | toPlace | no | number | Enum of the place arriving at |
> | seats | no | number | Number of seats available for other users to join |
> | timeRangeStart | no | string | `"YYYY-MM-DD hh:mm:ss"`-formatted timestamp of the start of the time slot |
> | timeRangeStop | no | string | `"YYYY-MM-DD hh:mm:ss"`-formatted timestamp of the end of the time slot |
> | description | no | string | Optional caption to the post |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `200` | `{"message": "Updated ride."}` |
> | `401` | `{"message": "Unauthorized to edit this ride."}` |
> | `403` | `{"message": "Ride not found in the DB."}` |
> | `403` | `{"message": "User not found in the DB."}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

<details>
 <summary><code>GET</code> <code><b>`/ride/find/{id}`</b></code> <code>(Fetch the details of a particular ride)</code></summary>

##### Auth

Bearer JWT Token

##### Parameters

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | id | yes | string | ID of the ride |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `200` | `{"message": "Fetched ride.", "id": "xyz", , "originalPoster": {...}, "fromPlace": x, "toPlace": y, "seats": z, "timeRangeStart": x, "timeRangeStop": y, "participants": [...], "participantQueue": [...], "status": true, "createdAt": "YYYY-MM-DD hh:mm:ss", "updatedAt": "YYYY-MM-DD hh:mm:ss", "description": "xyz"}` |
> | `403` | `{"message": "Ride not found in the DB."}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

<details>
 <summary><code>GET</code> <code><b>/ride/search?</b></code> <code>(Search for posts with filters)</code></summary>

##### Auth

Bearer JWT Token

##### Query Parameters

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | fromPlace | no | number | Enum of the place leaving from |
> | toPlace | no | number | Enum of the place arriving at |
> | startTime | no | string | `"YYYY-MM-DD hh:mm:ss"`-formatted timestamp of the start of a time range to search within |
> | endTime | no | string | `"YYYY-MM-DD hh:mm:ss"`-formatted timestamp of the end of a time range to search within |
> | availableSeats | no | number | Render only those rides with atleast this many free seats |
> | activeRides | no | boolean | `true` render trips that are yet to start, `false` renders trips from history, and `null` returns all possible trips regardless |
> | startAtRide | no | number | Starting index for pagination (inclusive) |
> | endAtRide | no | number | Ending index for pagination (inclusive) |
> | orderBy | no | number | `1` returns rides sorted by time of posting, `2` returns rides sorted by time of departure, `3` returns rides sorted by number of seats available. Use the corresponding negative numbers for descending order |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `200` | `{"message": "Fetched rides.", "rides": [...]}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

<details>
 <summary><code>DELETE</code> <code><b>/ride/delete/{id}</b></code> <code>(Delete a ride you posted)</code></summary>

##### Auth

Bearer JWT Token

##### Parameters

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | id | yes | string | ID of the ride |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `200` | `{"message": "Deleted ride."}` |
> | `401` | `{"message": "Unauthorized to delete this ride."}` |
> | `404` | `{"message": "Ride not found in the DB."}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

------------------------------------------------------------------------------------------

### Request Handling

<details>
 <summary><code>GET</code> <code><b>/ride/join/{id}</b></code> <code>(Make a request to join another user's ride)</code></summary>

##### Auth

Bearer JWT Token

##### Parameters

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | id | yes | string | ID of the ride |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `200` | `{"message": "Requested to join this ride."}` |
> | `400` | `{"message": "Cannot request to join your own ride."}` |
> | `404` | `{"message": "User not found in the DB."}` |
> | `404` | `{"message": "Ride not found in the DB."}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

<details>
 <summary><code>POST</code> <code><b>/ride/accept/{id}</b></code> <code>(Accept another user's request to join your ride)</code></summary>

##### Auth

Bearer JWT Token

##### Parameters

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | id | yes | string | ID of the ride |

##### Body

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | email | yes | email | email of the user being accepted |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `200` | `{"message": "Accepted into this ride."}` |
> | `403` | `{"message": "Unauthorized to accept users into this ride."}` |
> | `404` | `{"message": "User has not requested to join this ride."}` |
> | `404` | `{"message": "Ride not found in the DB."}` |
> | `405` | `{"message": "Ride is full."}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

<details>
 <summary><code>DELETE</code> <code><b>/ride/remove/{id}</b></code> <code>(Decline another user's request to join your ride)</code></summary>

##### Auth

Bearer JWT Token

##### Parameters

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | id | yes | string | ID of the ride |

##### Body

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | email | yes | email | email of the user being declined |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `200` | `{"message": "Removed from request queue."}` |
> | `403` | `{"message": "Unauthorized to decline users from this ride."}` |
> | `404` | `{"message": "User has not requested to join this ride."}` |
> | `404` | `{"message": "Ride not found in the DB."}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

<details>
 <summary><code>DELETE</code> <code><b>/ride/remove/{id}</b></code> <code>(Withdraw a request made by you to another user's ride)</code></summary>

##### Auth

Bearer JWT Token

##### Parameters

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | id | yes | string | ID of the ride |

##### Body

> | Name | Required | Data Type | Description |
> |------|----------|-----------|-------------|
> | email | yes | email | email of the self |

##### Response

> | HTTP Code | Response |
> |-----------|----------|
> | `200` | `{"message": "Removed from request queue."}` |
> | `403` | `{"message": "Unauthorized to accept users into this ride."}` |
> | `404` | `{"message": "User has not requested to join this ride."}` |
> | `404` | `{"message": "Ride not found in the DB."}` |
> | `500` | `{"message": "Internal Server Error!"}` |

</details>

------------------------------------------------------------------------------------------
