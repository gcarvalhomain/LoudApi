using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using LoudApi.Presentation;
using LoudApi.Priorities;
using LoudApi.Workers;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = "frontend",
});

builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Services.AddLoudPresentationServices();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwaggerUI();
    app.UseSwagger();
    app.MapOpenApi();
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseHttpsRedirection();
app.MapPresentationGateway();
app.MapPrioritiesGateway();

app.Run();
