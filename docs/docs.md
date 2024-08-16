# Signpost

> Version 0.0.1

Signpost is a simple API that provides simple key-value text/JSON storage along with some additional useful features. It is designed to be used as a simple way to store information external to some particular application or site for later retrieval.

## Path Table

| Method | Path | Description |
| --- | --- | --- |
| GET | [/](#get) | Home route |
| POST | [/announcement/delete](#postannouncementdelete) | Delete an announcement |
| GET | [/announcement/get/{announcement_key}](#getannouncementgetannouncement_key) | Get an announcement |
| POST | [/announcement/set](#postannouncementset) | Set or update an announcement |

## Reference Table

| Name | Path | Description |
| --- | --- | --- |

## Path Details

***

### [GET]/

- Summary  
Home route

- Description  
A simple welcome message.

#### Responses

- 200 Welcome message

`application/json`

```ts
{
  message?: string
}
```

***

### [POST]/announcement/delete

- Summary  
Delete an announcement

- Description  
Delete an announcement using its key and secret.

#### RequestBody

- application/json

```ts
{
  // The key of the announcement to delete.
  key?: string
  // The secret key used for deletion.
  secret?: string
  // Master password required if public access is disabled.
  master_password?: string
}
```

#### Responses

- 200 Announcement deleted successfully

`application/json`

```ts
{
  message?: string
}
```

- 401 Invalid master password or secret

`application/json`

```ts
{
  message?: string
}
```

- 404 Announcement not found

`application/json`

```ts
{
  message?: string
}
```

***

### [GET]/announcement/get/{announcement_key}

- Summary  
Get an announcement

- Description  
Fetch an announcement using its key. A secret may be required for private announcements.

#### Parameters(Query)

```ts
secret?: string
```

#### Responses

- 200 Announcement fetched successfully

`application/json`

```ts
{
  content?: string
  created_at?: string
  expires_in_seconds?: integer
  expires_at?: string
}
```

- 403 Secret required or incorrect

`application/json`

```ts
{
  message?: string
}
```

- 404 Announcement not found

`application/json`

```ts
{
  message?: string
}
```

***

### [POST]/announcement/set

- Summary  
Set or update an announcement

- Description  
Create a new announcement or update an existing one. An optional expiry time can be set.

#### RequestBody

- application/json

```ts
{
  // The unique key for the announcement.
  key?: string
  // The content of the announcement.
  value?: string
  // A secret key used for updating or deleting the announcement.
  secret?: string
  // Whether the announcement is public or private.
  public?: boolean //default: true
  // Expiry time in seconds. If not provided, the announcement does not expire.
  expiry?: integer
  // Master password required if public access is disabled.
  master_password?: string
}
```

#### Responses

- 200 Announcement set successfully

`application/json`

```ts
{
  message?: string
}
```

- 401 Invalid master password

`application/json`

```ts
{
  message?: string
}
```

- 403 Invalid secret for updating the announcement

`application/json`

```ts
{
  message?: string
}
```

## References