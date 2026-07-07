using LoudApi.Workers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace LoudApi.Presentation;

public static class Gateway
{
    public static IEndpointRouteBuilder MapPresentationGateway(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints
            .MapGroup("/presentation")
            .WithTags("Presentation");

        group.MapGet("/", static (Services.ILoudPresentationService service) =>
            Results.Ok(service.GetPresentation()));

        group.MapGet("/{section}", static (string section, Services.ILoudPresentationService service) =>
        {
            var presentation = service.GetSection(new PresentationQuery(section));
            return presentation is null ? Results.NotFound() : Results.Ok(presentation);
        });

        return endpoints;
    }
}
