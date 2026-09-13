using WeatherApp.Api.Middleware;
using WeatherApp.Application.Interfaces;
using WeatherApp.Application.Mappings;
using WeatherApp.Application.Services;
using WeatherApp.Application.Validators;
using WeatherApp.Infrastructure;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddAutoMapper(cfg => cfg.AddMaps(typeof(WeatherMappingProfile).Assembly));
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddScoped<IWeatherService, WeatherService>();
builder.Services.AddScoped<CityNameValidator>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowAngular");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.MapControllers();
app.Run();
