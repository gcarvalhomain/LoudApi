# VELO

VELO is a study and portfolio project built with ASP.NET Core and a static frontend. It presents a Counter-Strike 2 editorial experience while the backend is developed incrementally with clear, testable features.

## Requirements

- .NET 10 SDK
- Node.js for JavaScript regression tests
- PowerShell for structural regression tests

## Run locally

```powershell
dotnet restore LoudApi.slnx
dotnet run --project src/LoudApi.Api/LoudApi.Api.csproj
```

Open `http://localhost:5152` or `https://localhost:7058`.

Swagger is available in Development at `/swagger`. The API intentionally has no product endpoints until the first real backend feature is implemented.

## Build and test

```powershell
dotnet build LoudApi.slnx
dotnet test LoudApi.slnx
```

Frontend regression tests live under `frontend/tests/` and `frontend/visual/tests/`.

## Structure

- `frontend/`: static HTML, CSS, JavaScript, and visual assets.
- `src/LoudApi.Api/`: ASP.NET Core host and future feature-first backend.
- `tests/LoudApi.Api.Tests/`: backend integration tests.
- `docs/`: design specifications and implementation plans.

Future authentication will be designed separately and added as a real feature under `src/LoudApi.Api/Features/Authentication/`. No placeholder authentication code is kept in the repository.
