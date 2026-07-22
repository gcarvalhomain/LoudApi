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
