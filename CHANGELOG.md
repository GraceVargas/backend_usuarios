# Changelog

This file contains a high-level history of significant changes made to the application.

Changes are grouped by date and categorized as:

* Added
* Changed
* Fixed
* Removed
* Security

---

## 2026-10-28

### Added

* Added project README describing setup, authentication and every exposed endpoint.
* Added logout: closing a session immediately invalidates its token in this API.

### Security

* Listing, viewing and deactivating other users is now restricted to administrators; any authenticated user can still view their own profile.
* Internal server errors no longer expose error details to clients; they are logged on the server instead.
* Tokens issued before this change are no longer accepted; users need to log in again.

### Fixed

* Fixed deployment on Vercel, where every request returned a 500 error.

---

## 2026-10-27

### Added

* Added administrator-only endpoint to register professionals and administrators with a generated temporary password.
* Added internal endpoint for the appointments service to look up a user, authenticated with a shared API key.

### Changed

* Requests with an invalid or expired token are now rejected as unauthorized (401) instead of forbidden (403).

---

## 2026-10-25

### Changed

* API routes aligned with the documented login and registration sequences: login is now `POST /sesiones`, public registration is `POST /usuarios`, and user endpoints live under `/usuarios`.
* Registration now returns an authentication token, so a new client is logged in right after signing up.
* Authentication tokens now carry the user's role instead of their email.

### Removed

* Removed the separate authenticated user-creation endpoint; registration goes through `POST /usuarios`.

---

## 2026-10-03

### Changed

* Login now reports disabled accounts explicitly, only after the password has been verified.
* User roles aligned with the documented model: client, professional and administrator.

---

## 2026-09-28

### Changed

* Migrated the data layer from Firebase to MongoDB.
* Login now validates credentials against registered users stored in the database.
* Deleting a user now deactivates the account instead of removing it; inactive users cannot log in and are no longer returned by the API.
* The application now starts only after the database connection is established.

### Added

* Added public user registration endpoint.
* Added endpoint to retrieve the authenticated user's own profile.
* Added clearer error responses for duplicate emails and invalid user data.

### Removed

* Removed the Firebase configuration and its environment variables.
* Removed the hardcoded default login user.

### Fixed

* Fixed server startup failures caused by missing routes and services.
* Fixed protected endpoints failing with an internal error when the authorization header is missing.

### Security

* User passwords are now stored hashed and are never included in API responses.

---

## 2026-09-26

### Project Setup

* Added project documentation structure for Claude Code.
* Added development guidelines and architecture context.
* Added high-level change tracking.
