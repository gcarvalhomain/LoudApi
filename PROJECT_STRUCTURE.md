# Project Structure

This project is separated by responsibility so each area is easy to find.

## Visual

Path: `wwwroot/visual/`

Purpose: visual system, CSS and future frontend assets.

- `wwwroot/visual/styles/nova-events.css`: NOVA EVENTS page styling, colors, layout, cards, responsive rules and image treatment.

## HTML

Path: `wwwroot/`

Purpose: public static files served by ASP.NET Core.

- `wwwroot/index.html`: the main NOVA EVENTS page markup. It stays here because `UseDefaultFiles()` serves `index.html` from `wwwroot` automatically.

## C# Backend

Path: `src/backend/`

Purpose: application startup, endpoints, models and services.

- `src/backend/Program.cs`: ASP.NET Core app setup, middleware and priorities endpoints.
- `src/backend/models/`: C# data models.
- `src/backend/services/`: application services.
- `src/backend/information/`: presentation/information endpoint models and routes.

## Information API

Path: `src/backend/information/`

Purpose: content returned by `/presentation`.

- `Informations.cs`: NOVA EVENTS content, event cards, palette and actions.
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
