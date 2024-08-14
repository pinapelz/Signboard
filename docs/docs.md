# Announcer Service API
Signpost is a simple API that provides simple key-value text/JSON storage along with some additional useful features. It is designed to be used as a simple way to store information external to some particular application or site for later retrieval.

## Version: 0.0.1

### /announcement/set

#### POST
##### Summary:

Set or update an announcement

##### Description:

Create a new announcement or update an existing one. An optional expiry time can be set.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Announcement set successfully |
| 401 | Invalid master password |
| 403 | Invalid secret for updating the announcement |

### /announcement/get/{announcement_key}

#### GET
##### Summary:

Get an announcement

##### Description:

Fetch an announcement using its key. A secret may be required for private announcements.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| announcement_key | path | The key of the announcement to fetch. | Yes | string |
| secret | query | The secret key, required if the announcement is private. | No | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Announcement fetched successfully |
| 403 | Secret required or incorrect |
| 404 | Announcement not found |

### /announcement/delete

#### POST
##### Summary:

Delete an announcement

##### Description:

Delete an announcement using its key and secret.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Announcement deleted successfully |
| 401 | Invalid master password or secret |
| 404 | Announcement not found |

### /

#### GET
##### Summary:

Home route

##### Description:

A simple welcome message.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Welcome message |
