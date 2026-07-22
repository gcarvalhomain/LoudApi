# Backend Foundation Cleanup Design

## Objective

Remove the placeholder backend and reorganize the ASP.NET application into a small, professional foundation for future study and portfolio work. Preserve the frontend exactly as it is and do not implement authentication in this change.

## Scope

This change will:

- keep `frontend/` isolated at the repository root and leave its HTML, CSS, JavaScript, content, and appearance unchanged;
- move the ASP.NET application into `src/LoudApi.Api/`;
- add a solution file at the repository root;
- remove the placeholder `/presentation` and `/priorities` APIs and every model, DTO, response, and service used only by them;
- remove unused Entity Framework packages;
- retain the minimal ASP.NET host, static-file serving, HTTPS redirection, and Swagger/OpenAPI support;
- update repository documentation and sample commands to match the new structure;
- add focused infrastructure tests that prove the host starts, the frontend remains available, and removed endpoints return `404`.

This change will not:

- implement registration, login, users, passwords, JWTs, refresh tokens, authorization, or logout;
- add a database or migrations;
- create empty feature folders, placeholder authentication classes, or speculative abstractions;
- change frontend files or introduce new product behavior.

## Architecture

The repository will use one ASP.NET project with feature-first organization:

```text
LoudApi/
|-- frontend/
|-- src/
|   `-- LoudApi.Api/
|       |-- Properties/
|       |-- Program.cs
|       |-- LoudApi.Api.csproj
|       |-- appsettings.json
|       `-- appsettings.Development.json
|-- tests/
|   `-- LoudApi.Api.Tests/
|-- docs/
|-- LoudApi.slnx
`-- README.md
```

Feature folders will be added only when their first real implementation exists. Future authentication will live under `Features/Authentication`, but that directory and its code are outside this change.

The frontend remains outside the API project. The API host will explicitly resolve `frontend/` as its web root so existing public URLs remain unchanged during local development.

## Runtime Behavior

`Program.cs` remains the single composition root. It will configure OpenAPI/Swagger for future endpoints, serve the existing static frontend, redirect HTTP to HTTPS according to ASP.NET configuration, and start the host.

There will be no application API endpoints after the cleanup. Requests to `/presentation`, `/priorities`, and their child routes will receive the normal ASP.NET `404` response. Static pages and assets will keep their current routes.

## Error Handling and Security

No custom API error contract will remain because there are no application endpoints that need one. The host will use standard ASP.NET behavior for missing routes.

The change introduces no credentials, secrets, authentication configuration, database connection strings, or security-sensitive business logic. Package references will be minimized and checked for known vulnerabilities. Authentication security decisions will be designed separately when that feature begins.

## Testing and Verification

Verification will include:

1. build the solution with zero errors;
2. run the backend test suite;
3. prove the application host starts in a test environment;
4. verify the homepage remains available through the ASP.NET host;
5. verify `/presentation` and `/priorities` return `404`;
6. run all existing frontend regression tests without modifying their fixtures;
7. start the application normally and verify representative frontend pages and assets return HTTP `200`;
8. scan direct and transitive NuGet dependencies for known vulnerabilities;
9. inspect the final diff to confirm no file under `frontend/` changed.

## Git Scope

The implementation will stay on `refactor/organize-backend-foundation`. Commits will separate the approved design, structural cleanup, and verification-related changes where practical, keeping the history readable for portfolio review.
