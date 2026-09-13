using Microsoft.AspNetCore.Mvc;
using WeatherApp.Application.DTOs;
using WeatherApp.Application.Interfaces;

namespace WeatherApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class WeatherController : ControllerBase
{
    private readonly IWeatherService weatherService;

    public WeatherController(IWeatherService weatherService)
    {
        this.weatherService = weatherService;
    }

    [HttpGet("search")]
    [ProducesResponseType(typeof(IReadOnlyList<CitySearchResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyList<CitySearchResultDto>>> SearchCities(
        [FromQuery] string query,
        [FromQuery] string? language = null,
        CancellationToken cancellationToken = default)
    {
        var result = await weatherService.SearchCitiesAsync(query, language, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{cityName}")]
    [ProducesResponseType(typeof(WeatherResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WeatherResponseDto>> GetCurrentWeather(
        string cityName,
        CancellationToken cancellationToken = default)
    {
        var result = await weatherService.GetCurrentWeatherAsync(cityName, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{cityName}/forecast")]
    [ProducesResponseType(typeof(ForecastResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ForecastResponseDto>> GetForecast(
        string cityName,
        CancellationToken cancellationToken = default)
    {
        var result = await weatherService.GetForecastAsync(cityName, cancellationToken);
        return Ok(result);
    }
}