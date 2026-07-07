using WeatherApp.Application.Interfaces;
using WeatherApp.Application.Mappings;
using WeatherApp.Application.Services;
using WeatherApp.Application.Validators;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddAutoMapper(cfg => cfg.AddMaps(typeof(WeatherMappingProfile).Assembly));

builder.Services.AddScoped<IWeatherService, WeatherService>();
builder.Services.AddScoped<CityNameValidator>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.Run();
