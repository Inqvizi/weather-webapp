using WeatherApp.Domain.ValueObjects;

namespace WeatherApp.Domain.Entities;

public sealed class WeatherForecast
{
    public Guid Id { get; }
    public City City { get; }
    public Temperature Temperature { get; }
    public Temperature FeelsLike { get; }
    public int Humidity { get; }
    public double WindSpeed { get; }
    public int WindDirection { get; }
    public int Pressure { get; }
    public int PrecipitationProbability { get; }
    public double UvIndex { get; }
    public string Sunrise { get; }
    public string Sunset { get; }
    public bool IsDay { get; }
    public int WeatherCode { get; }
    public string Description { get; }
    public string IconCode { get; }
    public DateTime ForecastDate { get; }

    private WeatherForecast(
        Guid id,
        City city,
        Temperature temperature,
        Temperature feelsLike,
        int humidity,
        double windSpeed,
        int windDirection,
        int pressure,
        int precipitationProbability,
        double uvIndex,
        string sunrise,
        string sunset,
        bool isDay,
        int weatherCode,
        string description,
        string iconCode,
        DateTime forecastDate)
    {
        Id = id;
        City = city;
        Temperature = temperature;
        FeelsLike = feelsLike;
        Humidity = humidity;
        WindSpeed = windSpeed;
        WindDirection = windDirection;
        Pressure = pressure;
        PrecipitationProbability = precipitationProbability;
        UvIndex = uvIndex;
        Sunrise = sunrise;
        Sunset = sunset;
        IsDay = isDay;
        WeatherCode = weatherCode;
        Description = description;
        IconCode = iconCode;
        ForecastDate = forecastDate;
    }

    public static WeatherForecast Create(
        City city,
        Temperature temperature,
        Temperature feelsLike,
        int humidity,
        double windSpeed,
        int pressure,
        string description,
        string iconCode,
        DateTime forecastDate,
        int windDirection = 0,
        int precipitationProbability = 0,
        double uvIndex = 0,
        string sunrise = "",
        string sunset = "",
        bool isDay = true,
        int weatherCode = 0)
    {
        ArgumentNullException.ThrowIfNull(city);
        ArgumentNullException.ThrowIfNull(temperature);
        ArgumentNullException.ThrowIfNull(feelsLike);

        if (humidity is < 0 or > 100)
        {
            throw new ArgumentOutOfRangeException(nameof(humidity), "Humidity must be between 0 and 100");
        }

        if (windSpeed < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(windSpeed), "Wind speed cannot be negative");
        }

        if (pressure < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(pressure), "Pressure cannot be negative");
        }

        if (string.IsNullOrWhiteSpace(description))
        {
            throw new ArgumentException("Description cannot be empty", nameof(description));
        }

        return new WeatherForecast(
            Guid.NewGuid(),
            city,
            temperature,
            feelsLike,
            humidity,
            windSpeed,
            Math.Clamp(windDirection, 0, 360),
            pressure,
            Math.Clamp(precipitationProbability, 0, 100),
            Math.Max(0, uvIndex),
            sunrise?.Trim() ?? string.Empty,
            sunset?.Trim() ?? string.Empty,
            isDay,
            weatherCode,
            description.Trim(),
            iconCode?.Trim() ?? string.Empty,
            forecastDate);
    }
}

