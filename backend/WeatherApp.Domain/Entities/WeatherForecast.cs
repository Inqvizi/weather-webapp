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
    public int Pressure { get; }
    public string Description { get; }
    public string IconCode { get; }
    public DateTime ForecastDate { get; }

    private WeatherForecast(Guid id, City city, Temperature temperature, Temperature feelsLike, int humidity, double windSpeed, int pressure, string description, string iconCode, DateTime forecastDate)
    {
        Id = id;
        City = city;
        Temperature = temperature;
        FeelsLike = feelsLike;
        Humidity = humidity;
        WindSpeed = windSpeed;
        Pressure = pressure;
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
        DateTime forecastDate)
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
            pressure,
            description.Trim(),
            iconCode?.Trim() ?? string.Empty,
            forecastDate);
    }
}
