# Organize Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the placeholder backend and leave a tested, feature-first ASP.NET foundation without changing or starting authentication.

**Architecture:** Keep the existing static frontend isolated at the repository root and move the single ASP.NET host to `src/LoudApi.Api`. The host remains the composition root for static files and OpenAPI, while real feature folders are deferred until their first implementation. A separate xUnit project verifies startup, frontend delivery, and removal of obsolete routes.

**Tech Stack:** .NET 10, ASP.NET Core minimal hosting, Swagger/OpenAPI, xUnit, `Microsoft.AspNetCore.Mvc.Testing`

## Global Constraints

- Do not modify production files under `frontend/`; the only allowed frontend change is the approved stale-selector correction in `frontend/visual/tests/teams-lightweight-background.test.ps1`.
- Do not add registration, login, users, passwords, JWTs, refresh tokens, authorization, logout, a database, or migrations.
- Do not create empty feature folders, placeholder authentication classes, or speculative abstractions.
- Keep the frontend's current public URLs and visual behavior unchanged.
- Keep all work on `refactor/organize-backend-foundation`.
- Builds and tests must complete with zero errors.
- Direct and transitive NuGet dependencies must report no known vulnerabilities.

---

## Target File Map

- `LoudApi.slnx`: solution entry point for the API and tests.
- `src/LoudApi.Api/Program.cs`: application composition root and frontend web-root resolution.
- `src/LoudApi.Api/LoudApi.Api.csproj`: minimal production dependencies.
- `src/LoudApi.Api/Properties/launchSettings.json`: local HTTP/HTTPS profiles.
- `src/LoudApi.Api/appsettings.json`: shared host settings.
- `src/LoudApi.Api/appsettings.Development.json`: development host settings.
- `tests/LoudApi.Api.Tests/LoudApi.Api.Tests.csproj`: integration-test dependencies and API reference.
- `tests/LoudApi.Api.Tests/ApplicationSmokeTests.cs`: host, frontend, and removed-route contract tests.
- `README.md`: current setup, run, test, and repository guidance.
- `PROJECT_STRUCTURE.md`: feature-first structure and boundaries.

The root `Program.cs`, `LoudApi.csproj`, `LoudApi.http`, `Properties/`, `appsettings*.json`, `Endpoints/`, `Services/`, `Models/`, `Dtos/`, and `Responses/` are removed after their required host/configuration files are relocated.

### Task 0: Repair the stale Teams regression assertion

**Files:**
- Modify: `frontend/visual/tests/teams-lightweight-background.test.ps1`

**Interfaces:**
- Consumes: current `.teams-overview` and `.player-ranking-section` CSS selectors.
- Produces: a regression test aligned with the already-approved Teams markup, without production frontend changes.

- [x] **Step 1: Reproduce the stale selector failure**

Run: `powershell -ExecutionPolicy Bypass -File frontend/visual/tests/teams-lightweight-background.test.ps1`

Observed: FAIL because the test expected `.teams-page > .surface:first-of-type`, which stopped matching after the existing intro-transition wrapper was introduced.

- [x] **Step 2: Target stable semantic selectors**

Replace the two positional selectors with:

```powershell
$teamsBlock = Get-CssBlock '\.teams-page\s+\.teams-overview'
$rankingBlock = Get-CssBlock '\.teams-page\s*>\s*\.player-ranking-section'
```

- [ ] **Step 3: Verify the repaired regression test**

Run: `powershell -ExecutionPolicy Bypass -File frontend/visual/tests/teams-lightweight-background.test.ps1`

Expected: PASS with `Teams lightweight background checks passed.`

- [ ] **Step 4: Commit the isolated test correction**

```powershell
git add frontend/visual/tests/teams-lightweight-background.test.ps1 docs/superpowers/specs/2026-07-22-backend-foundation-cleanup-design.md docs/superpowers/plans/2026-07-22-organize-backend-foundation.md
git commit -m "test: align teams background regression"
```

### Task 1: Lock the required runtime behavior with integration tests

**Files:**
- Create: `tests/LoudApi.Api.Tests/LoudApi.Api.Tests.csproj`
- Create: `tests/LoudApi.Api.Tests/ApplicationSmokeTests.cs`
- Delete generated file: `tests/LoudApi.Api.Tests/UnitTest1.cs`
- Modify temporarily: `LoudApi.csproj` (exclude nested test sources until the root project is removed)

**Interfaces:**
- Consumes: current ASP.NET entry point `Program` and current static frontend route `/`.
- Produces: executable contracts requiring `/` to return `200` and placeholder routes to return `404`.

- [ ] **Step 1: Scaffold the test project without restoring packages**

Run:

```powershell
dotnet new xunit --name LoudApi.Api.Tests --output tests/LoudApi.Api.Tests --framework net10.0 --no-restore
dotnet add tests/LoudApi.Api.Tests/LoudApi.Api.Tests.csproj reference LoudApi.csproj
dotnet add tests/LoudApi.Api.Tests/LoudApi.Api.Tests.csproj package Microsoft.AspNetCore.Mvc.Testing --version 10.0.0 --no-restore
```

Expected: the xUnit project exists and references the current API project before it is relocated.

- [ ] **Step 2: Replace the generated test with the required failing contracts**

Delete `tests/LoudApi.Api.Tests/UnitTest1.cs` and create `tests/LoudApi.Api.Tests/ApplicationSmokeTests.cs`:

```csharp
using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LoudApi.Api.Tests;

public sealed class ApplicationSmokeTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApplicationSmokeTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("https://localhost"),
        });
    }

    [Fact]
    public async Task Homepage_RemainsAvailable()
    {
        using var response = await _client.GetAsync("/");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/html", response.Content.Headers.ContentType?.MediaType);
    }

    [Theory]
    [InlineData("/presentation")]
    [InlineData("/presentation/hero")]
    [InlineData("/priorities")]
    [InlineData("/priorities/1")]
    public async Task PlaceholderRoutes_AreNotExposed(string route)
    {
        using var response = await _client.GetAsync(route);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
```

- [ ] **Step 3: Run the tests and confirm the pre-cleanup state fails**

Because the current SDK project is at the repository root, first exclude the nested test sources from its default compile glob:

```xml
<ItemGroup>
  <Compile Remove="tests\**\*.cs" />
</ItemGroup>
```

Run:

```powershell
dotnet test tests/LoudApi.Api.Tests/LoudApi.Api.Tests.csproj
```

Expected: FAIL with `Expected: NotFound` and `Actual: OK` for the obsolete routes because the placeholder backend is still exposed.

- [ ] **Step 4: Commit the contract tests**

```powershell
git add tests/LoudApi.Api.Tests LoudApi.csproj docs/superpowers/plans/2026-07-22-organize-backend-foundation.md
git commit -m "test: define backend foundation behavior"
```

### Task 2: Replace the placeholder backend with the minimal host

**Files:**
- Create: `src/LoudApi.Api/Program.cs`
- Create: `src/LoudApi.Api/LoudApi.Api.csproj`
- Move: `Properties/launchSettings.json` to `src/LoudApi.Api/Properties/launchSettings.json`
- Move: `appsettings.json` to `src/LoudApi.Api/appsettings.json`
- Move: `appsettings.Development.json` to `src/LoudApi.Api/appsettings.Development.json`
- Modify: `tests/LoudApi.Api.Tests/LoudApi.Api.Tests.csproj`
- Delete: `Program.cs`
- Delete: `LoudApi.csproj`
- Delete: `LoudApi.http`
- Delete: `Endpoints/Gateway.cs`
- Delete: `Endpoints/AuthEndpoints.cs`
- Delete: `Services/AuthService.cs`
- Delete: `Models/Informations.cs`
- Delete: `Models/Support.cs`
- Delete: `Dtos/Queries.cs`
- Delete: `Dtos/PriorityRequests.cs`
- Delete: `Dtos/Priority.cs`
- Delete: `Responses/ErrorResponse.cs`

**Interfaces:**
- Consumes: the repository-root `frontend/` directory and ASP.NET configuration files.
- Produces: public `Program`, a minimal `LoudApi.Api` host, unchanged static routes, and no application API routes.

- [ ] **Step 1: Create the minimal API project**

Create `src/LoudApi.Api/LoudApi.Api.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="10.0.3" />
    <!-- Overrides the vulnerable Microsoft.OpenApi version resolved transitively by Swagger. -->
    <PackageReference Include="Microsoft.OpenApi" Version="2.7.5" />
    <PackageReference Include="Swashbuckle.AspNetCore.SwaggerGen" Version="10.0.0" />
    <PackageReference Include="Swashbuckle.AspNetCore.SwaggerUI" Version="10.0.0" />
  </ItemGroup>
</Project>
```

This removes `Microsoft.EntityFrameworkCore` and `Microsoft.EntityFrameworkCore.Design`. The direct `Microsoft.OpenApi` reference remains as an explicit security pin because Swagger otherwise resolves the vulnerable transitive version `2.3.0`.

- [ ] **Step 2: Create the minimal composition root**

Create `src/LoudApi.Api/Program.cs`:

```csharp
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = FindFrontendPath(),
});

builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseHttpsRedirection();

app.Run();

static string FindFrontendPath()
{
    for (var directory = new DirectoryInfo(AppContext.BaseDirectory);
         directory is not null;
         directory = directory.Parent)
    {
        var candidate = Path.Combine(directory.FullName, "frontend");
        if (Directory.Exists(candidate))
        {
            return candidate;
        }
    }

    throw new DirectoryNotFoundException(
        "The frontend directory could not be found from the application base path.");
}

public partial class Program;
```

- [ ] **Step 3: Relocate host configuration without changing its values**

Move the three existing configuration files to their target paths. Do not modify their JSON content:

```text
Properties/launchSettings.json
  -> src/LoudApi.Api/Properties/launchSettings.json
appsettings.json
  -> src/LoudApi.Api/appsettings.json
appsettings.Development.json
  -> src/LoudApi.Api/appsettings.Development.json
```

- [ ] **Step 4: Point the tests at the relocated API**

In `tests/LoudApi.Api.Tests/LoudApi.Api.Tests.csproj`, replace:

```xml
<ProjectReference Include="..\..\LoudApi.csproj" />
```

with:

```xml
<ProjectReference Include="..\..\src\LoudApi.Api\LoudApi.Api.csproj" />
```

- [ ] **Step 5: Remove the placeholder backend and obsolete HTTP sample**

Delete only the root files and C# feature files listed in this task. After deletion, `rg --files Endpoints Services Models Dtos Responses` must return no files and those empty directories must be absent.

- [ ] **Step 6: Run the integration tests**

Run:

```powershell
dotnet test tests/LoudApi.Api.Tests/LoudApi.Api.Tests.csproj
```

Expected: PASS; homepage is HTML with `200`, and all four obsolete URLs return `404`.

- [ ] **Step 7: Commit the backend replacement**

```powershell
git add src tests/LoudApi.Api.Tests Program.cs LoudApi.csproj LoudApi.http Properties appsettings.json appsettings.Development.json Endpoints Services Models Dtos Responses
git commit -m "refactor: replace placeholder backend foundation"
```

### Task 3: Add the solution and align project documentation

**Files:**
- Create: `LoudApi.slnx`
- Modify: `README.md`
- Modify: `PROJECT_STRUCTURE.md`

**Interfaces:**
- Consumes: `src/LoudApi.Api/LoudApi.Api.csproj` and `tests/LoudApi.Api.Tests/LoudApi.Api.Tests.csproj`.
- Produces: one root build entry point and accurate portfolio documentation.

- [ ] **Step 1: Create the root solution and register both projects**

Run:

```powershell
dotnet new sln --name LoudApi --format slnx
dotnet sln LoudApi.slnx add src/LoudApi.Api/LoudApi.Api.csproj
dotnet sln LoudApi.slnx add tests/LoudApi.Api.Tests/LoudApi.Api.Tests.csproj
```

Expected: `dotnet sln LoudApi.slnx list` reports exactly the API and test projects.

- [ ] **Step 2: Replace README with current, interview-ready guidance**

Replace `README.md` with:

````markdown
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
````

- [ ] **Step 3: Replace the structure guide**

Replace `PROJECT_STRUCTURE.md` with:

````markdown
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
````

- [ ] **Step 4: Build and test through the solution**

Run:

```powershell
dotnet restore LoudApi.slnx --disable-parallel -m:1
dotnet build LoudApi.slnx --no-restore --warnaserror -m:1
dotnet test LoudApi.slnx --no-build --no-restore -m:1
```

Expected: restore succeeds; build has zero warnings and errors; all backend tests pass.

- [ ] **Step 5: Commit the solution and documentation**

```powershell
git add LoudApi.slnx README.md PROJECT_STRUCTURE.md
git commit -m "docs: align backend foundation structure"
```

### Task 4: Run full regression, runtime, and security verification

**Files:**
- Verify only: `frontend/`
- Verify only: `src/LoudApi.Api/`
- Verify only: `tests/LoudApi.Api.Tests/`

**Interfaces:**
- Consumes: completed solution and all existing regression suites.
- Produces: evidence that the cleanup is buildable, visually neutral, and free of known NuGet vulnerabilities.

- [ ] **Step 1: Run every existing JavaScript regression test**

Run:

```powershell
node --test frontend/tests/teams-hero-scroll-transition.test.js
node --test frontend/tests/inner-page-intro-transition.test.cjs
node --test frontend/tests/home-about-scroll.test.cjs
```

Expected: all JavaScript tests pass.

- [ ] **Step 2: Run every existing PowerShell regression test**

Run:

```powershell
Get-ChildItem frontend/tests,frontend/visual/tests -Filter *.ps1 | ForEach-Object { & powershell -ExecutionPolicy Bypass -File $_.FullName; if ($LASTEXITCODE -ne 0) { throw "Failed: $($_.FullName)" } }
```

Expected: every PowerShell test exits with code `0`.

- [ ] **Step 3: Start the relocated host and verify real HTTP routes**

Run this complete script so only the process started by the verification is stopped:

```powershell
$existingListener = Get-NetTCPConnection -LocalPort 5152 -State Listen -ErrorAction SilentlyContinue
if ($existingListener) {
    throw "Port 5152 is already in use; stop the existing listener before verification."
}

$process = Start-Process dotnet -ArgumentList @('run','--project','src/LoudApi.Api/LoudApi.Api.csproj','--no-build','--launch-profile','http') -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru

try {
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        try {
            $home = Invoke-WebRequest http://localhost:5152/ -UseBasicParsing
            $ready = $home.StatusCode -eq 200
            if ($ready) { break }
        }
        catch {
            Start-Sleep -Milliseconds 500
        }
    }

    if (-not $ready) {
        throw "The API did not become ready on port 5152."
    }

    $successfulRoutes = @(
        'http://localhost:5152/',
        'http://localhost:5152/teams.html',
        'http://localhost:5152/visual/styles/velotv-events.css'
    )

    foreach ($route in $successfulRoutes) {
        $response = Invoke-WebRequest $route -UseBasicParsing
        if ($response.StatusCode -ne 200) {
            throw "Expected 200 from $route but received $($response.StatusCode)."
        }
    }

    foreach ($route in @('http://localhost:5152/presentation', 'http://localhost:5152/priorities')) {
        try {
            Invoke-WebRequest $route -UseBasicParsing | Out-Null
            throw "Expected 404 from $route but the request succeeded."
        }
        catch {
            $statusCode = [int]$_.Exception.Response.StatusCode
            if ($statusCode -ne 404) {
                throw "Expected 404 from $route but received $statusCode."
            }
        }
    }
}
finally {
    if ($process -and -not $process.HasExited) {
        Stop-Process -Id $process.Id
        Wait-Process -Id $process.Id -ErrorAction SilentlyContinue
    }
}
```

Expected: the three frontend routes return `200`, the two removed routes return `404`, and the process started by the script is stopped.

- [ ] **Step 4: Scan NuGet dependencies**

Run:

```powershell
dotnet list LoudApi.slnx package --vulnerable --include-transitive
```

Expected: NuGet reports no vulnerable packages for either project.

- [ ] **Step 5: Prove the frontend is untouched and inspect repository state**

Run:

```powershell
git diff --exit-code main -- frontend ':!frontend/visual/tests/teams-lightweight-background.test.ps1'
git diff --check main
git status --short
git log --oneline main..HEAD
```

Expected: no production frontend diff exists; the only allowed frontend diff is the approved Teams regression-test correction; `git diff --check` reports no whitespace errors; the worktree is clean; branch history contains the design, tests, refactor, and documentation commits only.

- [ ] **Step 6: Perform the final build-and-test gate**

Run:

```powershell
dotnet build LoudApi.slnx --no-restore --warnaserror -m:1
dotnet test LoudApi.slnx --no-build --no-restore -m:1
```

Expected: zero warnings and errors, with all backend tests passing.
