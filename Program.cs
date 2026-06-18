using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using LoudApi.Presentation;
using LoudApi.Workers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerUI();
    app.UseSwagger();
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.MapPresentationGateway();

var priorities = new List<Priorities>();
var nextPriorityId = 1;

app.MapGet("/Solicitation", () =>
{
    return Results.Ok(priorities);
});

app.MapGet("/Solicitation/{id:int}", (int id) =>
{
    var priority = priorities.FirstOrDefault(priority => priority.Id == id);

    return priority is null
        ? Results.NotFound()
        : Results.Ok(priority);
});

app.MapPost("/Response", (CreatePriorityRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest("Title is required.");
    }

    var priority = new Priorities
    {
        Id = nextPriorityId++,
        Title = request.Title.Trim(),
        Description = request.Description?.Trim(),
    };

    priorities.Add(priority);

    return Results.Created($"/Response/{priority.Id}", priority);
});

app.MapPut("/update/{id:int}", (int id, UpdatePriorityRequest request) =>
{
    var priority = priorities.FirstOrDefault(priority => priority.Id == id);

    if (priority is null)
    {
        return Results.NotFound();
    }

    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest("Title is required.");
    }

    priority.Title = request.Title.Trim();
    priority.Description = request.Description?.Trim();
    priority.IsDone = request.IsDone;

    return Results.Ok(priority);
});

app.MapDelete("/delete/{id:int}", (int id) =>
{
    var priority = priorities.FirstOrDefault(priority => priority.Id == id);

    if (priority is null)
    {
        return Results.NotFound();
    }

    priorities.Remove(priority);

    return Results.NoContent();
});

app.Run();

public record CreatePriorityRequest(string Title, string? Description);

public record UpdatePriorityRequest(string Title, string? Description, bool IsDone);
