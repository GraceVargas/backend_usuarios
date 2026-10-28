# Project Context

## Overview

This project is a backend API for user management.

The application is responsible for:

* User registration
* User login
* User authentication
* JWT-based authentication
* User data management

The project is built using Node.js and Express.

---

## Technology Stack

* Node.js
* Express
* MongoDB
* JSON Web Token (JWT)

---

## Project Structure

The project follows a layered architecture:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Models
   ↓
MongoDB
```

Authentication is handled through middleware:

```text
Request
   ↓
Auth Middleware
   ↓
Controller
   ↓
Service
   ↓
Model / MongoDB
```

### Main directories

#### `routes/`

Defines the API endpoints and connects routes with controllers.

#### `controllers/`

Responsible for handling HTTP requests and responses.

Controllers should delegate business logic to services.

#### `services/`

Contains the application's business logic and application rules.

Services coordinate models and external services when necessary.

#### `middleware/`

Contains Express middleware.

Authentication and JWT validation logic belongs here.

#### `config/`

Contains application and external-service configuration.

#### `models/`

Contains data models and data access logic.

---

# Authentication

The application uses JWT for authentication.

## Login flow

```text
Client
   ↓
POST /login
   ↓
Route
   ↓
Controller
   ↓
Service
   ↓
Validate user
   ↓
Generate JWT
   ↓
Return token
```

## Protected endpoint flow

```text
Client
   ↓
Authorization: Bearer <JWT>
   ↓
Auth Middleware
   ↓
Validate JWT
   ↓
Extract user information
   ↓
Controller
   ↓
Service
```

### Authentication rules

* Protected endpoints must use the authentication middleware.
* JWT validation must be handled by the authentication middleware.
* Controllers must not contain JWT validation logic.
* Do not duplicate authentication logic across controllers or services.
* Do not expose sensitive information in JWT payloads.
* Never expose passwords or sensitive credentials in API responses or logs.
* Reuse the existing authentication implementation before creating new authentication utilities.

---

# MongoDB

MongoDB is part of the application's data/backend infrastructure.

Before modifying MongoDB-related code:

1. Inspect the existing MongoDB configuration.
2. Identify how MongoDB is initialized.
3. Identify which services and models interact with MongoDB.
4. Reuse the existing MongoDB configuration and utilities.
5. Do not create multiple MongoDB initializations unnecessarily.

Never hardcode MongoDB credentials or secrets in source code.

Use the existing environment-variable and configuration mechanism.

---

# Coding Rules

Before implementing a new feature:

1. Inspect the existing architecture.
2. Identify related routes, controllers, services, middleware and models.
3. Reuse existing functions and utilities whenever possible.
4. Follow existing naming conventions.
5. Follow the existing project structure.
6. Avoid introducing unnecessary dependencies.
7. Do not restructure the application unless explicitly requested or clearly necessary.

---

# Controllers

Controllers are responsible for:

* Reading request data.
* Calling the appropriate service.
* Returning HTTP responses.
* Handling HTTP-specific concerns.

Controllers should NOT contain significant business logic.

---

# Services

Services are responsible for:

* Business logic.
* Application rules.
* Coordinating models and external services.
* Implementing business operations.

---

# Routes

Routes are responsible for:

* Defining API endpoints.
* Connecting endpoints with controllers.
* Applying the appropriate middleware.

---

# Middleware

Middleware is responsible for cross-cutting concerns such as:

* JWT authentication.
* Authorization when applicable.
* Request validation when applicable.

---

# Models

Models are responsible for:

* Representing application data.
* Data access operations.
* Interacting with MongoDB when applicable.

---

# API Changes

When adding or modifying an endpoint:

1. Inspect similar existing endpoints first.
2. Follow existing URL conventions.
3. Follow existing HTTP method conventions.
4. Use the existing controller/service/model architecture.
5. Apply authentication middleware when required.
6. Maintain consistent HTTP status codes.
7. Maintain the existing response structure.
8. Do not break existing endpoints unless explicitly requested.

---

# Error Handling

Follow the existing error-handling strategy.

Before introducing a new error-handling mechanism:

* Inspect how existing controllers and services handle errors.
* Reuse existing error utilities or middleware.
* Maintain consistent HTTP status codes.
* Maintain the existing response format.
* Do not expose stack traces or internal errors to clients.
* Do not expose credentials, tokens or other sensitive information.

---

# Environment Variables and Secrets

Never hardcode:

* JWT secrets
* MongoDB credentials
* API keys
* Passwords
* Private keys
* Other sensitive configuration

Use the existing environment-variable/configuration mechanism.

Never commit secrets to Git.

---

# Testing

When implementing a new feature:

1. Identify existing tests related to the functionality.
2. Add or update tests when appropriate.
3. Test successful scenarios.
4. Test failure scenarios.
5. Test authentication-protected endpoints when applicable.
6. Run the project's existing test commands.

Do not remove tests simply because they fail.

If expected behavior has intentionally changed, update the tests accordingly.

---

# Working Process

For non-trivial changes, follow this process.

## Step 1 — Analyze

First inspect the relevant code and documentation.

Do not modify files yet.

Identify:

* Existing implementation.
* Related routes.
* Controllers.
* Services.
* Middleware.
* Models.
* MongoDB interactions.
* Authentication flow.
* Existing tests.

## Step 2 — Plan

Before implementing a significant feature, provide a short implementation plan.

The plan should include:

* Files to modify.
* Files to create.
* Existing code that will be reused.
* API changes.
* MongoDB/data changes if applicable.
* Tests that should be added or modified.

## Step 3 — Implement

After the approach is clear, implement the feature.

Follow the existing architecture and coding conventions.

Avoid unrelated refactoring.

## Step 4 — Validate

After implementation:

* Run tests.
* Run linting if available.
* Review the modified files.
* Check for authentication/security issues.
* Check for unintended changes.

Report any problems that could not be resolved.

---

# Change Log

The project maintains a high-level change log in:

```text
CHANGELOG.md
```

Update `CHANGELOG.md` after completing a significant change.

The changelog should describe changes at a high level.

Do NOT list individual file changes or implementation details.

Update the changelog for:

* New features.
* New API endpoints.
* Significant changes to existing functionality.
* Authentication changes.
* MongoDB/integration changes.
* Significant bug fixes.
* Security-related changes.
* Relevant architectural changes.

Do NOT update the changelog for trivial changes such as:

* Variable renaming.
* Formatting.
* Minor refactoring.
* Small internal code cleanup.
* Comment changes.

Each entry should include:

* Date.
* Category.
* Short description.

Use these categories:

* Added
* Changed
* Fixed
* Removed
* Security

Example:

```md
## 2026-09-26

### Added

- Added user registration functionality.
- Added JWT authentication for protected endpoints.

### Changed

- Updated login flow to return authentication token.

### Fixed

- Fixed invalid credentials error handling.
```

---

# Documentation

Project documentation is located in:

```text
docs/
```

Recommended documentation structure:

```text
docs/
├── architecture/
├── database/
└── sequences/
```

Before implementing complex functionality, inspect the relevant documentation.

When a significant architectural decision is made, document it when appropriate.

---

# Git Safety

Use Git as the project's source-control and change-tracking system.

Before significant changes:

* Inspect the current Git status.
* Review existing changes before modifying files.
* Keep changes focused on the requested functionality.

Do NOT execute destructive commands such as:

```text
git reset --hard
git clean -fd
git push --force
```

unless explicitly requested by the user.

Do not discard existing user changes.

---

# General Principle

Prefer:

```text
Understand existing code
        ↓
Reuse existing patterns
        ↓
Make the smallest necessary change
        ↓
Test
        ↓
Review
        ↓
Update CHANGELOG.md
```

over:

```text
Rewrite
Refactor everything
Add unnecessary dependencies
Change unrelated code
```

The primary goal is to add functionality while preserving the existing architecture, behavior and stability of the application.
