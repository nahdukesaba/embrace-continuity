# Authentication

## Philosophy

Authentication answers

Who are you?

Authorization answers

What may you do?

Treat them separately.

---

## Login Flow

User

↓

Login Form

↓

API

↓

JWT

↓

Stored Session

↓

Authenticated State

↓

Protected Routes

The frontend should never manufacture authentication state.

---

## Session Ownership

Backend owns session validity.

Frontend owns session presentation.

Expired tokens should always defer to backend response.

---

## Protected Routes

A protected page assumes

authentication exists

It should never assume

authorization exists.

Authorization should still be verified by backend.

---

## Permission Checks

UI may hide unavailable actions.

Backend must enforce permissions.

Never trust hidden buttons.

---

## Logout

Logout should clear

query cache

authentication store

temporary user data

navigation state if required

The application should return to a clean unauthenticated state.

---

## Token Handling

Authentication tokens should remain centralized.

Never duplicate storage logic.

Never manually append tokens throughout the application.

The API client should own authorization headers.

---

## Password Management

Authenticated users can change their password from the account menu. The
frontend validates the current password, new password, and confirmation before
calling `PUT /auth/password` with `{ oldPassword, newPassword }` through the
shared API client.

Administrators can reset an approved user's password from Manage Users after a
confirmation. This calls `PUT /auth/reset` with `{ userId }`. Both requests use
the API client's centralized bearer-token interceptor; the backend remains
responsible for authorization and password policy.

---

## Future Expansion

Support for

multiple roles

organizations

departments

feature flags

should integrate into the existing authentication architecture.

Avoid redesigning authentication later.
