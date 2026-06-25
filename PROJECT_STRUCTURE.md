# Project Structure

This project is separated by responsibility so each area is easy to find.

## Visual

Path: `frontend/visual/`

Purpose: visual system, CSS and future frontend assets.

- `frontend/visual/styles/velotv-events.css`: VELO page styling, colors, layout, cards, responsive rules and image treatment.

## HTML

Path: `frontend/`

Purpose: frontend static files for the VELO page.

- `frontend/index.html`: the main VELO page markup.

## C# Backend

Path: `src/backend/`

Purpose: application startup, API features and shared services.

- `src/backend/Program.cs`: ASP.NET Core app setup, middleware and endpoint registration.
- `src/backend/priorities/`: priorities feature with endpoint mapping, request contracts and model.
- `src/backend/services/`: application service registration and presentation service.
- `src/backend/information/`: presentation/information endpoint models and routes.

## Priorities API

Path: `src/backend/priorities/`

Purpose: in-memory CRUD API returned by `/priorities`.

- `Priority.cs`: priority model.
- `PriorityRequests.cs`: create and update request contracts.
- `PrioritiesGateway.cs`: `/priorities` endpoint mapping.

## Information API

Path: `src/backend/information/`

Purpose: content returned by `/presentation`.

- `Informations.cs`: VELO content, event cards, palette and actions.
- `Gateway.cs`: `/presentation` endpoint mapping.
- `Queries.cs`: query object for section lookup.
- `Support.cs`: supporting records for visual sections, palette colors and actions.

## Configuration

Path: project root and `Properties/`

Purpose: .NET runtime settings.

- `LoudApi.csproj`: project/package configuration.
- `appsettings.json`: production app settings.
- `appsettings.Development.json`: development app settings.
- `Properties/launchSettings.json`: local run profiles and ports.
