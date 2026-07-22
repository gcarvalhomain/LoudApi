# Project Structure

VELO uses a small feature-first ASP.NET structure. Directories are created when real code needs them; empty architecture layers and placeholder features are avoided.

```text
LoudApi/
|-- frontend/
|-- src/
|   `-- LoudApi.Api/
|-- tests/
|   `-- LoudApi.Api.Tests/
|-- docs/
`-- LoudApi.slnx
```

## Frontend

`frontend/` is the isolated static web application. The ASP.NET host serves this directory without requiring frontend files to live inside the backend project.

## Backend

`src/LoudApi.Api/` contains the application host. `Program.cs` is the composition root for middleware, services, and endpoint registration.

Backend functionality follows feature-first organization. For example, authentication will eventually live in `Features/Authentication/`, with files grouped by that feature rather than by generic technical layers. The folder will be introduced only when authentication implementation begins.

## Tests

`tests/LoudApi.Api.Tests/` contains backend integration tests. Frontend regression tests remain beside the frontend under `frontend/tests/` and `frontend/visual/tests/`.

## Documentation

`docs/superpowers/specs/` records approved designs. `docs/superpowers/plans/` records implementation plans.
