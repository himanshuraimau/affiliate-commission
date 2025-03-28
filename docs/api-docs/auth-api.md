# Authentication API

Authentication is handled through cookies. The API provides endpoints for login, signup, checking current user, and logout.

## Login

Authenticates a user and creates a session.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Authentication Required**: No

### Request Body

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Success Response

```json
{
  "success": true,
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

### Error Response

```json
{
  "error": "Invalid credentials"
}
```

## Signup

Creates a new user account.

- **URL**: `/api/auth/signup`
- **Method**: `POST`
- **Authentication Required**: No

### Request Body

```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "securepassword"
}
```

### Success Response

```json
{
  "success": true,
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "New User",
    "email": "newuser@example.com"
  }
}
```

### Error Response

```json
{
  "error": "Email already registered"
}
```

## Get Current User

Retrieves information about the currently authenticated user.

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Authentication Required**: Yes

### Success Response

```json
{
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

### Error Response

```json
{
  "user": null
}
```

## Logout

Ends the current user session.

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Authentication Required**: Yes

### Success Response

```json
{
  "success": true
}
```

## Authentication Implementation

The system uses HTTP-only cookies for secure authentication. When a user logs in or signs up, a cookie named `user` is set with user information. This cookie is used to authenticate all subsequent requests.
