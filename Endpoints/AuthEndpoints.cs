
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using LoudApi.Priorities;

namespace LoudApi.Priorities;

public static class AuthEndpoints
{
    private static readonly List<Priority> Priorities = [];
    private static int _nextPriorityId = 1;

    public static IEndpointRouteBuilder MapPrioritiesGateway(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints
            .MapGroup("/priorities")
            .WithTags("Priorities");

        group.MapGet("", () => Results.Ok(Priorities));

        group.MapGet("/{id:int}", (int id) =>
        {
            var priority = Priorities.FirstOrDefault(priority => priority.Id == id);
            if (priority is null)
            {
                return Results.NotFound(new ErrorResponse
                {
                    Message = "User not foud."
                });
            }

            return Results.Ok(priority);
        });

        group.MapPost("", (CreatePriorityRequest request) =>
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return Results.BadRequest(new ErrorResponse
                {
                    Message = "User not foud."
                });
            }

            var priority = new Priority
            {
                Id = _nextPriorityId++,
                Title = request.Title.Trim(),
                Description = request.Description?.Trim(),
            };

            Priorities.Add(priority);

            return Results.Created($"/priorities/{priority.Id}", priority);
        });

        group.MapPut("/{id:int}", (int id, UpdatePriorityRequest request) =>
        {
            var priority = Priorities.FirstOrDefault(priority => priority.Id == id);

            if (priority is null)
            {
                return Results.NotFound(new ErrorResponse
                {
                    Message = "User not foud."
                });
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

        group.MapDelete("{id:int}", (int id ) =>
        {
            var priority = Priorities.FirstOrDefault(priority => priority.Id == id);

            if (priority is null)
            {
                return Results.BadRequest(new ErrorResponse
                {
                  Message = "User not foud."  
                });
            }

            Priorities.Remove(priority);

            return Results.NoContent();
        });

        return endpoints;
    }
}
